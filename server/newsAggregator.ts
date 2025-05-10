import { Request, Response, Router } from "express";
import { storage } from "./storage";

// Create a router
export const newsRouter = Router();

// Route to get all news
newsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const news = await storage.getNews();
    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Error fetching news" });
  }
});

export default newsRouter;
