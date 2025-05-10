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
  let dataSource = "Internet + All books";
  let useInternet = false;
  let bookSpecifics = "";
  
  if (query.knowledgeLevel) {
    // If knowledge level is selected, we can use internet
    useInternet = true;
    
    if (query.subject && query.book) {
      dataSource = `Internet + Specific book (${query.book})`;
      bookSpecifics = `Focus specifically on the book: ${query.book}`;
    } else if (query.subject) {
      dataSource = `Internet + All books from ${query.subject}`;
      bookSpecifics = `Focus on all books related to ${query.subject}`;
    } else {
      dataSource = "Internet + All available books";
      bookSpecifics = "Use all relevant books as references";
    }
  } else {
    // No knowledge level, so no internet unless resources are requested
    useInternet = query.showRecommendedResources || false;
    
    if (query.subject && query.book) {
      dataSource = `Only the selected book (${query.book})`;
      bookSpecifics = `Use ONLY the book: ${query.book}. DO NOT use internet sources.`;
    } else if (query.subject) {
      dataSource = `All books under ${query.subject} subject`;
      bookSpecifics = `Use ONLY books related to ${query.subject}. DO NOT use internet sources.`;
    } else if (query.book) {
      dataSource = `Only the selected book (${query.book})`;
      bookSpecifics = `Use ONLY the book: ${query.book}. DO NOT use internet sources.`;
    } else {
      // Default case - use subject books where topic belongs
      dataSource = "All books where the topic belongs";
      bookSpecifics = "Use ONLY books related to the subject where this topic belongs. DO NOT use internet sources.";
    }
    
    // If resources are requested, we can use internet just for that purpose
    if (query.showRecommendedResources) {
      dataSource += " + Internet for learning resources only";
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
  if (query.knowledgeLevel) {
    switch(query.knowledgeLevel) {
      case "R": // Remember
        generatedQuestion = `Recall the definition, statement, or description of "${query.topic}".`;
        break;
      case "U": // Understand
        generatedQuestion = `Write briefly what you understand about "${query.topic}" and explain its importance.`;
        break;
      case "AP": // Apply
        generatedQuestion = `Apply "${query.topic}" to solve a problem or explain where this concept can be applied and why.`;
        break;
      case "AN": // Analyze
        generatedQuestion = `Analyze "${query.topic}" in detail, breaking it down into components or comparing it with related concepts.`;
        break;
      case "E": // Evaluate
        generatedQuestion = `Evaluate "${query.topic}" critically, making judgments based on facts and logic.`;
        break;
      case "C": // Create
        generatedQuestion = `Create a new idea or approach based on "${query.topic}" and explain it.`;
        break;
    }
  }
  
  // Build the final prompt
  return `You are an intelligent Academic Assistant Chatbot trained to help college students with syllabus-based and exam concept-oriented learning. Your purpose is to provide structured, academic-quality responses based on digitized textbooks, foreign author references, and research papers.

TOPIC: ${query.topic}
${query.knowledgeLevel ? `KNOWLEDGE LEVEL: ${query.knowledgeLevel}` : ''}
${query.subject ? `SUBJECT: ${query.subject}` : ''}
${query.book ? `BOOK: ${query.book}` : ''}
GENERATE IMAGE: ${query.generateImage ? 'YES' : 'NO'}
SHOW RECOMMENDED RESOURCES: ${query.showRecommendedResources ? 'YES' : 'NO'}

DATA SOURCE: ${dataSource}
${bookSpecifics}
${specificBookReference}

${generatedQuestion ? `GENERATED QUESTION: ${generatedQuestion}` : ''}

RESPONSE FORMAT REQUIREMENTS:
Structure your response like a mini research paper with these sections:
1. Introduction – Background on the topic
2. Literature Review – Historical or related research context
3. How It Started / Origin – Origin of the concept or method
4. Methodology / Working Principle - How it works or is applied, with detailed derivations
5. Result / Conclusion – Final thoughts or key takeaways
6. References – Textbook or paper citations
${query.showRecommendedResources ? '7. Recommended Learning Resources - Include relevant YouTube links, research papers, and valid courses' : ''}

IMPORTANT GUIDELINES:
- Use LaTeX format for mathematical/scientific notation (e.g., E = mc^2, ∫_a^b f(x)dx = F(b) - F(a))
- Prioritize textbook-based learning with clear, structured, and exam-focused answers
- Maintain the original integrity of book content without altering core definitions or formulae
- Show all formulas clearly with proper explanation of terms and derivations as they appear in the book
- End your response by mentioning: "This content is taken from [Book resources / Internet and Book resources]"
- Keep answers concise but informative

${query.imageData ? "ADDITIONAL CONTEXT: The user has uploaded an image with their query. Analyze this image along with the topic to provide a comprehensive response." : ""}`;
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
