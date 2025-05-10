import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

// Configure neon with WebSocket
neonConfig.webSocketConstructor = ws;

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrationScript() {
  const client = await pool.connect();
  console.log('Connected to database, running migration...');
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if news table exists
    const tableCheck = await client.query(`
      SELECT to_regclass('public.news') as exists;
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('News table exists, altering it...');
      
      // Check if content column already exists to avoid errors
      const contentCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'content';
      `);
      
      if (contentCheck.rows.length === 0) {
        // Add content column
        await client.query(`
          ALTER TABLE news ADD COLUMN IF NOT EXISTS content TEXT;
        `);
        
        // Copy data from description to content
        await client.query(`
          UPDATE news SET content = description WHERE content IS NULL;
        `);
      }
      
      // Check for other columns and add them if they don't exist
      const sourceCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'source';
      `);
      
      if (sourceCheck.rows.length === 0) {
        await client.query(`
          ALTER TABLE news ADD COLUMN IF NOT EXISTS source TEXT;
        `);
      }
      
      const urlCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'url';
      `);
      
      if (urlCheck.rows.length === 0) {
        await client.query(`
          ALTER TABLE news ADD COLUMN IF NOT EXISTS url TEXT;
        `);
      }
      
      console.log('Table news successfully updated with new columns');
    } else {
      console.log('News table does not exist, creating it...');
      
      // Create news table with all required columns
      await client.query(`
        CREATE TABLE news (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          description TEXT,
          category TEXT,
          source TEXT,
          url TEXT,
          published_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('Table news created successfully');
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully');
    
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrationScript().catch(console.error);