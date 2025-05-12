import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon

// Verify DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL'))
  .catch(err => console.error('Failed to connect to PostgreSQL:', err));




export const db = drizzle(pool, { schema });
