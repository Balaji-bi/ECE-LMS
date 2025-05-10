import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response, Router } from "express";
import { storage } from "./storage";

// Initialize the Gemini API with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
// Set some default configuration 
const geminiConfig = { 
  model: "gemini-1.5-pro" // Gemini model name - verified working model
};

// Create a router
export const contentToolsRouter = Router();

// Helper function to prepare assignment generator prompt
function prepareAssignmentPrompt(topic: string, characterCount: string, subject: string, book: string, difficulty: string, dataSource: string) {
  return `You are "ASSIGNMENT-GPT," an AI-powered academic assistant designed to generate structured assignments based on a topic, knowledge level, subject, and book selection.

🎯 PURPOSE:
Generate research-style assignments for students by adapting your content sources according to user input. Focus on clean, academic, and structured writing that reflects book authenticity, academic tone, and knowledge level depth.

🧠 USER INPUTS:
1. Topic Name: ${topic}
2. Character Count: ${characterCount} characters
${subject ? `3. Subject Selection: ${subject}` : ''}
${book ? `4. Book Selection: ${book}` : ''}
5. Difficulty Level: ${difficulty}
6. Data Source: ${dataSource}

📚 DATA SOURCE LOGIC:
${dataSource === 'internet' 
  ? '→ Generate content from internet sources only.' 
  : '→ Generate content from both internet and book sources.'}

✍️ RESPONSE STRUCTURE:
- Introduction – Background on the topic.
- Literature Review – Past studies or book/journal references.
- How It Started / Origin – Where and how the concept originated.
- Methodology / Working Principle – How it works, include derivation and models.
- Result / Conclusion – Outcomes, learnings, and conclusion.

IMPORTANT: 
- Use clear HTML formatting for mathematical/scientific notation:
  For example:
  - Einstein's formula: <div class="formula"><strong>E = mc<sup>2</sup></strong></div>
  - Ohm's Law: <div class="formula"><strong>V = I × R</strong></div>
  - Integration: <div class="formula"><strong>∫<sub>a</sub><sup>b</sup> f(x) dx = F(b) - F(a)</strong></div>
  
- After EACH formula, explain all variables in a structured list:
  <ul>
    <li><strong>E</strong>: Energy (in joules)</li>
    <li><strong>m</strong>: Mass (in kilograms)</li>
    <li><strong>c</strong>: Speed of light (in meters per second)</li>
  </ul>

⚠️ RULES:
- NEVER invent book names or citations.
- Focus on clean language, academic tone, and real content.
- Response should be simple, look good and easy to understand, no fancy formatting, don't be messy.
- The total content should be within the specified character count range (${characterCount}).
- Use clear section headers with proper numbering.
- Include a downloadable format structure with proper spacing and formatting.`;
}

