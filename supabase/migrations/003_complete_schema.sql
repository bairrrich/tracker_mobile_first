-- =====================================================
-- All Tracker Mobile - Complete Schema with user_id
-- Idempotent migration (safe to run multiple times)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Tables with user_id from the start
-- =====================================================

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Add foreign key if it doesn't exist
DO $$ BEGIN
  ALTER TABLE collections ADD CONSTRAINT collections_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  collection_id BIGINT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  status VARCHAR(50) DEFAULT 'active',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

DO $$ BEGIN
  ALTER TABLE items ADD CONSTRAINT items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE items ADD CONSTRAINT items_collection_id_fkey 
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
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
  collection_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

DO $$ BEGIN
  ALTER TABLE books ADD CONSTRAINT books_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Book Quotes table
CREATE TABLE IF NOT EXISTS book_quotes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  book_id BIGINT,
  text TEXT NOT NULL,
  page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

DO $$ BEGIN
  ALTER TABLE book_quotes ADD CONSTRAINT book_quotes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE book_quotes ADD CONSTRAINT book_quotes_book_id_fkey 
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  item_id BIGINT,
  type VARCHAR(50) NOT NULL,
  value DECIMAL NOT NULL,
  unit VARCHAR(50),
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE metrics ADD CONSTRAINT metrics_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- History table
CREATE TABLE IF NOT EXISTS history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  item_id BIGINT,
  action VARCHAR(50) NOT NULL,
  value DECIMAL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE history ADD CONSTRAINT history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE tags ADD CONSTRAINT tags_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Item Tags junction table
CREATE TABLE IF NOT EXISTS item_tags (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT,
  tag_id BIGINT,
  UNIQUE(item_id, tag_id)
);

DO $$ BEGIN
  ALTER TABLE item_tags ADD CONSTRAINT item_tags_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE item_tags ADD CONSTRAINT item_tags_tag_id_fkey 
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  item_id BIGINT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE notes ADD CONSTRAINT notes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- Sync Queue table
CREATE TABLE IF NOT EXISTS sync_queue (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  table_name VARCHAR(50) NOT NULL,
  record_id BIGINT NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  data JSONB,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE sync_queue ADD CONSTRAINT sync_queue_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN foreign_key_violation THEN NULL;
       WHEN duplicate_object THEN NULL;
       WHEN undefined_column THEN NULL;
END $$;

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type);
CREATE INDEX IF NOT EXISTS idx_collections_synced ON collections(synced);

CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_collection_id ON items(collection_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_synced ON items(synced);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_synced ON books(synced);

CREATE INDEX IF NOT EXISTS idx_book_quotes_user_id ON book_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_book_quotes_book_id ON book_quotes(book_id);

CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_item_id ON metrics(item_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(date);

CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_item_id ON history(item_id);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_item_id ON notes(item_id);

CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced);
CREATE INDEX IF NOT EXISTS idx_sync_queue_table_name ON sync_queue(table_name);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

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

-- Drop existing policies if they exist and recreate
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own collections" ON collections;
  DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
  DROP POLICY IF EXISTS "Users can update own collections" ON collections;
  DROP POLICY IF EXISTS "Users can delete own collections" ON collections;
  
  CREATE POLICY "Users can view own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can update own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can delete own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own items" ON items;
  DROP POLICY IF EXISTS "Users can insert own items" ON items;
  DROP POLICY IF EXISTS "Users can update own items" ON items;
  DROP POLICY IF EXISTS "Users can delete own items" ON items;
  
  CREATE POLICY "Users can view own items"
    ON items FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own items"
    ON items FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can update own items"
    ON items FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can delete own items"
    ON items FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own books" ON books;
  DROP POLICY IF EXISTS "Users can insert own books" ON books;
  DROP POLICY IF EXISTS "Users can update own books" ON books;
  DROP POLICY IF EXISTS "Users can delete own books" ON books;
  
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
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own metrics" ON metrics;
  DROP POLICY IF EXISTS "Users can insert own metrics" ON metrics;
  
  CREATE POLICY "Users can view own metrics"
    ON metrics FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own metrics"
    ON metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own history" ON history;
  DROP POLICY IF EXISTS "Users can insert own history" ON history;
  
  CREATE POLICY "Users can view own history"
    ON history FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own history"
    ON history FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own tags" ON tags;
  DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
  DROP POLICY IF EXISTS "Users can update own tags" ON tags;
  DROP POLICY IF EXISTS "Users can delete own tags" ON tags;
  
  CREATE POLICY "Users can view own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can update own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can delete own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own item tags" ON item_tags;
  DROP POLICY IF EXISTS "Users can insert own item tags" ON item_tags;
  DROP POLICY IF EXISTS "Users can delete own item tags" ON item_tags;
  
  CREATE POLICY "Users can view own item tags"
    ON item_tags FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM items WHERE items.id = item_tags.item_id 
      AND (auth.uid() = items.user_id OR items.user_id IS NULL)
    ));
  
  CREATE POLICY "Users can insert own item tags"
    ON item_tags FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM items WHERE items.id = item_tags.item_id 
      AND (auth.uid() = items.user_id OR items.user_id IS NULL)
    ));
  
  CREATE POLICY "Users can delete own item tags"
    ON item_tags FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM items WHERE items.id = item_tags.item_id 
      AND (auth.uid() = items.user_id OR items.user_id IS NULL)
    ));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own notes" ON notes;
  DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
  DROP POLICY IF EXISTS "Users can update own notes" ON notes;
  DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
  
  CREATE POLICY "Users can view own notes"
    ON notes FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can update own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can delete own notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own sync queue" ON sync_queue;
  DROP POLICY IF EXISTS "Users can insert own sync queue" ON sync_queue;
  DROP POLICY IF EXISTS "Users can update own sync queue" ON sync_queue;
  DROP POLICY IF EXISTS "Users can delete own sync queue" ON sync_queue;
  
  CREATE POLICY "Users can view own sync queue"
    ON sync_queue FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can insert own sync queue"
    ON sync_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can update own sync queue"
    ON sync_queue FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);
  
  CREATE POLICY "Users can delete own sync queue"
    ON sync_queue FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
