-- =====================================================
-- Recreate book_quotes table with UUID for id
-- =====================================================

-- Drop existing table
DROP TABLE IF EXISTS book_quotes CASCADE;

-- Recreate with UUID id
CREATE TABLE book_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Create indexes
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
  USING (auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR 
         (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL);

CREATE POLICY "Users can insert own book quotes"
  ON book_quotes FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR 
              (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL);

CREATE POLICY "Users can update own book quotes"
  ON book_quotes FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR 
         (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL);

CREATE POLICY "Users can delete own book quotes"
  ON book_quotes FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR 
         (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'book_quotes' 
ORDER BY ordinal_position;

-- =====================================================
-- COMPLETE
-- =====================================================
