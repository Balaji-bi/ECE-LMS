import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Set some default configuration
const geminiConfig = { 
  model: "gemini-pro",
  // Use the proper model version supported by the API key
};

// Create a router
export const chatbotRouter = Router();

// Helper function to prepare academic chat model prompt
function prepareAcademicPrompt(userMessage: string) {
  return `You are an Academic Assistant for the ECE (Electronics and Communication Engineering) department at Anna University. 
  You specialize in the 21st regulation syllabus. Answer questions based strictly on the ECE curriculum.
  
  Always specify the course code and unit when possible in your responses. Keep your responses focused on academic content.
  
  If the question is about a topic outside the ECE curriculum, politely redirect to the curriculum.
  
  User question: ${userMessage}`;
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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userId = req.user!.id;
    const messages = await storage.getChatMessages(userId, false);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching academic chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Route to get advanced chat history
chatbotRouter.get("/advanced", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userId = req.user!.id;
    const messages = await storage.getChatMessages(userId, true);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching advanced chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Route to send message to academic chatbot
chatbotRouter.post("/academic", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userId = req.user!.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    // Generate a response using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareAcademicPrompt(message);
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    
    // Save the message and response
    const chatMessage = await storage.createChatMessage({
      userId,
      message,
      response,
      isAdvanced: false
    });
    
    // Add user activity
    await storage.createUserActivity({
      userId,
      activityType: "CHAT",
      description: `Used academic chatbot: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`
    });
    
    res.json(chatMessage);
  } catch (error) {
    console.error("Error processing academic chat message:", error);
    res.status(500).json({ message: "Error processing chat message" });
  }
});

// Route to send message to advanced chatbot
chatbotRouter.post("/advanced", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userId = req.user!.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
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
