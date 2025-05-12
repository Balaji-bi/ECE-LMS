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
  temperature: 0.7,
  topP: 0.95,
  topK: 50,
  maxOutputTokens: 40000
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
    path: "Hayt Jack Kemmerly, Steven Durbin, Engineering Circuit Analysis,Mc Graw Hill education, 9th Edition, 2018."
  },
  "EC3352": {
    title: "Digital Design", // Digital Systems Design
    author: "M. Morris Mano and Michael D. Ciletti",
    publication: "Pearson, 5th Edition, 2013",
    path: "M. Morris Mano and Michael D. Ciletti, ‘Digital Design’, Pearson, 5th Edition, 2013."
  },
  "EC3354": {
    title: "Signals and Systems", // Signals and Systems
    author: "Simon Haykin, Barry Van Veen",
    publication: "Wiley, 2nd Edition, 2002",
    path: "Simon Haykin, Barry Van Veen, “Signals and Systems”, 2nd Edition, Wiley, 2002."
  },
  "EC3351": {
    title: "Control Systems – Principles and Design", // Control Systems
    author: "M. Gopal",
    publication: "Design”, Tata McGraw Hill, 4th Edition, 2012.",
    path: "M. Gopal, “Control Systems – Principles and Design”, Tata McGraw Hill, 4th Edition, 2012."
  },
  "EC3353": {
    title: "Electronic Devices and Circuits",  // Electronic Devices and Circuits
    author: "David A. Bell",
    publication: "Oxford University Press, 5th Edition, 2010",
    path: "David A. Bell, “Electronic Devices and Circuits”, Oxford University Press, 5th Edition, 2010."
  },
  "EC3451": {
    title: "Design with Operational Amplifiers and Analog Integrated Circuits",  // Linear Integrated Circuits
    author: "Sergio Franco",
    publication: "Tata McGraw Hill, 4th Edition, 2016",
    path: "Sergio Franco, “Design with Operational Amplifiers and Analog Integrated Circuits”, Tata McGraw Hill, 4th Edition, 2016."
  },
  "EC3492": {
    title: "Digital Signal Processing – Principles, Algorithms and Applications", // Digital Signal Processing
    author: "John G. Proakis, Dimitris G. Manolakis",
    publication: "Pearson, 4th Edition, 2007",
    path: "John G. Proakis, Dimitris G. Manolakis, “Digital Signal Processing – Principles, Algorithms and Applications”, Pearson, 4th Edition, 2007."
  },
  "EC3401": [
    {
      title: "Data Communication and Networking", // Networks and security
      author: "Behrouz A. Forouzan",
      publication: "Tata McGraw Hill, 5th Edition, 2017",
      path: "Behrouz A. Forouzan, “Data Communication and Networking”, Tata McGraw Hill, 5th Edition, 2017."
    },
    {
      title: "Cryptography and Network Security",
      author: "William Stallings",
      publication: "Pearson, 7th Edition, 2017",
      path: "William Stallings, “Cryptography and Network Security”, Pearson, 7th Edition, 2017."
    },
    {
      title: "Computer Networking: A Top-Down Approach",
      author: "James F. Kurose, Keith W. Ross",
      publication: "Pearson, 7th Edition, 2017",
      path: "James F. Kurose, Keith W. Ross, “Computer Networking: A Top-Down Approach”, Pearson, 7th Edition, 2017."
    },
  ],
  "EC3491": {
    title: "Modern Digital and Analog Communication Systems", // Communication Systems
    author: "B.P. Lathi",
    publication: "Oxford University Press, 4th Edition, 2011",
    path: "B.P. Lathi, “Modern Digital and Analog Communication Systems”, Oxford University Press, 4th Edition, 2011."  
    },
  "EC3452": {
    title: "Field and wave electromagnetics",  // Electromagnetic Fields
    author: "David K. Cheng",
    publication: "Pearson, 2nd Edition, 2002",
    path: "David K. Cheng, “Field and wave electromagnetics”, Pearson, 2nd Edition, 2002."
  },
  "EC3501": {
    title: "Wireless communications", // Wireless Communication
    author: "Rappaport,T.S.",
    publication: "Pearson, 2nd Edition, 2010",
    path: "Rappaport,T.S., “Wireless communications”, Pearson, 2nd Edition, 2010."
    },
  "EC3551": {
    title: "Radio Frequency and Microwave Communication Circuits", // Transmission Lines and RF Systems
    author: "D. K. Misra",
    publication: "Analysis and Design, John Wiley &amp; Sons, 2004.",
    path: "D. K. Misra, “Radio Frequency and Microwave Communication Circuits”, Analysis and Design, John Wiley &amp; Sons, 2004."
  },
  "EC3552": [
    {
      title: "Principles of CMOS VLSI Design A System Perspective", // VLSI and Chip Design
      author: "Neil H E Weste, Kamran Eshranghian",
      publication: "Addison Wesley, 2009.",
      path: "Neil H E Weste, Kamran Eshranghian, “Principles of CMOS VLSI Design A System Perspective,” Addison Wesley, 2009."
    },
    {
      title: "Verilog HDLA guide to Digital Design and Synthesis",
      author: "Samir Palnitkar",
      publication: "Pearson Education, 2nd Edition, 2003.",
      path: "Samir Palnitkar, “Verilog HDLA guide to Digital Design and Synthesis”, Pearson Education, 2nd Edition, 2003."
    },
    {
      title: "CMOS Digital Integrated Circuits",
      author: "James M. Rabaey, Anantha Chandrakasan",
      publication: "PHI, 2016.",
      path: "James M. Rabaey, Anantha Chandrakasan, “CMOS Digital Integrated Circuits”, PHI, 2016."
    }
  ],
  "ET3491": [ // Embedded Systems and IOT design
    {
      title: "Internet – of- Things – A Hands on Approach",
      author: "Arshdeep Bahga, Vijay Madisetti",
      publication: "University Press, 2015.",
      path: "Arshdeep Bahga, Vijay Madisetti, “Internet – of- Things – A Hands on Approach”, University Press, 2015."
    },
    {
      title: "Computers as Components – Principles of Embedded Computing System Design",
      author: "Marilyn Wolf",
      publication: "Morgan Kaufmann, 3rd Edition, 2012.",
      path: "Marilyn Wolf, “Computers as Components – Principles of Embedded Computing System Design”, Morgan Kaufmann, 3rd Edition, 2012."
    },
    {
      title: "The 8051 Microcontroller and Embedded Systems Using Assembly and C",
      author: "Mohammed Ali Mazidi, Janice Gillispie Mazidi, Rolin D.McKinlay",
      publication: "Pearson, 2nd Edition, 2014.",
      path: "Mohammed Ali Mazidi, Janice Gillispie Mazidi, Rolin D.McKinlay, “The 8051 Microcontroller and Embedded Systems Using Assembly and C”, Pearson, 2nd Edition, 2014."
    }
  ]
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
  markPattern?: "2" | "5" | "10" | "13" | "15";  // Mark patterns for question types
  characterCount?: number;  // Character count for answers
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
    if (query.subject === "EC3352" && BOOK_REFERENCES["EC3352"]) {
      const book = BOOK_REFERENCES["EC3352"];
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
${query.markPattern ? `MARK PATTERN: ${query.markPattern}-mark question` : ''}
${query.characterCount ? `CHARACTER COUNT: Approximately ${query.characterCount} characters for answer` : ''}
GENERATE IMAGE: ${query.generateImage ? 'YES' : 'NO'}
SHOW RECOMMENDED RESOURCES: ${query.showRecommendedResources ? 'YES' : 'NO'}

DATA SOURCE SELECTION:
${dataSource}
${bookSpecifics}
${specificBookReference}`;

  // Different formatting based on knowledge level
  if (hasKnowledgeLevel) {
    // For responses with knowledge level - use exam question format
    prompt += `
${knowledgeLevelExplanation}

IMPORTANT: Create an exam question with a clear, concise answer for knowledge level ${query.knowledgeLevel}.

STEP 1: GENERATE QUESTION
Create one exam-style question about "${query.topic}"${query.subject ? ` related to ${query.subject}` : ''} appropriate for knowledge level ${query.knowledgeLevel}.
For reference: ${generatedQuestion}

STEP 2: PROVIDE CLEAR ANSWER
Provide a clear, structured answer with this format:

<div class="exam-content">
  <h2>Exam Question (${query.markPattern ? `${query.markPattern} Marks` : 'Standard Question'})</h2>
  <div class="question-box">
    [Your exam question here]
  </div>

  <h2>Model Answer</h2>
  
  <h3>Key Points</h3>
  <p>Start with 2-3 sentences that directly address the question.</p>
  ${query.characterCount ? `<p><em>Note: The answer is crafted to be approximately ${query.characterCount} characters in length as requested.</em></p>` : ''}
  
  <h3>Explanation</h3>
  <p>Provide a clear, simple explanation that's easy to understand. Focus on practical understanding rather than theory.</p>
  
  <!-- Format formulas like this -->
  <div class="formula">
    <strong>V = I × R</strong>
  </div>
  
  <!-- ALWAYS explain ALL variables after EACH formula -->
  <ul class="var-list">
    <li><strong>V</strong>: Voltage (in volts)</li>
    <li><strong>I</strong>: Current (in amperes)</li>
    <li><strong>R</strong>: Resistance (in ohms)</li>
  </ul>
  
  <!-- For more complex formulas -->
  <div class="formula">
    <strong>P = V × I = I<sup>2</sup> × R = V<sup>2</sup>/R</strong>
  </div>
  
  <ul class="var-list">
    <li><strong>P</strong>: Power (in watts)</li>
    <li><strong>V</strong>: Voltage (in volts)</li>
    <li><strong>I</strong>: Current (in amperes)</li>
    <li><strong>R</strong>: Resistance (in ohms)</li>
  </ul>
  
  ${query.generateImage ? '<h3>Visual Reference</h3><p>A brief description of the diagram that illustrates this concept.</p>' : ''}
  
  <h3>Application</h3>
  <p>Explain how this concept is applied in real-world engineering or practical situations.</p>
  
  <h3>References</h3>
  <p>Content from: [Book name], [Author], [Publication]</p>
</div>

STYLING GUIDELINES:
- Keep everything concise and student-friendly
- Use simple language and clear explanations
- Format ALL mathematical formulas with <div class="formula"><strong>...</strong></div>
- Always explain ALL variables used in EACH formula immediately after the formula
- Use proper symbols, superscripts and subscripts for all mathematical notations (×, ÷, <sup>2</sup>, <sub>n</sub>)
- Follow the exact character count if specified (${query.characterCount || "No specific count requested"})
- Highlight formulas with proper styling
- Total response should be under 700 words
- Format for easy scanning and quick understanding`;
  } else {
    // For responses without knowledge level - use simplified format
    prompt += `
RESPONSE FORMAT REQUIREMENTS:
Create a clear, concise explanation with these sections:

<h2>What is ${query.topic}?</h2>
<p>Provide a simple, straightforward definition that a student can easily understand.</p>

<h2>Key Concepts</h2>
<p>Break down the most important ideas about ${query.topic} in simple language. Keep explanations brief and clear.</p>

<h2>How It Works</h2>
<p>Explain the practical operation or application in a straightforward way.</p>

<h3>Mathematical Representation</h3>
<p>Present essential formulas clearly:</p>

<!-- Format equations like this -->
<div class="formula">
  <strong>V = I × R</strong>
</div>

<!-- After each formula, explain variables in a grid layout -->
<ul class="var-list">
  <li><strong>V</strong>: Voltage (in volts)</li>
  <li><strong>I</strong>: Current (in amperes)</li>
  <li><strong>R</strong>: Resistance (in ohms)</li>
</ul>

${query.generateImage ? '<h2>Visual Explanation</h2><p>A simple description of how this concept would be visualized.</p>' : ''}

<h2>Why It Matters</h2>
<p>Explain practical applications and importance to students in 2-3 sentences.</p>

<h2>References</h2>
<p>Content from: [Book name], [Author], [Publication]</p>

IMPORTANT NOTES FOR YOUR RESPONSE:
- Keep your explanation under 500 words total
- Use simple language a first-year student would understand
- Format mathematical content clearly with proper spacing
- Focus on helping students understand practical applications`;
  }
  
  // Add recommended resources section if needed
  if (query.showRecommendedResources) {
    prompt += `

<h2>Recommended Learning Resources</h2>
<p>Only include resources from the following verified sources, with direct clickable links.</p>

<h3>Video Tutorials</h3>
<ul>
  <li>For circuit analysis topics, use videos from:
    <ul>
      <li><a href="https://www.youtube.com/user/nesoacademy">Neso Academy</a></li>
      <li><a href="https://www.youtube.com/c/khanacademy">Khan Academy</a></li>
      <li><a href="https://www.youtube.com/c/MITOpenCourseWare">MIT OpenCourseWare</a></li>
      <li><a href="https://www.youtube.com/c/TheOrganicChemistryTutor">The Organic Chemistry Tutor</a> (electronics section)</li>
    </ul>
  </li>
</ul>

<h3>Online Courses</h3>
<ul>
  <li>For circuit analysis, recommend courses from:
    <ul>
      <li><a href="https://www.coursera.org/specializations/circuits-electronics">Coursera: Circuits and Electronics MicroMasters</a></li>
      <li><a href="https://www.edx.org/learn/circuit-design">edX: Circuit Design courses</a></li>
    </ul>
  </li>
</ul>

<h3>Reference Materials</h3> 
<ul>
  <li>For research papers, include links to:
    <ul>
      <li><a href="https://ieeexplore.ieee.org/Xplore/home.jsp">IEEE Xplore Digital Library</a></li>
      <li><a href="https://dl.acm.org/">ACM Digital Library</a></li>
    </ul>
  </li>
</ul>

<p><strong>Note:</strong> When selecting resources, prioritize topics specifically related to "${query.topic}" and ensure they are appropriate for the student's knowledge level.</p>`;
  }
  
  // Add formatting guidelines
  prompt += `

IMPORTANT FORMATTING GUIDELINES:
- Format all mathematics with clear, consistent HTML for optimal readability:
  <div class="formula">
    <strong>V = I × R</strong>
  </div>

- After EACH formula, explain all variables in a structured list:
  <ul>
    <li><strong>V</strong>: Voltage (in volts)</li>
    <li><strong>I</strong>: Current (in amperes)</li>
    <li><strong>R</strong>: Resistance (in ohms)</li>
  </ul>

- For derivations and mathematical processes, use numbered steps with clear progression:
  <ol>
    <li>Start with the basic equation: <strong>V = I × R</strong></li>
    <li>Rearrange to solve for current: <strong>I = V/R</strong></li>
  </ol>

- For complex mathematical expressions, use proper HTML for:
  * Fractions: Use formatting that preserves the numerator/denominator relationship
  * Subscripts: Use <sub> tags for indices (R<sub>1</sub>)
  * Superscripts: Use <sup> tags for exponents (10<sup>3</sup>)
  * Greek letters: Spell out in context (omega, alpha) or use HTML entities

- Use paragraph tags <p> for text blocks and proper section spacing
- Present all content in a visually organized, easy-to-follow structure
- Always maintain mathematical integrity exactly as presented in the textbook
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
  
  IMPORTANT FORMATTING GUIDELINES:
  - Structure your response with clear sections using HTML headings (<h2>, <h3>, etc.)
  - Format all mathematical formulas and equations with proper HTML, for example:
    <div class="formula">
      <strong>F = m × a</strong>
    </div>
    
  - After each formula, explain all variables with a bulleted list:
    <ul>
      <li><strong>F</strong>: Force (in newtons)</li>
      <li><strong>m</strong>: Mass (in kilograms)</li>
      <li><strong>a</strong>: Acceleration (in m/s²)</li>
    </ul>
    
  - For step-by-step derivations, number each step and show the transformation clearly
  - Use proper HTML formatting for subscripts (<sub>), superscripts (<sup>), and fractions
  - Use bullet points with <ul><li> tags for listing key concepts
  - Use paragraph tags <p> for better readability
  
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
      imageData: req.body.imageData,
      markPattern: req.body.markPattern,
      characterCount: req.body.characterCount ? parseInt(req.body.characterCount) : undefined
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
      // Extract the base64 part from the data URL
      const parts = query.imageData.split(',');
      const mimeMatch = parts[0].match(/data:(.*);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const data = parts[1];
      
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: data
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
    
    // Create activity record
    await storage.createUserActivity({
      userId,
      activityType: "ACADEMIC_CHAT",
      description: `Queried about "${query.topic}" ${query.knowledgeLevel ? `(${query.knowledgeLevel} level)` : ""}`
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
    
    // Create activity record
    await storage.createUserActivity({
      userId,
      activityType: "ADVANCED_CHAT",
      description: `Used advanced chatbot: "${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}"`
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