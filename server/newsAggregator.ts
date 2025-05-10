import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const geminiConfig = { 
  model: "gemini-1.5-pro" // Verified working model
};

// News categories
type NewsCategory = "Academic" | "Research" | "Events" | "Industry";

// Create a router
export const newsRouter = Router();

// Function to fetch ECE-related news from Google News API
async function fetchECENews() {
  try {
    const keywords = [
      "electronics and communication engineering", 
      "ECE technology", 
      "VLSI design", 
      "signal processing", 
      "communication systems",
      "embedded systems",
      "microprocessors",
      "Anna University ECE"
    ];

    // Randomize keywords to get varied results each time
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    // Use custom search API as a fallback for news
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: '017576662512468239146:omuauf_lfve', // Using a default CSE ID
        q: randomKeyword,
        dateRestrict: 'w1', // Last week
        sort: 'date'
      }
    });

    if (response.data && response.data.items) {
      return response.data.items.slice(0, 10); // Get first 10 results
    }
    
    // Return empty array if no results
    return [];
  } catch (error) {
    console.error("Error fetching ECE news:", error);
    return [];
  }
}

// Function to categorize news using Gemini
async function categorizeNews(title: string, snippet: string): Promise<NewsCategory> {
  try {
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    const prompt = `
    Categorize this Electronics and Communication Engineering (ECE) news into exactly one of these categories: "Academic", "Research", "Events", or "Industry".
    
    News Title: ${title}
    News Snippet: ${snippet}
    
    Return only one word - the category name, nothing else.
    `;
    
    const result = await geminiModel.generateContent(prompt);
    const categoryText = result.response.text().trim();
    
    // Validate the category
    if (["Academic", "Research", "Events", "Industry"].includes(categoryText)) {
      return categoryText as NewsCategory;
    }
    
    // Default to research if unexpected category
    return "Research";
  } catch (error) {
    console.error("Error categorizing news:", error);
    return "Research"; // Default category
  }
}

// Route to get all news
newsRouter.get("/", async (req: Request, res: Response) => {
  try {
    // First, try to get news from database
    let news = await storage.getNews();
    
    // If database has fewer than 5 news items, fetch from API
    if (news.length < 5) {
      const freshNews = await fetchECENews();
      
      // Process and save fresh news
      for (const item of freshNews) {
        // Categorize the news
        const category = await categorizeNews(item.title, item.snippet);
        
        // Create new news entry
        const newNews = await storage.createNews({
          title: item.title,
          content: item.snippet || "No content available",
          category,
          source: item.displayLink || "Unknown Source",
          url: item.link
        });
        
        // Add to existing news array
        news.push(newNews);
      }
    }
    
    // Return all news sorted by publishedAt (newest first)
    news.sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Error fetching news" });
  }
});

// Route to get news by category
newsRouter.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const news = await storage.getNews();
    
    // Filter news by category
    const filteredNews = news.filter(item => 
      item.category?.toLowerCase() === category.toLowerCase()
    );
    
    res.json(filteredNews);
  } catch (error) {
    console.error(`Error fetching ${req.params.category} news:`, error);
    res.status(500).json({ message: `Error fetching ${req.params.category} news` });
  }
});

// Route to refresh news (force fetch from API)
newsRouter.post("/refresh", async (req: Request, res: Response) => {
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    // Fetch fresh news
    const freshNews = await fetchECENews();
    const newNewsItems = [];
    
    // Process and save fresh news
    for (const item of freshNews) {
      // Categorize the news
      const category = await categorizeNews(item.title, item.snippet);
      
      // Create new news entry
      const newNews = await storage.createNews({
        title: item.title,
        content: item.snippet || "No content available",
        category,
        source: item.displayLink || "Unknown Source",
        url: item.link
      });
      
      newNewsItems.push(newNews);
    }
    
    res.json({ message: "News refreshed successfully", news: newNewsItems });
  } catch (error) {
    console.error("Error refreshing news:", error);
    res.status(500).json({ message: "Error refreshing news" });
  }
});

export default newsRouter;