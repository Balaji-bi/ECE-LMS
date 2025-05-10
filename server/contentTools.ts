import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response, Router } from "express";
import { storage } from "./storage";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Set some default configuration
const geminiConfig = { 
  model: "gemini-1.5-pro"
};

// Create a router
export const contentToolsRouter = Router();

// Helper function to prepare assignment generator prompt
function prepareAssignmentPrompt(subject: string, topic: string, type: string, difficulty: number) {
  return `Create an ECE (Electronics and Communication Engineering) ${type} assignment for Anna University students on the subject ${subject}, specifically covering ${topic}.
  
  The difficulty level is ${difficulty}/5 (where 1 is easiest and 5 is most challenging).
  
  Format the assignment with:
  - A title
  - Clear instructions
  - ${type === 'Questions' ? `${5 + difficulty} questions of varying types (multiple choice, short answer, analytical problems)` : ''}
  ${type === 'Case Study' ? '- A detailed scenario\n- Specific questions about the scenario\n- Requirements for submission' : ''}
  ${type === 'Project' ? '- Project objectives\n- Required materials/software\n- Step-by-step methodology\n- Expected deliverables\n- Evaluation criteria' : ''}
  
  Ensure all content is technically accurate and follows academic standards.`;
}

// Helper function to prepare research paper assistant prompt
function prepareResearchPrompt(topic: string, type: string) {
  return `Generate a ${type} for an ECE (Electronics and Communication Engineering) research paper on "${topic}".
  
  ${type === 'Outline' ? 'Structure it with:\n- Proposed title\n- Abstract outline\n- Introduction points\n- Literature review key areas\n- Methodology approach\n- Expected results section\n- Discussion points\n- Conclusion elements\n- Key references to consider' : ''}
  ${type === 'Literature Review' ? 'Include:\n- Overview of the key research areas\n- Identification of 6-8 seminal papers in the field\n- Summary of major findings\n- Identification of research gaps\n- How these works relate to each other' : ''}
  ${type === 'Methodology' ? 'Detail:\n- Proposed research approach\n- Data collection methods\n- Analysis techniques\n- Expected challenges and limitations\n- Validation methods\n- Tools and technologies required' : ''}
  
  Format your response professionally with appropriate sections and subsections.`;
}

// Helper function to prepare resume builder prompt
function prepareResumePrompt(details: any) {
  return `Create a professional resume for an ECE (Electronics and Communication Engineering) student with the following details:
  
  Name: ${details.name}
  Education: ${details.education}
  Technical Skills: ${details.skills}
  Projects: ${details.projects}
  Work Experience: ${details.experience || 'None'}
  Certifications: ${details.certifications || 'None'}
  
  Format the resume professionally with appropriate sections for an engineering student. Include a professional summary at the beginning. Organize technical skills by category (programming languages, tools, hardware, etc.). For each project, include technologies used and outcomes.`;
}

// Helper function to prepare content rewriter prompt
function prepareRewritePrompt(content: string, style: string) {
  return `Rewrite the following content in a ${style} style. Maintain all technical accuracy and key information, but enhance the writing quality according to the requested style.
  
  Original content:
  "${content}"
  
  Rewritten content should be:
  ${style === 'Academic' ? '- Formal and scholarly\n- Well-structured with clear topic sentences\n- Include appropriate technical terminology\n- Objective and precise' : ''}
  ${style === 'Simplified' ? '- Accessible to non-specialists\n- Using clear, simple language\n- Explaining technical concepts\n- Maintaining accuracy while reducing complexity' : ''}
  ${style === 'Professional' ? '- Concise and direct\n- Business-appropriate tone\n- Well-organized with bullet points where appropriate\n- Polished and refined' : ''}`;
}

// Route for generating assignments
contentToolsRouter.post("/assignment", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const { subject, topic, type, difficulty } = req.body;
    
    if (!subject || !topic || !type || difficulty === undefined) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    // Generate assignment using Gemini
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = prepareAssignmentPrompt(subject, topic, type, difficulty);
    const result = await geminiModel.generateContent(prompt);
    const assignment = result.response.text();
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user!.id,
      activityType: "CONTENT_TOOL",
      description: `Generated ${type} assignment on ${subject} - ${topic}`
    });
    
    res.json({ assignment });
  } catch (error) {
    console.error("Error generating assignment:", error);
    res.status(500).json({ message: "Error generating assignment" });
  }
});

// Route for research paper assistance
contentToolsRouter.post("/research", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const { topic, type } = req.body;
    
    if (!topic || !type) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    // Generate research paper assistance using Gemini
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = prepareResearchPrompt(topic, type);
    const result = await geminiModel.generateContent(prompt);
    const research = result.response.text();
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user!.id,
      activityType: "CONTENT_TOOL",
      description: `Generated ${type} for research paper on ${topic}`
    });
    
    res.json({ research });
  } catch (error) {
    console.error("Error generating research assistance:", error);
    res.status(500).json({ message: "Error generating research assistance" });
  }
});

// Route for resume building
contentToolsRouter.post("/resume", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const details = req.body;
    
    if (!details.name || !details.education || !details.skills || !details.projects) {
      return res.status(400).json({ message: "Missing required resume details" });
    }
    
    // Generate resume using Gemini
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = prepareResumePrompt(details);
    const result = await geminiModel.generateContent(prompt);
    const resume = result.response.text();
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user!.id,
      activityType: "CONTENT_TOOL",
      description: "Generated resume"
    });
    
    res.json({ resume });
  } catch (error) {
    console.error("Error generating resume:", error);
    res.status(500).json({ message: "Error generating resume" });
  }
});

// Route for content rewriting
contentToolsRouter.post("/rewrite", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const { content, style } = req.body;
    
    if (!content || !style) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    // Generate rewritten content using Gemini
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = prepareRewritePrompt(content, style);
    const result = await geminiModel.generateContent(prompt);
    const rewritten = result.response.text();
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user!.id,
      activityType: "CONTENT_TOOL",
      description: `Rewrote content in ${style} style`
    });
    
    res.json({ rewritten });
  } catch (error) {
    console.error("Error rewriting content:", error);
    res.status(500).json({ message: "Error rewriting content" });
  }
});

export default contentToolsRouter;
