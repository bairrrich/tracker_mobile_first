-- =====================================================
-- Book Quotes Table - CREATE
-- Run this to enable quotes sync
-- =====================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS book_quotes CASCADE;

-- Create book_quotes table
CREATE TABLE book_quotes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id BIGINT REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_book_quotes_user_id ON book_quotes(user_id);
CREATE INDEX idx_book_quotes_book_id ON book_quotes(book_id);
CREATE INDEX idx_book_quotes_synced ON book_quotes(synced);

-- Enable RLS
ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Users can insert own book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Users can update own book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Users can delete own book quotes" ON book_quotes;

CREATE POLICY "Users can view own book quotes"
  ON book_quotes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own book quotes"
  ON book_quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own book quotes"
  ON book_quotes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own book quotes"
  ON book_quotes FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'book_quotes' ORDER BY ordinal_position;

-- =====================================================
-- COMPLETE
-- =====================================================
