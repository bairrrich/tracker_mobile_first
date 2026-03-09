-- =====================================================
-- Add tombstone fields for offline-first soft deletes
-- This enables proper sync of deletions across devices
-- =====================================================

-- Add deleted and deleted_at columns to all tables
-- deleted: boolean flag indicating soft delete
-- deleted_at: timestamp when record was soft deleted

-- 1. COLLECTIONS
ALTER TABLE collections ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_collections_deleted ON collections(deleted);
CREATE INDEX IF NOT EXISTS idx_collections_deleted_at ON collections(deleted_at);

-- 2. ITEMS
ALTER TABLE items ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_items_deleted ON items(deleted);
CREATE INDEX IF NOT EXISTS idx_items_deleted_at ON items(deleted_at);

-- 3. BOOKS
ALTER TABLE books ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE books ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_books_deleted ON books(deleted);
CREATE INDEX IF NOT EXISTS idx_books_deleted_at ON books(deleted_at);

-- 4. BOOK_QUOTES
ALTER TABLE book_quotes ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE book_quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_book_quotes_deleted ON book_quotes(deleted);
CREATE INDEX IF NOT EXISTS idx_book_quotes_deleted_at ON book_quotes(deleted_at);

-- 5. METRICS
ALTER TABLE metrics ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE metrics ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_metrics_deleted ON metrics(deleted);
CREATE INDEX IF NOT EXISTS idx_metrics_deleted_at ON metrics(deleted_at);

-- 6. HISTORY
ALTER TABLE history ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE history ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_history_deleted ON history(deleted);
CREATE INDEX IF NOT EXISTS idx_history_deleted_at ON history(deleted_at);

-- 7. TAGS
ALTER TABLE tags ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_tags_deleted ON tags(deleted);
CREATE INDEX IF NOT EXISTS idx_tags_deleted_at ON tags(deleted_at);

-- 8. ITEM_TAGS
ALTER TABLE item_tags ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE item_tags ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_item_tags_deleted ON item_tags(deleted);
CREATE INDEX IF NOT EXISTS idx_item_tags_deleted_at ON item_tags(deleted_at);

-- 9. NOTES
ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(deleted);
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at);

-- =====================================================
-- Update RLS policies to include deleted records
-- (so clients can sync tombstones)
-- =====================================================

-- Refresh RLS policies for all tables to allow reading deleted records
-- Users can still only see their own records (including deleted ones)

-- =====================================================
-- Create function to hard delete old tombstones
-- Run this periodically (e.g., daily via cron)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_tombstones(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
  
  -- Delete old tombstones from each table
  WITH deleted AS (
    DELETE FROM collections WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM items WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM books WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM book_quotes WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM metrics WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM history WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM tags WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM item_tags WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  WITH deleted AS (
    DELETE FROM notes WHERE deleted = TRUE AND deleted_at < cutoff_date
    RETURNING 1
  )
  SELECT deleted_count + COUNT(*)::INTEGER INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Create view for active (non-deleted) records
-- Use this in your queries by default
-- =====================================================

-- Example: CREATE VIEW active_collections AS SELECT * FROM collections WHERE deleted = FALSE OR deleted IS NULL;
-- You can create similar views for each table if needed

-- =====================================================
-- Refresh schema cache
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- Verification
-- =====================================================

SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN (
  'collections', 'items', 'books', 'book_quotes',
  'metrics', 'history', 'tags', 'item_tags', 'notes'
)
AND column_name IN ('deleted', 'deleted_at')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- COMPLETE
-- =====================================================
