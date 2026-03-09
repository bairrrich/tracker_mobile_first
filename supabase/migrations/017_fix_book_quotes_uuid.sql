-- =====================================================
-- Update book_quotes table to use UUID for book_id
-- =====================================================

-- Drop existing foreign key constraint
ALTER TABLE book_quotes 
DROP CONSTRAINT IF EXISTS book_quotes_book_id_fkey;

-- Change book_id column type from BIGINT to UUID
-- First, we need to drop and recreate the column
ALTER TABLE book_quotes 
DROP COLUMN IF EXISTS book_id;

ALTER TABLE book_quotes 
ADD COLUMN book_id UUID REFERENCES books(id) ON DELETE CASCADE;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_book_quotes_book_id ON book_quotes(book_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'book_quotes' 
ORDER BY ordinal_position;

-- =====================================================
-- COMPLETE
-- =====================================================
