-- =====================================================
-- Books Table - DROP and RECREATE
-- This will DELETE ALL DATA in books table!
-- Run this to fix schema cache issues
-- =====================================================

-- Drop dependent objects first
DROP TRIGGER IF EXISTS update_books_updated_at ON books;

-- Drop the table
DROP TABLE IF EXISTS books CASCADE;

-- Recreate books table with ALL columns
CREATE TABLE books (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core fields
  title VARCHAR(500) NOT NULL,
  author VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image TEXT,
  
  -- Status and rating
  status VARCHAR(50) DEFAULT 'planned',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Reading progress
  pages_total INTEGER,
  pages_read INTEGER DEFAULT 0,
  
  -- Dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Book metadata
  genre VARCHAR(100),
  isbn VARCHAR(20),
  publisher VARCHAR(200),
  publish_year INTEGER,
  language VARCHAR(50),
  format VARCHAR(50),
  
  -- Notes and relations
  notes TEXT,
  collection_id BIGINT,
  
  -- Sync fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_synced ON books(synced);
CREATE INDEX idx_books_created_at ON books(created_at);
CREATE INDEX idx_books_updated_at ON books(updated_at);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own books" ON books;
DROP POLICY IF EXISTS "Users can insert own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

-- Create RLS policies
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

-- Create trigger for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- =====================================================
-- COMPLETE - Books table recreated
-- =====================================================
