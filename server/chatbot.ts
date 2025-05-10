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
  
  // Generate the question based on knowledge level and subject context
  let generatedQuestion = "";
  let knowledgeLevelExplanation = "";
  
  if (query.knowledgeLevel) {
    const subjectContext = query.subject ? 
      ` in the context of ${query.subject}` : 
      "";
    
    switch(query.knowledgeLevel) {
      case "R": // Remember
        knowledgeLevelExplanation = "Generate a question from typical exam papers that tests recall of definitions, statements, or descriptions.";
        generatedQuestion = `Define and explain "${query.topic}"${subjectContext}. Include all relevant mathematical expressions and properties.`;
        break;
      case "U": // Understand
        knowledgeLevelExplanation = "Generate a question from typical exam papers that tests understanding of concepts and their significance.";
        generatedQuestion = `Explain the concept of "${query.topic}"${subjectContext} and discuss its importance in the field.`;
        break;
      case "AP": // Apply
        knowledgeLevelExplanation = "Generate a question from typical exam papers that tests application of concepts to solve problems.";
        if (query.subject === "EC3251") {
          generatedQuestion = `Solve a problem using "${query.topic}"${subjectContext}. Include step-by-step working and necessary formulas.`;
        } else {
          generatedQuestion = `Apply the principles of "${query.topic}"${subjectContext} to solve a practical scenario.`;
        }
        break;
      case "AN": // Analyze
        knowledgeLevelExplanation = "Generate a question from typical exam papers that tests analytical ability to break down concepts.";
        generatedQuestion = `Analyze "${query.topic}"${subjectContext} by breaking it down into its key components and explaining their relationships.`;
        break;
      case "E": // Evaluate
        knowledgeLevelExplanation = "Generate a question from typical exam papers that tests evaluation abilities and critical thinking.";
        generatedQuestion = `Evaluate the effectiveness and limitations of "${query.topic}"${subjectContext}. Provide a critical assessment with supporting evidence.`;
        break;
      case "C": // Create
        knowledgeLevelExplanation = "Generate a question from typical exam papers that tests creative application of concepts.";
        generatedQuestion = `Design a new application or approach that incorporates "${query.topic}"${subjectContext}. Explain how your design works and its advantages.`;
        break;
    }
  }
  
  // Build the final prompt based on knowledge level
  let prompt = "";
  const hasKnowledgeLevel = !!query.knowledgeLevel;
  
  // Common header for all prompts
  prompt = `You are an intelligent Academic Assistant Chatbot trained to help college students with syllabus-based and exam concept-oriented learning. Your purpose is to provide structured, academic-quality responses based on digitized textbooks, foreign author references, research papers, and Recommended Learning Resources (YouTube lectures, resource papers and valid courses).

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
${specificBookReference}`;

  // Different formatting based on knowledge level
  if (hasKnowledgeLevel) {
    // For responses with knowledge level - use question generation workflow
    prompt += `
${knowledgeLevelExplanation}

IMPORTANT: This is a two-step response. First, generate an appropriate exam question, then provide the answer.

STEP 1: GENERATE QUESTION
Based on this knowledge level (${query.knowledgeLevel}), create an appropriate exam-style question about "${query.topic}"${query.subject ? ` in the context of ${query.subject}` : ''}.
For reference, here's a sample question structure: ${generatedQuestion}

STEP 2: PROVIDE COMPREHENSIVE ANSWER
After generating the question, provide a comprehensive, academic-style answer to that question with the following structure:

<h2>Exam Question</h2>
[The exam question you generated]

<h2>Answer</h2>
<h3>Introduction</h3>
A concise background of the topic and its significance in the field.

<h3>Key Concepts</h3>
The fundamental principles, definitions, and theoretical underpinnings.

<h3>Mathematical Formulation / Working Principle</h3>
The mathematical expressions, equations, and formulas, with detailed explanations of each component. Format mathematical expressions clearly with bold syntax (**V = I × R**).

${query.generateImage ? '<h3>Visual Representation</h3>Description of diagrams or visual aids that would help explain the concept. (The actual diagram will be generated separately)' : ''}

<h3>Application / Analysis</h3>
How the concept is applied in practical scenarios or its role in analysis.

<h3>Conclusion</h3>
Summary of key points and their implications.

<h3>References</h3>
Relevant textbook citations and academic sources.`;
  } else {
    // For responses without knowledge level - use standard format
    prompt += `
RESPONSE FORMAT REQUIREMENTS:
Structure your response like a mini research paper with these HTML-formatted sections:
<h2>Introduction</h2>
Background on the topic and its significance in the field.

<h2>How It Started / Origin</h2>
Origin of the concept or method, with brief historical context.

<h2>Methodology / Working Principle</h2>
How it works or is applied, with detailed derivations. Carefully explain all formulas with their components. Format mathematical expressions clearly with bold syntax (**V = I × R**).

${query.generateImage ? '<h2>Image / Diagram</h2>Description of the relevant diagram for this topic. (The actual diagram will be generated separately)' : ''}

<h2>Result / Conclusion</h2>
Final thoughts, outcomes or key takeaways.

<h2>References</h2>
Textbook or paper citations. Always mention "Content from: [Book name], [Author], [Publication]" when using specific book references.`;
  }
  
  // Add recommended resources section if needed
  if (query.showRecommendedResources) {
    prompt += `

<h2>Recommended Learning Resources</h2>
<p>Include only verified, working resources:</p>
<ul>
  <li>YouTube lectures - only include links from verified educational channels like MIT OpenCourseWare, Khan Academy, Neso Academy, or similar high-quality educational content creators</li>
  <li>Research papers - reference papers from IEEE, ACM, or similar reputable academic sources</li>
  <li>Courses - recommend specific courses from platforms like Coursera, edX, or university websites</li>
</ul>
<p><strong>IMPORTANT:</strong> Do not include any YouTube links unless you are certain they exist. For YouTube, only include links from well-established educational channels.</p>`;
  }
  
  // Add formatting guidelines
  prompt += `

IMPORTANT FORMATTING GUIDELINES:
- Format all formulas in bold for better readability: <strong>V = I × R</strong> or use **V = I × R** markdown syntax
- For each formula, explain all variables immediately after
- Always maintain mathematical integrity exactly as presented in the textbook
- Use bullet points with <ul><li>...</li></ul> for listing key concepts
- Use proper paragraph breaks (<p>...</p>) for readability
- If including complex mathematical expressions, use clear HTML formatting
- Keep your response comprehensive but concise and well-structured
- Always conclude with the source: "<p><em>This content is taken from [Book resources / Internet and Book resources]</em></p>"
- If using a specific book, include exact book citation at the end

Ensure your entire response is properly formatted with standard HTML elements for readability.`;
  
  // Add image context if needed
  if (query.imageData) {
    prompt += `

ADDITIONAL CONTEXT: The user has uploaded an image. Analyze this image along with the topic to provide a comprehensive response that directly addresses what's in the image.`;
  }
  
  return prompt;
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
  } catch (error: any) {
    console.error("Error fetching academic chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
});

