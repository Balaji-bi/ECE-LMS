import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import chatbotRouter from "./chatbot";
import contentToolsRouter from "./contentTools";
import newsRouter from "./newsAggregator";
import forumRouter from "./forum";
import syllabusRouter from "./syllabusNavigator";
import imageGenRouter from "./imageGen";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  app.use("/api/chatbot", chatbotRouter);
  app.use("/api/content-tools", contentToolsRouter);
  app.use("/api/news", newsRouter);
  app.use("/api/forum", forumRouter);
  app.use("/api/syllabus", syllabusRouter);
  app.use("/api/image", imageGenRouter);
  
  // Get user activities
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const activities = await storage.getUserActivities(req.user!.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Error fetching user activities" });
    }
  });
  
  // Update user settings
  app.post("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // In a real application, this would update user settings in the database
    res.json({ message: "Settings updated successfully" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
