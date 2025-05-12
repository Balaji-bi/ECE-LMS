import { 
  users, User, InsertUser, 
  chatMessages, ChatMessage, InsertChatMessage,
  news, News, InsertNews,
  forumPosts, ForumPost, InsertForumPost,
  forumReplies, ForumReply, InsertForumReply,
  userActivities, UserActivity, InsertUserActivity
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { db } from "./db";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
import connectPg from "connect-pg-simple";
import { eq, desc, and } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Chat operations
  getChatMessages(userId: number, isAdvanced: boolean): Promise<ChatMessage[]>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  
  // News operations
  getNews(): Promise<News[]>;
  createNews(newsItem: InsertNews): Promise<News>;
  
  // Forum operations
  getForumPosts(): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(forumPost: InsertForumPost): Promise<ForumPost>;
  likeForumPost(postId: number): Promise<ForumPost>;
  getForumReplies(postId: number): Promise<ForumReply[]>;
  createForumReply(forumReply: InsertForumReply): Promise<ForumReply>;
  
  // User activity operations
  getUserActivities(userId: number): Promise<UserActivity[]>;
  createUserActivity(userActivity: InsertUserActivity): Promise<UserActivity>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatMessages: Map<number, ChatMessage>;
  private newsItems: Map<number, News>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  private userActivities: Map<number, UserActivity>;
  sessionStore: session.Store;
  
  private currentIds: {
    users: number;
    chatMessages: number;
    news: number;
    forumPosts: number;
    forumReplies: number;
    userActivities: number;
  };
  
  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.newsItems = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.userActivities = new Map();
    
    this.currentIds = {
      users: 0,
      chatMessages: 0,
      news: 0,
      forumPosts: 0,
      forumReplies: 0,
      userActivities: 0
    };
    
    // Initialize with sample news
    this.initializeNews();
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.currentIds.users;
    const createdAt = new Date();
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      department: insertUser.department || ""
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    // Delete the user
    this.users.delete(id);
    
    // Delete associated data
    const chatMessagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([_, message]) => message.userId === id)
      .map(([messageId]) => messageId);
      
    chatMessagesToDelete.forEach(messageId => {
      this.chatMessages.delete(messageId);
    });
    
    const forumPostsToDelete = Array.from(this.forumPosts.entries())
      .filter(([_, post]) => post.userId === id)
      .map(([postId]) => postId);
      
    forumPostsToDelete.forEach(postId => {
      this.forumPosts.delete(postId);
    });
    
    const forumRepliesToDelete = Array.from(this.forumReplies.entries())
      .filter(([_, reply]) => reply.userId === id)
      .map(([replyId]) => replyId);
      
    forumRepliesToDelete.forEach(replyId => {
      this.forumReplies.delete(replyId);
    });
    
    const userActivitiesToDelete = Array.from(this.userActivities.entries())
      .filter(([_, activity]) => activity.userId === id)
      .map(([activityId]) => activityId);
      
    userActivitiesToDelete.forEach(activityId => {
      this.userActivities.delete(activityId);
    });
  }
  
  // Chat operations
  async getChatMessages(userId: number, isAdvanced: boolean): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId && message.isAdvanced === isAdvanced)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
    
    return messages;
  }
  
  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = ++this.currentIds.chatMessages;
    const createdAt = new Date();
    
    const chatMessage: ChatMessage = { 
      ...insertChatMessage, 
      id, 
      createdAt,
      isAdvanced: insertChatMessage.isAdvanced ?? false
    };
    
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }
  
  // News operations
  async getNews(): Promise<News[]> {
    return Array.from(this.newsItems.values())
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
  }
  
  async createNews(insertNews: InsertNews): Promise<News> {
    const id = ++this.currentIds.news;
    const publishedAt = new Date();
    
    const newsItem: News = { 
      ...insertNews, 
      id, 
      publishedAt, 
      category: insertNews.category ?? null, 
      source: insertNews.source ?? null, 
      url: insertNews.url ?? null 
    };
    
    this.newsItems.set(id, newsItem);
    return newsItem;
  }
  
  // Forum operations
  async getForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }
  
  async createForumPost(insertForumPost: InsertForumPost): Promise<ForumPost> {
    const id = ++this.currentIds.forumPosts;
    const createdAt = new Date();
    
    const forumPost: ForumPost = { 
      ...insertForumPost, 
      id, 
      createdAt,
      likes: 0
    };
    
    this.forumPosts.set(id, forumPost);
    return forumPost;
  }
  
  async likeForumPost(postId: number): Promise<ForumPost> {
    const post = this.forumPosts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    post.likes = (post.likes || 0) + 1;
    this.forumPosts.set(postId, post);
    return post;
  }
  
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values())
      .filter(reply => reply.postId === postId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }
  
  async createForumReply(insertForumReply: InsertForumReply): Promise<ForumReply> {
    const id = ++this.currentIds.forumReplies;
    const createdAt = new Date();
    
    const forumReply: ForumReply = { ...insertForumReply, id, createdAt };
    
    this.forumReplies.set(id, forumReply);
    return forumReply;
  }
  
  // User activity operations
  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return Array.from(this.userActivities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async createUserActivity(insertUserActivity: InsertUserActivity): Promise<UserActivity> {
    const id = ++this.currentIds.userActivities;
    const createdAt = new Date();
    
    const userActivity: UserActivity = { ...insertUserActivity, id, createdAt };
    
    this.userActivities.set(id, userActivity);
    return userActivity;
  }
  
  private initializeNews(): void {
    // Sample news data
    const sampleNews = [
      {
        title: "Anna University Announces New IoT Lab for ECE Department",
        description: "The new laboratory will feature state-of-the-art equipment for Internet of Things research and development.",
        content: "The new laboratory will feature state-of-the-art equipment for Internet of Things research and development.",
        category: "Department News"
      },
      {
        title: "IEEE Conference Paper Submissions Due Next Week",
        description: "Final date for paper submissions is August 15th. Students are encouraged to participate.",
        content: "Final date for paper submissions is August 15th. Students are encouraged to participate.",
        category: "Academic Alert"
      },
      {
        title: "Latest Advances in 5G Technology - ECE Seminar",
        description: "Join us for a special seminar on 5G technology featuring industry experts from Nokia.",
        content: "Join us for a special seminar on 5G technology featuring industry experts from Nokia.",
        category: "Event"
      }
    ];
    
    // Add sample news if none exist
    if (this.newsItems.size === 0) {
      sampleNews.forEach(item => {
        this.createNews(item);
      });
    }
  }
}