// Route to get advanced chat history
chatbotRouter.get("/advanced", async (req: Request, res: Response) => {
  try {
    // Use default user ID if not authenticated
    const userId = req.user?.id || 1;
    const messages = await storage.getChatMessages(userId, true);
    res.json(messages);
  } catch (error: any) {
    console.error("Error fetching advanced chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
});

// Route to handle academic chatbot interactions
chatbotRouter.post("/academic", async (req: Request, res: Response) => {
  try {
    // Use default user ID if not authenticated
    const userId = req.user?.id || 1;
    
    // Parse and validate the request
    const query: AcademicQuery = {
      topic: req.body.topic,
      knowledgeLevel: req.body.knowledgeLevel,
      subject: req.body.subject,
      book: req.body.book,
      generateImage: !!req.body.generateImage,
      showRecommendedResources: !!req.body.showRecommendedResources,
      imageData: req.body.imageData
    };
    
    console.log("Academic chatbot query:", query);
    
    // Generate source info for metadata
    const sourceInfo = getSourceInfo(query);
    
    // Build prompt
    const prompt = prepareAcademicPrompt(query);
    
    // Create a model instance with our config
    const model = genAI.getGenerativeModel({ ...geminiConfig });
    
    // Generate content - with image if provided
    let result;
    if (query.imageData) {
      // For multimodal prompt
      const imageData = Buffer.from(query.imageData.split(',')[1], 'base64');
      
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: query.imageData.split(',')[1]
          }
        }
      ]);
    } else {
      // For text-only prompt
      result = await model.generateContent(prompt);
    }
    
    // Extract the response text
    const responseText = result.response.text();
    
    // Construct a message to save with enhanced metadata
    const userMessageText = `Topic: ${query.topic}${query.knowledgeLevel ? `, Knowledge Level: ${query.knowledgeLevel}` : ''}${query.subject ? `, Subject: ${query.subject}` : ''}${query.book ? `, Book: ${query.book}` : ''}`;
    
    // Create an enhanced JSON object with topic metadata
    const enhancedResponse = JSON.stringify({
      content: responseText,
      metadata: {
        topic: query.topic,
        knowledgeLevel: query.knowledgeLevel,
        subject: query.subject,
        book: query.book,
        imageUrl: query.generateImage ? `/api/image-gen/placeholder?topic=${encodeURIComponent(query.topic)}` : undefined,
        sources: sourceInfo
      }
    });
    
    // Save to database
    const savedMessage = await storage.createChatMessage({
      message: userMessageText,
      userId,
      isAdvanced: false,
      response: enhancedResponse
    });
    
    // Return the response
    res.json(savedMessage);
  } catch (error: any) {
    console.error("Error in academic chatbot:", error);
    res.status(500).json({ 
      message: "Error processing your request", 
      error: error.message
    });
  }
});

// Route to handle advanced chatbot interactions
chatbotRouter.post("/advanced", async (req: Request, res: Response) => {
  try {
    // Use default user ID if not authenticated
    const userId = req.user?.id || 1;
    
    const userMessage = req.body.message;
    
    // Build prompt
    const prompt = prepareAdvancedPrompt(userMessage);
    
    // Create a model instance with our config
    const model = genAI.getGenerativeModel({ ...geminiConfig });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Save to database
    const savedMessage = await storage.createChatMessage({
      message: userMessage,
      userId,
      isAdvanced: true,
      response: responseText
    });
    
    // Return the response
    res.json(savedMessage);
  } catch (error: any) {
    console.error("Error in advanced chatbot:", error);
    res.status(500).json({ 
      message: "Error processing your request", 
      error: error.message
    });
  }
});