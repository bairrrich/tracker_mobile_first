-- =====================================================
-- FORCE RECREATE books table with UUID
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop all dependent objects first
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
DROP POLICY IF EXISTS "Users can view own books" ON books;
DROP POLICY IF EXISTS "Users can insert own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

-- Drop the table
DROP TABLE IF EXISTS books CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table with UUID
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image TEXT,
  status VARCHAR(50) DEFAULT 'planned',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  pages_total INTEGER,
  pages_read INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  genre VARCHAR(100),
  isbn VARCHAR(20),
  publisher VARCHAR(200),
  publish_year INTEGER,
  language VARCHAR(50),
  format VARCHAR(50),
  notes TEXT,
  collection_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_synced ON books(synced);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Force refresh schema
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(2);
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'books' AND column_name = 'id';

-- =====================================================
-- COMPLETE
-- =====================================================
