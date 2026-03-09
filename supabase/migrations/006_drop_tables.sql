-- =====================================================
-- All Tracker Mobile - DROP ALL TABLES
-- WARNING: This will DELETE ALL DATA!
-- Run this first, then run 007_create_schema.sql
-- =====================================================

-- Drop triggers (ignore errors if they don't exist)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_items_updated_at ON items;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_books_updated_at ON books;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Drop tables in reverse dependency order (ignore errors)
DO $$ BEGIN
  DROP TABLE IF EXISTS sync_queue CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS notes CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS item_tags CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS tags CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS history CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS metrics CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS book_quotes CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS books CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS items CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS collections CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Drop function
DO $$ BEGIN
  DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

-- =====================================================
-- COMPLETE - All tables dropped (or didn't exist)
-- Next: Run 007_create_schema.sql
-- =====================================================