// PostgreSQL implementation for production
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    // Start a transaction to ensure all deletions are atomic
    await db.transaction(async (tx) => {
      // Delete user activities first (foreign key constraint)
      await tx.delete(userActivities).where(eq(userActivities.userId, id));
      
      // Delete chat messages
      await tx.delete(chatMessages).where(eq(chatMessages.userId, id));
      
      // Delete forum replies
      await tx.delete(forumReplies).where(eq(forumReplies.userId, id));
      
      // Delete forum posts (note: this will cascade delete associated replies if your DB has foreign key constraints)
      await tx.delete(forumPosts).where(eq(forumPosts.userId, id));
      
      // Finally, delete the user
      await tx.delete(users).where(eq(users.id, id));
    });
  }
  
  // Chat operations
  async getChatMessages(userId: number, isAdvanced: boolean): Promise<ChatMessage[]> {
    return db.select()
      .from(chatMessages)
      .where(and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.isAdvanced, isAdvanced)
      ))
      .orderBy(chatMessages.createdAt);
  }
  
  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages)
      .values(insertChatMessage)
      .returning();
    return chatMessage;
  }
  
  // News operations
  async getNews(): Promise<News[]> {
    return db.select()
      .from(news)
      .orderBy(desc(news.publishedAt));
  }
  
  async createNews(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news)
      .values(insertNews)
      .returning();
    return newsItem;
  }
  
  // Forum operations
  async getForumPosts(): Promise<ForumPost[]> {
    return db.select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.createdAt));
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const [post] = await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id));
    return post;
  }
  
  async createForumPost(insertForumPost: InsertForumPost): Promise<ForumPost> {
    const [forumPost] = await db.insert(forumPosts)
      .values(insertForumPost)
      .returning();
    return forumPost;
  }
  
  async likeForumPost(postId: number): Promise<ForumPost> {
    const [post] = await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.id, postId));
      
    if (!post) {
      throw new Error('Post not found');
    }
    
    const [updatedPost] = await db.update(forumPosts)
      .set({ likes: post.likes + 1 })
      .where(eq(forumPosts.id, postId))
      .returning();
      
    return updatedPost;
  }
  
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return db.select()
      .from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);
  }
  
  async createForumReply(insertForumReply: InsertForumReply): Promise<ForumReply> {
    const [forumReply] = await db.insert(forumReplies)
      .values(insertForumReply)
      .returning();
    return forumReply;
  }
  
  // User activity operations
  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return db.select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt));
  }
  
  async createUserActivity(insertUserActivity: InsertUserActivity): Promise<UserActivity> {
    const [userActivity] = await db.insert(userActivities)
      .values(insertUserActivity)
      .returning();
    return userActivity;
  }
}

// Initialize with sample news if needed
const initializeNews = async (storage: DatabaseStorage) => {
  try {
    const existingNews = await db.select().from(news);
    
    if (existingNews.length === 0) {
      const sampleNews = [
        {
          title: "Anna University Announces New IoT Lab for ECE Department",
          description: "The new laboratory will feature state-of-the-art equipment for Internet of Things research and development.",
          category: "Department News"
        },
        {
          title: "IEEE Conference Paper Submissions Due Next Week",
          description: "Final date for paper submissions is August 15th. Students are encouraged to participate.",
          category: "Academic Alert"
        },
        {
          title: "Latest Advances in 5G Technology - ECE Seminar",
          description: "Join us for a special seminar on 5G technology featuring industry experts from Nokia.",
          category: "Event"
        }
      ];
      
      for (const item of sampleNews) {
        await storage.createNews({
          ...item,
          content: item.description // Use description as content if no specific content is provided
        });
      }
    }
  } catch (error) {
    console.error("Error initializing news:", error);
  }
};

// Export the database storage implementation
export const storage = new DatabaseStorage();

// Initialize sample data (wrapped in try/catch to handle initial schema issues)
initializeNews(storage).catch(console.error);