// Helper function to prepare research paper assistant prompt
function prepareResearchPrompt(title: string, authors: string, institution: string, abstract: string, introduction: string, literatureSurvey: string, methodology: string, workingPrinciple: string, implementation: string, tabulation: string, challenges: string, results: string, conclusion: string) {
  return `You are "RESEARCH-GPT," an AI-powered assistant that enhances and expands academic research papers based on user-provided content. Your goal is to convert a structured outline or incomplete draft into a full-length, 2–3 A4-page academic research paper with proper formatting, flow, and citations.

🎯 PURPOSE:
Generate a well-formatted, formal research paper using provided inputs and intelligently fill in any missing sections. Expand user content with clarity, consistency, and relevance to the core concept.

📝 USER INPUTS:
1. Title: ${title || "[Title not provided]"}
2. Author(s): ${authors || "[Authors not provided]"}
3. Institution: ${institution || "[Institution not provided]"}
4. Abstract: ${abstract || "[Not provided]"}
5. Introduction: ${introduction || "[Not provided]"}
6. Literature Survey: ${literatureSurvey || "[Not provided]"}
7. Methodology: ${methodology || "[Not provided]"}
8. Working Principle: ${workingPrinciple || "[Not provided]"}
9. Implementation: ${implementation || "[Not provided]"}
10. Tabulation: ${tabulation || "[Not provided]"}
11. Challenges: ${challenges || "[Not provided]"}
12. Results: ${results || "[Not provided]"}
13. Conclusion: ${conclusion || "[Not provided]"}

📐 FORMAT GUIDELINES:
- Start with:
  - Title (centered, bold, large font)
  - Author(s) (centered, comma-separated)
  - Institution (centered, italic)
  - Leave one line space, then start content

- Assign Chapter Numbers (1, 2, 3...) and Subtopics (e.g., 1.1, 1.2...) dynamically:
  - The first user-provided section becomes Chapter 1
  - Next present section becomes Chapter 2, and so on
  - Use appropriate subheadings like 1.1, 1.2, 2.1, 2.2, etc.
  - Skip any sections not provided by the user

- Use clear HTML formatting for mathematical/scientific notation:
  For example:
  - Einstein's formula: <div class="formula"><strong>E = mc<sup>2</sup></strong></div>
  - Ohm's Law: <div class="formula"><strong>V = I × R</strong></div>
  - Integration: <div class="formula"><strong>∫<sub>a</sub><sup>b</sup> f(x) dx = F(b) - F(a)</strong></div>
  
- After EACH formula, explain all variables in a structured list:
  <ul>
    <li><strong>E</strong>: Energy (in joules)</li>
    <li><strong>m</strong>: Mass (in kilograms)</li>
    <li><strong>c</strong>: Speed of light (in meters per second)</li>
  </ul>

🧠 CONTENT ENHANCEMENT:
- Expand each section using domain-specific depth
- Follow an academic tone and ensure smooth transitions between paragraphs
- Maintain user's meaning, but rewrite in a cleaner, more formal way
- Minimum output: 2 to 3 A4 pages (approximately 10000 to 15000+ words)
- Add real-world applications or relevant insights if missing

📚 REFERENCE PAPERS:
- At the end, add a new section: References (no chapter number)
- Include 2–4 relevant research paper links or DOIs fetched from verified internet sources based on the core topic
- Format: [1] Author(s), "Title," Journal/Conference, Year. [Link]

⚠️ RULES:
- Do not fabricate books or author names
- Always reflect academic integrity
- When sections are missing, skip them; don't hallucinate false input
- Avoid informal tone. Maintain proper paragraph transitions`;
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
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    const { topic, characterCount, subject, book, difficulty, dataSource } = req.body;
    
    // Default character count range if not provided (15,000-35,000)
    const charCount = characterCount || "15000-35000";
    
    if (!topic || !difficulty || !dataSource) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    console.log("Generating assignment with Gemini API:", { topic, characterCount: charCount, subject, book, difficulty, dataSource });
    
    // Generate assignment using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareAssignmentPrompt(topic, charCount, subject, book, difficulty, dataSource);
    const result = await geminiModel.generateContent(prompt);
    const assignment = result.response.text();
    
    // Add user activity
    const userId = req.user?.id || 1;
    await storage.createUserActivity({
      userId,
      activityType: "CONTENT_TOOL",
      description: `Generated assignment on ${topic} (${difficulty} level)`
    });
    
    res.json({ assignment });
  } catch (error) {
    console.error("Error generating assignment:", error);
    res.status(500).json({ message: "Error generating assignment" });
  }
});

// Route for generating research materials
contentToolsRouter.post("/research", async (req: Request, res: Response) => {
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    const { 
      title, 
      authors, 
      institution, 
      abstract,
      introduction,
      literatureSurvey, 
      methodology, 
      workingPrinciple, 
      implementation,
      tabulation,
      challenges,
      results,
      conclusion 
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    console.log("Generating research paper with Gemini API for:", title);
    
    // Generate research content using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareResearchPrompt(
      title, 
      authors, 
      institution,
      abstract,
      introduction,
      literatureSurvey, 
      methodology, 
      workingPrinciple,
      implementation,
      tabulation,
      challenges,
      results,
      conclusion
    );
    const result = await geminiModel.generateContent(prompt);
    const research = result.response.text();
    
    // Add user activity
    const userId = req.user?.id || 1;
    await storage.createUserActivity({
      userId,
      activityType: "CONTENT_TOOL",
      description: `Generated research paper: ${title}`
    });
    
    res.json({ research });
  } catch (error) {
    console.error("Error generating research content:", error);
    res.status(500).json({ message: "Error generating research content" });
  }
});

// Route for resume building
contentToolsRouter.post("/resume", async (req: Request, res: Response) => {
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    const details = req.body;
    
    if (!details.name || !details.education || !details.skills || !details.projects) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    console.log("Generating resume with Gemini API for:", details.name);
    
    // Generate resume using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareResumePrompt(details);
    const result = await geminiModel.generateContent(prompt);
    const resume = result.response.text();
    
    // Add user activity
    const userId = req.user?.id || 1;
    await storage.createUserActivity({
      userId,
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
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    const { content, style } = req.body;
    
    if (!content || !style) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    console.log("Rewriting content with Gemini API in style:", style);
    
    // Generate rewritten content using Gemini
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = prepareRewritePrompt(content, style);
    const result = await geminiModel.generateContent(prompt);
    const rewritten = result.response.text();
    
    // Add user activity
    const userId = req.user?.id || 1;
    await storage.createUserActivity({
      userId,
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