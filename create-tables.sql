-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  is_advanced BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP DEFAULT NOW()
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- Insert sample news data
INSERT INTO news (title, description, category)
VALUES 
  ('Anna University Announces New IoT Lab for ECE Department', 'The new laboratory will feature state-of-the-art equipment for Internet of Things research and development.', 'Department News'),
  ('IEEE Conference Paper Submissions Due Next Week', 'Final date for paper submissions is August 15th. Students are encouraged to participate.', 'Academic Alert'),
  ('Latest Advances in 5G Technology - ECE Seminar', 'Join us for a special seminar on 5G technology featuring industry experts from Nokia.', 'Event')
ON CONFLICT DO NOTHING;