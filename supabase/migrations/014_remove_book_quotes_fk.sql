-- =====================================================
-- Book Quotes - Remove foreign key constraint
-- This allows quotes to be synced before books
-- =====================================================

-- Drop the foreign key constraint
ALTER TABLE book_quotes 
DROP CONSTRAINT IF EXISTS book_quotes_book_id_fkey;

-- Recreate without CASCADE (just for reference)
-- Or leave it without constraint for flexibility
ALTER TABLE book_quotes 
ALTER COLUMN book_id DROP NOT NULL;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'book_quotes';

-- =====================================================
-- COMPLETE
-- =====================================================
