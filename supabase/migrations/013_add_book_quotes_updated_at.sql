-- =====================================================
-- Book Quotes Table - Fix missing updated_at column
-- =====================================================

-- Add missing updated_at column
ALTER TABLE book_quotes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'book_quotes' 
ORDER BY ordinal_position;

-- =====================================================
-- COMPLETE
-- =====================================================
