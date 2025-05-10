import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { insertForumPostSchema, insertForumReplySchema } from "@shared/schema";

// Create a router
export const forumRouter = Router();

// Get all forum posts
forumRouter.get("/posts", async (req: Request, res: Response) => {
  try {
    const posts = await storage.getForumPosts();
    
    // For each post, get the user and the number of replies
    const postsWithDetails = await Promise.all(posts.map(async (post) => {
      const user = await storage.getUser(post.userId);
      const replies = await storage.getForumReplies(post.id);
      
      return {
        ...post,
        user: user ? {
          id: user.id,
          username: user.username,
          name: user.name
        } : null,
        replyCount: replies.length
      };
    }));
    
    res.json(postsWithDetails);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ message: "Error fetching forum posts" });
  }
});

// Get a specific forum post with replies
forumRouter.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await storage.getForumPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const user = await storage.getUser(post.userId);
    const replies = await storage.getForumReplies(postId);
    
    // For each reply, get the user
    const repliesWithUsers = await Promise.all(replies.map(async (reply) => {
      const replyUser = await storage.getUser(reply.userId);
      
      return {
        ...reply,
        user: replyUser ? {
          id: replyUser.id,
          username: replyUser.username,
          name: replyUser.name
        } : null
      };
    }));
    
    res.json({
      ...post,
      user: user ? {
        id: user.id,
        username: user.username,
        name: user.name
      } : null,
      replies: repliesWithUsers
    });
  } catch (error) {
    console.error("Error fetching forum post:", error);
    res.status(500).json({ message: "Error fetching forum post" });
  }
});

// Create a new forum post
forumRouter.post("/posts", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const validation = insertForumPostSchema.safeParse({
      ...req.body,
      userId: req.user!.id
    });
    
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid post data", errors: validation.error.format() });
    }
    
    const post = await storage.createForumPost(validation.data);
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user!.id,
      activityType: "FORUM_POST",
      description: `Created forum post: ${post.title}`
    });
    
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating forum post:", error);
    res.status(500).json({ message: "Error creating forum post" });
  }
});

// Create a reply to a forum post
forumRouter.post("/posts/:id/replies", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const postId = parseInt(req.params.id);
    const post = await storage.getForumPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const validation = insertForumReplySchema.safeParse({
      ...req.body,
      postId,
      userId: req.user!.id
    });
    
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid reply data", errors: validation.error.format() });
    }
    
    const reply = await storage.createForumReply(validation.data);
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user!.id,
      activityType: "FORUM_REPLY",
      description: `Replied to forum post: ${post.title}`
    });
    
    // Get the user for the reply
    const user = await storage.getUser(req.user!.id);
    
    res.status(201).json({
      ...reply,
      user: user ? {
        id: user.id,
        username: user.username,
        name: user.name
      } : null
    });
  } catch (error) {
    console.error("Error creating forum reply:", error);
    res.status(500).json({ message: "Error creating forum reply" });
  }
});

export default forumRouter;
