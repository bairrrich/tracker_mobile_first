-- =====================================================
-- Add user_id columns to all tables
-- Run this FIRST before 003_complete_schema.sql
-- =====================================================

-- Add user_id to collections
DO $$ BEGIN
  ALTER TABLE collections ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to items
DO $$ BEGIN
  ALTER TABLE items ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to books
DO $$ BEGIN
  ALTER TABLE books ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to book_quotes
DO $$ BEGIN
  ALTER TABLE book_quotes ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- Add user_id to metrics
DO $$ BEGIN
  ALTER TABLE metrics ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to history
DO $$ BEGIN
  ALTER TABLE history ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to tags
DO $$ BEGIN
  ALTER TABLE tags ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to notes
DO $$ BEGIN
  ALTER TABLE notes ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add user_id to sync_queue
DO $$ BEGIN
  ALTER TABLE sync_queue ADD COLUMN user_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Now add foreign keys
DO $$ BEGIN
  ALTER TABLE collections ADD CONSTRAINT collections_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE items ADD CONSTRAINT items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE books ADD CONSTRAINT books_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE book_quotes ADD CONSTRAINT book_quotes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE metrics ADD CONSTRAINT metrics_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE history ADD CONSTRAINT history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE tags ADD CONSTRAINT tags_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE notes ADD CONSTRAINT notes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE sync_queue ADD CONSTRAINT sync_queue_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_book_quotes_user_id ON book_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
