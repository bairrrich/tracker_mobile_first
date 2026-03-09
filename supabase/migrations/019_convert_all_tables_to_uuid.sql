-- =====================================================
-- Convert ALL tables to use UUID primary keys
-- This ensures consistency across Supabase, IndexedDB, and client code
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COLLECTIONS
-- =====================================================

-- Drop dependent objects
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS collections_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Migrate data
INSERT INTO collections_new (id, user_id, name, type, icon, color, description, created_at, updated_at, synced)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  name,
  type,
  icon,
  color,
  description,
  created_at,
  updated_at,
  synced
FROM collections;

-- Replace old table
DROP TABLE IF EXISTS collections CASCADE;
ALTER TABLE collections_new RENAME TO collections;

-- Create indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_type ON collections(type);
CREATE INDEX idx_collections_synced ON collections(synced);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- =====================================================
-- 2. ITEMS
-- =====================================================

-- Drop dependent objects
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS items_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  status VARCHAR(50) DEFAULT 'active',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Migrate data
INSERT INTO items_new (id, user_id, collection_id, name, description, image, status, rating, created_at, updated_at, synced)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM collections WHERE collections.id = items.collection_id LIMIT 1) as collection_id,
  name,
  description,
  image,
  status,
  rating,
  created_at,
  updated_at,
  synced
FROM items;

-- Replace old table
DROP TABLE IF EXISTS items CASCADE;
ALTER TABLE items_new RENAME TO items;

-- Create indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_collection_id ON items(collection_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_synced ON items(synced);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- =====================================================
-- 3. METRICS
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own metrics" ON metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON metrics;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS metrics_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  value DECIMAL NOT NULL,
  unit VARCHAR(50),
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data
INSERT INTO metrics_new (id, user_id, item_id, type, value, unit, date, created_at)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM items WHERE items.id = metrics.item_id LIMIT 1) as item_id,
  type,
  value,
  unit,
  date,
  created_at
FROM metrics;

-- Replace old table
DROP TABLE IF EXISTS metrics CASCADE;
ALTER TABLE metrics_new RENAME TO metrics;

-- Create indexes
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_item_id ON metrics(item_id);
CREATE INDEX idx_metrics_date ON metrics(date);

-- Enable RLS
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own metrics"
  ON metrics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own metrics"
  ON metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 4. HISTORY
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS history_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  value DECIMAL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data
INSERT INTO history_new (id, user_id, item_id, action, value, note, created_at)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM items WHERE items.id = history.item_id LIMIT 1) as item_id,
  action,
  value,
  note,
  created_at
FROM history;

-- Replace old table
DROP TABLE IF EXISTS history CASCADE;
ALTER TABLE history_new RENAME TO history;

-- Create indexes
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_item_id ON history(item_id);

-- Enable RLS
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 5. TAGS
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
DROP POLICY IF EXISTS "Users can update own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON tags;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS tags_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data
INSERT INTO tags_new (id, user_id, name, color, created_at)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  name,
  color,
  created_at
FROM tags;

-- Replace old table
DROP TABLE IF EXISTS tags CASCADE;
ALTER TABLE tags_new RENAME TO tags;

-- Create indexes
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- =====================================================
-- 6. ITEM_TAGS
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can insert own item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can delete own item tags" ON item_tags;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS item_tags_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(item_id, tag_id)
);

-- Migrate data
INSERT INTO item_tags_new (id, item_id, tag_id)
SELECT 
  uuid_generate_v4() as id,
  (SELECT id FROM items WHERE items.id = item_tags.item_id LIMIT 1) as item_id,
  (SELECT id FROM tags WHERE tags.id = item_tags.tag_id LIMIT 1) as tag_id
FROM item_tags;

-- Replace old table
DROP TABLE IF EXISTS item_tags CASCADE;
ALTER TABLE item_tags_new RENAME TO item_tags;

-- Create indexes
CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag_id ON item_tags(tag_id);

-- Enable RLS
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own item tags"
  ON item_tags FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM items WHERE items.id = item_tags.item_id) OR
    (SELECT user_id FROM items WHERE items.id = item_tags.item_id) IS NULL
  );

CREATE POLICY "Users can insert own item tags"
  ON item_tags FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM items WHERE items.id = item_tags.item_id) OR
    (SELECT user_id FROM items WHERE items.id = item_tags.item_id) IS NULL
  );

CREATE POLICY "Users can delete own item tags"
  ON item_tags FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM items WHERE items.id = item_tags.item_id) OR
    (SELECT user_id FROM items WHERE items.id = item_tags.item_id) IS NULL
  );

-- =====================================================
-- 7. NOTES
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS notes_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data
INSERT INTO notes_new (id, user_id, item_id, content, created_at, updated_at)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM items WHERE items.id = notes.item_id LIMIT 1) as item_id,
  content,
  created_at,
  updated_at
FROM notes;

-- Replace old table
DROP TABLE IF EXISTS notes CASCADE;
ALTER TABLE notes_new RENAME TO notes;

-- Create indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_item_id ON notes(item_id);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- =====================================================
-- 8. SYNC_QUEUE
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Users can view own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can insert own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can update own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can delete own sync queue" ON sync_queue;

-- Create new table with UUID
CREATE TABLE IF NOT EXISTS sync_queue_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  data JSONB,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data - record_id stays as string representation
INSERT INTO sync_queue_new (id, user_id, table_name, record_id, operation, data, synced, created_at)
SELECT 
  uuid_generate_v4() as id,
  user_id,
  table_name,
  record_id::text,  -- Convert to text for UUID compatibility
  operation,
  data,
  synced,
  created_at
FROM sync_queue;

-- Replace old table
DROP TABLE IF EXISTS sync_queue CASCADE;
ALTER TABLE sync_queue_new RENAME TO sync_queue;

-- Create indexes
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced);
CREATE INDEX idx_sync_queue_table_name ON sync_queue(table_name);
CREATE INDEX idx_sync_queue_record_id ON sync_queue(record_id);

-- Enable RLS
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- =====================================================
-- REFRESH SCHEMA
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all tables now use UUID
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN (
  'collections', 'items', 'books', 'book_quotes',
  'metrics', 'history', 'tags', 'item_tags', 'notes', 'sync_queue'
)
AND column_name = 'id'
ORDER BY table_name;

-- =====================================================
-- COMPLETE
-- =====================================================
