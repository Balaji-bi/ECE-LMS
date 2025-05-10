import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

// Initialize the Gemini API with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Set some default configuration 
const geminiConfig = { 
  model: "gemini-1.5-pro", // Gemini model name - verified working model
  generationConfig: {
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
};

// Constants for book references
const BOOK_REFERENCES = {
  "EC3251": {
    title: "Engineering Circuit Analysis",
    author: "Hayt Jack Kemmerly, Steven Durbin",
    publication: "Mc Graw Hill education, 9th Edition, 2018",
    path: "Hayt Jack Kemmerly, Steven Durbin, Engineering Circuit Analysis,Mc Graw Hill education, 9th Edition, 2018..pdf"
  }
};

// Knowledge levels for academic assistant
type KnowledgeLevel = "R" | "U" | "AP" | "AN" | "E" | "C";

interface AcademicQuery {
  topic: string;
  knowledgeLevel?: KnowledgeLevel;
  subject?: string;
  book?: string;
  generateImage?: boolean;
  showRecommendedResources?: boolean;
  imageData?: string;
}

// Helper function to determine the source information based on the query
function getSourceInfo(query: AcademicQuery): { usesInternet: boolean; usesBookReferences: boolean; bookSources: string[] } {
  const usesInternet = !!query.knowledgeLevel || !!query.showRecommendedResources;
  const usesBookReferences = true; // We always use book references
  
  let bookSources: string[] = [];
  
  // If a specific book is mentioned
  if (query.book) {
    bookSources.push(query.book);
  } 
  // If a subject is mentioned but no specific book
  else if (query.subject) {
    // Add all books for that subject
    if (query.subject === "EC3251" && BOOK_REFERENCES["EC3251"]) {
      const book = BOOK_REFERENCES["EC3251"];
      bookSources.push(`${book.title} by ${book.author}`);
    }
  }
  
  // If no specific sources, add generic placeholder
  if (bookSources.length === 0) {
    bookSources.push("Relevant ECE textbooks");
  }
  
  return {
    usesInternet,
    usesBookReferences,
    bookSources
  };
}

// Create a router
export const chatbotRouter = Router();

// Helper function to prepare academic chat model prompt
function prepareAcademicPrompt(query: AcademicQuery) {
  // Determine the source based on the logic in the prompt
  let dataSource = "";
  let useInternet = false;
  let bookSpecifics = "";
  
  // Follow the exact data source selection logic from the requirements
  if (query.knowledgeLevel) {
    // Logic point 1, 2, and 3 from requirements: If knowledge level is selected
    useInternet = true;
    
    if (query.subject && query.book) {
      // Case 3: Knowledge Level + Subject + Book = Internet + That specific book
      dataSource = `Internet + Specific book (${query.book})`;
      bookSpecifics = `Use that specific book: ${query.book} with internet sources`;
    } else if (query.subject) {
      // Case 2: Knowledge Level + Subject (no book) = Internet + All books from subject
      dataSource = `Internet + All books from ${query.subject}`;
      bookSpecifics = `Use all available books under ${query.subject} with internet sources`;
    } else {
      // Case 1: Knowledge Level only = Internet + All books
      dataSource = "Internet + All available books";
      bookSpecifics = "Use internet and all available books as references";
    }
  } else {
    // No knowledge level selected
    
    if (query.subject && query.book) {
      // Case 5: Subject + Book (no Knowledge Level) = Only the selected book (NO internet)
      dataSource = `Only the selected book (${query.book})`;
      bookSpecifics = `Use ONLY the book: ${query.book}. DO NOT use internet sources for answers.`;
      useInternet = false;
    } else if (query.subject) {
      // Case 4: Subject only (no Knowledge Level or book) = All books under subject (NO internet)
      dataSource = `All books under ${query.subject} subject`;
      bookSpecifics = `Use ONLY books related to ${query.subject}. DO NOT use internet sources for answers.`;
      useInternet = false;
    } else if (query.book) {
      // Case 6: Book only (no Knowledge Level or subject) = Only that book (NO internet)
      dataSource = `Only the selected book (${query.book})`;
      bookSpecifics = `Use ONLY the book: ${query.book}. DO NOT use internet sources for answers.`;
      useInternet = false;
    } else {
      // Case 7: No knowledge level + subject + Book = All books where topic belongs
      dataSource = "All books where the topic belongs";
      bookSpecifics = "Use ONLY books related to the subject where this topic belongs. DO NOT use internet sources for answers.";
      useInternet = false;
    }
  }
  
  // If resources are requested, we can use internet just for resources regardless of other settings
  if (query.showRecommendedResources) {
    useInternet = true;
    if (!dataSource.includes("Internet")) {
      dataSource += " + Internet for recommended learning resources only";
    }
  }
  
  // Get the specific reference for EC3251 if that's the subject or book
  let specificBookReference = "";
  if ((query.subject === "EC3251" || query.book?.includes("Circuit Analysis")) && BOOK_REFERENCES["EC3251"]) {
    const bookRef = BOOK_REFERENCES["EC3251"];
    specificBookReference = `
    For Circuit Analysis (EC3251), use this specific textbook:
    Title: ${bookRef.title}
    Author: ${bookRef.author}
    Publication: ${bookRef.publication}
    `;
  }
  
  // Generate the question based on knowledge level
  let generatedQuestion = "";
  let knowledgeLevelExplanation = "";
  if (query.knowledgeLevel) {
    switch(query.knowledgeLevel) {
      case "R": // Remember
        knowledgeLevelExplanation = "Generate a question like recalling some definition, statement, or description of the concept.";
        generatedQuestion = `Recall the definition, statement, or description of "${query.topic}".`;
        break;
      case "U": // Understand
        knowledgeLevelExplanation = "Generate a question like 'Write briefly what you understand about the topic' or 'Explain about this topic based on your understanding.'";
        generatedQuestion = `Write briefly what you understand about "${query.topic}" and explain its importance.`;
        break;
      case "AP": // Apply
        knowledgeLevelExplanation = "Generate a question like 'Apply a value or formula to solve a problem', 'Use this theorem in a concept and prove it', or 'Where can this concept be applied and why?'";
        generatedQuestion = `Apply "${query.topic}" to solve a problem or explain where this concept can be applied and why.`;
        break;
      case "AN": // Analyze
        knowledgeLevelExplanation = "Generate a question like 'Analyze the topic and write down the parts', 'Compare with other related topics', or 'Analyze and elaborate the topic in detail.'";
        generatedQuestion = `Analyze "${query.topic}" in detail, breaking it down into components or comparing it with related concepts.`;
        break;
      case "E": // Evaluate
        knowledgeLevelExplanation = "Generate a question like 'Write a statement for the topic and prove it', 'Evaluate if a statement is correct or not', 'Make a judgment and justify it.'";
        generatedQuestion = `Evaluate "${query.topic}" critically, making judgments based on facts and logic.`;
        break;
      case "C": // Create
        knowledgeLevelExplanation = "Generate a question like 'Create a new idea based on the topic and explain it' or 'Develop a new technique or design from the concept.'";
        generatedQuestion = `Create a new idea or approach based on "${query.topic}" and explain it.`;
        break;
    }
  }
  
  // Build the final prompt
  return `You are an intelligent Academic Assistant Chatbot trained to help college students with syllabus-based and exam concept-oriented learning. Your purpose is to provide structured, academic-quality responses based on digitized textbooks, foreign author references, research papers, and Recommended Learning Resources (YouTube lectures, resource papers and valid courses).

PURPOSE:
- Prioritize textbook-based learning with clear, structured, and exam-focused answers.
- Maintain the original integrity of book content without altering or paraphrasing core definitions or formulae.
- Formulae are must - Also explain the formula, how it's derived and explain the terms as it is in the book.
- Act as a reliable assistant for revision, concept understanding, and answer preparation.

TOPIC: ${query.topic}
${query.knowledgeLevel ? `KNOWLEDGE LEVEL: ${query.knowledgeLevel}` : ''}
${query.subject ? `SUBJECT: ${query.subject}` : ''}
${query.book ? `BOOK: ${query.book}` : ''}
GENERATE IMAGE: ${query.generateImage ? 'YES' : 'NO'}
SHOW RECOMMENDED RESOURCES: ${query.showRecommendedResources ? 'YES' : 'NO'}

DATA SOURCE SELECTION:
${dataSource}
${bookSpecifics}
${specificBookReference}

${knowledgeLevelExplanation ? `KNOWLEDGE LEVEL GUIDANCE: ${knowledgeLevelExplanation}` : ''}
${generatedQuestion ? `GENERATED QUESTION: ${generatedQuestion}` : ''}

RESPONSE FORMAT REQUIREMENTS:
Structure your response like a mini research paper with these HTML-formatted sections:
<h2>Introduction</h2>
Background on the topic.

<h2>Literature Review</h2>
Historical or related research context.

<h2>How It Started / Origin</h2>
Origin of the concept or method.

<h2>Methodology / Working Principle</h2>
How it works or is applied, with detailed derivations. Carefully explain all formulas with their components.

${query.generateImage ? '<h2>Image / Diagram</h2>Description of the relevant diagram for this topic. (The actual diagram will be generated separately)' : ''}

<h2>Result / Conclusion</h2>
Final thoughts, outcomes or key takeaways.

<h2>References</h2>
Textbook or paper citations. Always mention "Content from: [Book name], [Author], [Publication]" when using specific book references.

${query.showRecommendedResources ? `<h2>Recommended Learning Resources</h2>
<p>Include only verified, working resources:</p>
<ul>
  <li>YouTube lectures - only include links from verified educational channels like MIT OpenCourseWare, Khan Academy, Neso Academy, or similar high-quality educational content creators</li>
  <li>Research papers - reference papers from IEEE, ACM, or similar reputable academic sources</li>
  <li>Courses - recommend specific courses from platforms like Coursera, edX, or university websites</li>
</ul>
<p><strong>IMPORTANT:</strong> Do not include any YouTube links unless you are certain they exist. For YouTube, only include links from well-established educational channels.` : ''}

IMPORTANT FORMATTING GUIDELINES:
- Format all formulas in bold for better readability: <strong>V = I × R</strong>
- For each formula, explain all variables immediately after
- Always maintain mathematical integrity exactly as presented in the textbook
- Use bullet points with <ul><li>...</li></ul> for listing key concepts
- Use proper paragraph breaks (<p>...</p>) for readability
- If including complex mathematical expressions, use clear HTML formatting
- Keep your response comprehensive but concise and well-structured
- Always conclude with the source: "<p><em>This content is taken from [Book resources / Internet and Book resources]</em></p>"
- If using a specific book, include exact book citation at the end

Ensure your entire response is properly formatted with standard HTML elements for readability.

${query.imageData ? 
"ADDITIONAL CONTEXT: The user has uploaded an image. Analyze this image along with the topic to provide a comprehensive response that directly addresses what's in the image." : ""}`;
}

// Helper function to prepare advanced chat model prompt
function prepareAdvancedPrompt(userMessage: string) {
  return `You are an Advanced Learning Assistant for ECE (Electronics and Communication Engineering) students. 
  You can explore topics beyond the syllabus, connect concepts across domains, and provide in-depth explanations.
  
  Feel free to discuss cutting-edge research, industry applications, and interdisciplinary connections related to the field.
  
  Make your responses detailed and insightful, aimed at advanced understanding of concepts.
  
  User question: ${userMessage}`;
}

// Route to get academic chat history
chatbotRouter.get("/academic", async (req: Request, res: Response) => {
  // Temporarily disable auth check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    // Use default user ID if not authenticated
    const userId = req.user?.id || 1;
    const messages = await storage.getChatMessages(userId, false);
    
    // Parse the enhanced response format if available
    const processedMessages = messages.map(msg => {
      try {
        // Check if the response is already in JSON format
        const parsedResponse = JSON.parse(msg.response);
        return {
          ...msg,
          response: parsedResponse
        };
      } catch (e) {
        // If not JSON, keep the original response
        return msg;
      }
    });
    
    res.json(processedMessages);
  } catch (error) {
    console.error("Error fetching academic chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Route to get advanced chat history
chatbotRouter.get("/advanced", async (req: Request, res: Response) => {
  // Temporarily disable auth check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    // Use default user ID if not authenticated
    const userId = req.user?.id || 1;
    const messages = await storage.getChatMessages(userId, true);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching advanced chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Route to send message to academic chatbot
chatbotRouter.post("/academic", async (req: Request, res: Response) => {
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    // Use a default user ID for testing if not authenticated
    const userId = req.user?.id || 1;
    const { 
      topic,
      knowledgeLevel,
      subject,
      book,
      generateImage,
      showRecommendedResources,
      imageData
    } = req.body;
    
    // Basic validation
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }
    
    // Format the query
    const query: AcademicQuery = {
      topic,
      knowledgeLevel,
      subject,
      book,
      generateImage: !!generateImage,
      showRecommendedResources: !!showRecommendedResources,
      imageData
    };
    
    console.log("Academic chatbot query:", { ...query, imageData: imageData ? "[IMAGE DATA]" : undefined });
    
    // Create message text for logging/storage
    const messageText = `Topic: ${topic}${knowledgeLevel ? `, Knowledge Level: ${knowledgeLevel}` : ''}${subject ? `, Subject: ${subject}` : ''}${book ? `, Book: ${book}` : ''}`;
    
    // Generate a response using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareAcademicPrompt(query);
    
    let result;
    if (imageData) {
      // If image data is provided, use multimodal generation
      // Note: This is a placeholder for multimodal functionality
      // Actual implementation would depend on Gemini API multimodal support
      result = await geminiModel.generateContent(prompt);
    } else {
      result = await geminiModel.generateContent(prompt);
    }
    
    const response = result.response.text();
    
    // Generate image if requested
    let imageUrl = null;
    if (generateImage) {
      try {
        // Call image generation API
        // This is a placeholder - real implementation would use a proper image gen API
        const imageTopic = `Educational diagram of ${topic} for ${subject || "ECE students"}`;
        
        // Fetch from image generation endpoint
        const imageRes = await fetch("http://localhost:3000/api/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: imageTopic })
        });
        
        if (imageRes.ok) {
          const imageData = await imageRes.json();
          imageUrl = imageData.imageUrl;
        }
      } catch (imageError) {
        console.error("Error generating image:", imageError);
      }
    }
    
    // Enhanced response with additional metadata
    const enhancedResponse = {
      content: response,
      metadata: {
        topic,
        knowledgeLevel,
        subject,
        book,
        imageUrl,
        sources: getSourceInfo(query)
      }
    };
    
    // Save the message and response
    const chatMessage = await storage.createChatMessage({
      userId,
      message: messageText,
      response: JSON.stringify(enhancedResponse),
      isAdvanced: false
    });
    
    // Add user activity
    await storage.createUserActivity({
      userId,
      activityType: "CHAT",
      description: `Used academic chatbot: ${topic.substring(0, 30)}${topic.length > 30 ? '...' : ''}`
    });
    
    res.json({
      ...chatMessage,
      response: enhancedResponse // Send parsed JSON response
    });
  } catch (error) {
    console.error("Error processing academic chat message:", error);
    res.status(500).json({ message: "Error processing chat message" });
  }
});

// Route to send message to advanced chatbot
chatbotRouter.post("/advanced", async (req: Request, res: Response) => {
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    // Use default user ID if not authenticated
    const userId = req.user?.id || 1;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    console.log("Generating advanced response with Gemini API for message:", message);
    
    // Generate a response using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareAdvancedPrompt(message);
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    
    // Save the message and response
    const chatMessage = await storage.createChatMessage({
      userId,
      message,
      response,
      isAdvanced: true
    });
    
    // Add user activity
    await storage.createUserActivity({
      userId,
      activityType: "CHAT",
      description: `Used advanced chatbot: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`
    });
    
    res.json(chatMessage);
  } catch (error) {
    console.error("Error processing advanced chat message:", error);
    res.status(500).json({ message: "Error processing chat message" });
  }
});

export default chatbotRouter;
