-- =====================================================
-- MIGRATION 019: Convert ALL tables to UUID + snake_case
-- =====================================================
-- Purpose: Standardize all tables to use UUID primary keys and snake_case naming
-- for consistency across Supabase, IndexedDB (Dexie), and client code.
--
-- Changes:
-- - All `id` columns converted to UUID type
-- - All table names use snake_case format
-- - All foreign keys use UUID references
-- - RLS policies preserved
-- - Data migrated with new UUID generation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COLLECTIONS
-- =====================================================

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;

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

DROP TABLE IF EXISTS collections CASCADE;
ALTER TABLE collections_new RENAME TO collections;

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_type ON collections(type);
CREATE INDEX idx_collections_synced ON collections(synced);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

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

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

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

DROP TABLE IF EXISTS items CASCADE;
ALTER TABLE items_new RENAME TO items;

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_collection_id ON items(collection_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_synced ON items(synced);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can view own metrics" ON metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON metrics;

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

DROP TABLE IF EXISTS metrics CASCADE;
ALTER TABLE metrics_new RENAME TO metrics;

CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_item_id ON metrics(item_id);
CREATE INDEX idx_metrics_date ON metrics(date);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON metrics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own metrics"
  ON metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 4. HISTORY
-- =====================================================

DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;

CREATE TABLE IF NOT EXISTS history_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  value DECIMAL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

DROP TABLE IF EXISTS history CASCADE;
ALTER TABLE history_new RENAME TO history;

CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_item_id ON history(item_id);

ALTER TABLE history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 5. TAGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
DROP POLICY IF EXISTS "Users can update own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON tags;

CREATE TABLE IF NOT EXISTS tags_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tags_new (id, user_id, name, color, created_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  name,
  color,
  created_at
FROM tags;

DROP TABLE IF EXISTS tags CASCADE;
ALTER TABLE tags_new RENAME TO tags;

CREATE INDEX idx_tags_user_id ON tags(user_id);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

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
-- 6. ITEM_TAGS (Junction Table)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can insert own item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can delete own item tags" ON item_tags;

CREATE TABLE IF NOT EXISTS item_tags_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(item_id, tag_id)
);

INSERT INTO item_tags_new (id, item_id, tag_id)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM items WHERE items.id = item_tags.item_id LIMIT 1) as item_id,
  (SELECT id FROM tags WHERE tags.id = item_tags.tag_id LIMIT 1) as tag_id
FROM item_tags;

DROP TABLE IF EXISTS item_tags CASCADE;
ALTER TABLE item_tags_new RENAME TO item_tags;

CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag_id ON item_tags(tag_id);

ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE TABLE IF NOT EXISTS notes_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO notes_new (id, user_id, item_id, content, created_at, updated_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM items WHERE items.id = notes.item_id LIMIT 1) as item_id,
  content,
  created_at,
  updated_at
FROM notes;

DROP TABLE IF EXISTS notes CASCADE;
ALTER TABLE notes_new RENAME TO notes;

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_item_id ON notes(item_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can view own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can insert own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can update own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can delete own sync queue" ON sync_queue;

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

INSERT INTO sync_queue_new (id, user_id, table_name, record_id, operation, data, synced, created_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  table_name,
  record_id::text,
  operation,
  data,
  synced,
  created_at
FROM sync_queue;

DROP TABLE IF EXISTS sync_queue CASCADE;
ALTER TABLE sync_queue_new RENAME TO sync_queue;

CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced);
CREATE INDEX idx_sync_queue_table_name ON sync_queue(table_name);
CREATE INDEX idx_sync_queue_record_id ON sync_queue(record_id);

ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

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
-- 9. BOOKS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own books" ON books;
DROP POLICY IF EXISTS "Users can insert own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

CREATE TABLE IF NOT EXISTS books_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT,
  status VARCHAR(50) DEFAULT 'reading',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  pages_total INTEGER,
  pages_read INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  genre VARCHAR(100),
  isbn VARCHAR(50),
  publisher VARCHAR(255),
  publish_year INTEGER,
  language VARCHAR(50),
  format VARCHAR(50),
  notes TEXT,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO books_new (id, user_id, title, author, description, cover_image, status, rating, pages_total, pages_read, start_date, end_date, genre, isbn, publisher, publish_year, language, format, notes, collection_id, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  title,
  author,
  description,
  cover_image,
  status,
  rating,
  pages_total,
  pages_read,
  start_date,
  end_date,
  genre,
  isbn,
  publisher,
  publish_year,
  language,
  format,
  notes,
  (SELECT id FROM collections WHERE collections.id = books.collection_id LIMIT 1) as collection_id,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM books;

DROP TABLE IF EXISTS books CASCADE;
ALTER TABLE books_new RENAME TO books;

CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_synced ON books(synced);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- 10. BOOK_QUOTES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Users can insert own book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Users can update own book quotes" ON book_quotes;
DROP POLICY IF EXISTS "Users can delete own book quotes" ON book_quotes;

CREATE TABLE IF NOT EXISTS book_quotes_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO book_quotes_new (id, book_id, text, page, created_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM books WHERE books.id = book_quotes.book_id LIMIT 1) as book_id,
  text,
  page,
  created_at,
  synced,
  deleted,
  deleted_at
FROM book_quotes;

DROP TABLE IF EXISTS book_quotes CASCADE;
ALTER TABLE book_quotes_new RENAME TO book_quotes;

CREATE INDEX idx_book_quotes_book_id ON book_quotes(book_id);
CREATE INDEX idx_book_quotes_synced ON book_quotes(synced);

ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own book quotes"
  ON book_quotes FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR
    (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL
  );

CREATE POLICY "Users can insert own book quotes"
  ON book_quotes FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR
    (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL
  );

CREATE POLICY "Users can update own book quotes"
  ON book_quotes FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR
    (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL
  );

CREATE POLICY "Users can delete own book quotes"
  ON book_quotes FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) OR
    (SELECT user_id FROM books WHERE books.id = book_quotes.book_id) IS NULL
  );

-- =====================================================
-- 11. EXERCISES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

CREATE TABLE IF NOT EXISTS exercises_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO exercises_new (id, user_id, name, category_id, is_default, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  name,
  category_id,
  is_default,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM exercises;

DROP TABLE IF EXISTS exercises CASCADE;
ALTER TABLE exercises_new RENAME TO exercises;

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_synced ON exercises(synced);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 12. WORKOUTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

CREATE TABLE IF NOT EXISTS workouts_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_type_id UUID,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO workouts_new (id, user_id, workout_type_id, date, notes, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  workout_type_id,
  date,
  notes,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM workouts;

DROP TABLE IF EXISTS workouts CASCADE;
ALTER TABLE workouts_new RENAME TO workouts;

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_synced ON workouts(synced);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 13. WORKOUT_EXERCISES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can insert own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can delete own workout exercises" ON workout_exercises;

CREATE TABLE IF NOT EXISTS workout_exercises_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  notes TEXT,
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO workout_exercises_new (id, workout_id, exercise_id, order_index, notes, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM workouts WHERE workouts.id = workout_exercises.workout_id LIMIT 1) as workout_id,
  (SELECT id FROM exercises WHERE exercises.id = workout_exercises.exercise_id LIMIT 1) as exercise_id,
  order_index,
  notes,
  synced,
  deleted,
  deleted_at
FROM workout_exercises;

DROP TABLE IF EXISTS workout_exercises CASCADE;
ALTER TABLE workout_exercises_new RENAME TO workout_exercises;

CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) OR
    (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) IS NULL
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) OR
    (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) IS NULL
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) OR
    (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) IS NULL
  );

CREATE POLICY "Users can delete own workout exercises"
  ON workout_exercises FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) OR
    (SELECT user_id FROM workouts WHERE workouts.id = workout_exercises.workout_id) IS NULL
  );

-- =====================================================
-- 14. WORKOUT_SETS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can insert own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can update own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can delete own workout sets" ON workout_sets;

CREATE TABLE IF NOT EXISTS workout_sets_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL,
  reps INTEGER,
  distance DECIMAL,
  duration INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO workout_sets_new (id, workout_exercise_id, set_number, weight, reps, distance, duration, completed, notes, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM workout_exercises WHERE workout_exercises.id = workout_sets.workout_exercise_id LIMIT 1) as workout_exercise_id,
  set_number,
  weight,
  reps,
  distance,
  duration,
  completed,
  notes,
  synced,
  deleted,
  deleted_at
FROM workout_sets;

DROP TABLE IF EXISTS workout_sets CASCADE;
ALTER TABLE workout_sets_new RENAME TO workout_sets;

CREATE INDEX idx_workout_sets_workout_exercise_id ON workout_sets(workout_exercise_id);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout sets"
  ON workout_sets FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) OR
    (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) IS NULL
  );

CREATE POLICY "Users can insert own workout sets"
  ON workout_sets FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) OR
    (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) IS NULL
  );

CREATE POLICY "Users can update own workout sets"
  ON workout_sets FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) OR
    (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) IS NULL
  );

CREATE POLICY "Users can delete own workout sets"
  ON workout_sets FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) OR
    (SELECT user_id FROM workouts w 
      JOIN workout_exercises we ON w.id = we.workout_id 
      WHERE we.id = workout_sets.workout_exercise_id) IS NULL
  );

-- =====================================================
-- 15. FINANCE_ACCOUNTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own finance accounts" ON finance_accounts;
DROP POLICY IF EXISTS "Users can insert own finance accounts" ON finance_accounts;
DROP POLICY IF EXISTS "Users can update own finance accounts" ON finance_accounts;
DROP POLICY IF EXISTS "Users can delete own finance accounts" ON finance_accounts;

CREATE TABLE IF NOT EXISTS finance_accounts_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  initial_balance DECIMAL DEFAULT 0,
  current_balance DECIMAL DEFAULT 0,
  icon VARCHAR(50),
  color VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO finance_accounts_new (id, user_id, name, type, currency, initial_balance, current_balance, icon, color, description, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  name,
  type,
  currency,
  initial_balance,
  current_balance,
  icon,
  color,
  description,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM finance_accounts;

DROP TABLE IF EXISTS finance_accounts CASCADE;
ALTER TABLE finance_accounts_new RENAME TO finance_accounts;

CREATE INDEX idx_finance_accounts_user_id ON finance_accounts(user_id);
CREATE INDEX idx_finance_accounts_type ON finance_accounts(type);
CREATE INDEX idx_finance_accounts_synced ON finance_accounts(synced);

ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance accounts"
  ON finance_accounts FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own finance accounts"
  ON finance_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own finance accounts"
  ON finance_accounts FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own finance accounts"
  ON finance_accounts FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 16. FINANCE_CATEGORIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own finance categories" ON finance_categories;
DROP POLICY IF EXISTS "Users can insert own finance categories" ON finance_categories;
DROP POLICY IF EXISTS "Users can update own finance categories" ON finance_categories;
DROP POLICY IF EXISTS "Users can delete own finance categories" ON finance_categories;

CREATE TABLE IF NOT EXISTS finance_categories_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_predefined BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO finance_categories_new (id, user_id, name, type, is_predefined, icon, color, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  name,
  type,
  is_predefined,
  icon,
  color,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM finance_categories;

DROP TABLE IF EXISTS finance_categories CASCADE;
ALTER TABLE finance_categories_new RENAME TO finance_categories;

CREATE INDEX idx_finance_categories_user_id ON finance_categories(user_id);
CREATE INDEX idx_finance_categories_type ON finance_categories(type);
CREATE INDEX idx_finance_categories_synced ON finance_categories(synced);

ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance categories"
  ON finance_categories FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own finance categories"
  ON finance_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own finance categories"
  ON finance_categories FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own finance categories"
  ON finance_categories FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 17. FINANCE_TRANSACTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own finance transactions" ON finance_transactions;
DROP POLICY IF EXISTS "Users can insert own finance transactions" ON finance_transactions;
DROP POLICY IF EXISTS "Users can update own finance transactions" ON finance_transactions;
DROP POLICY IF EXISTS "Users can delete own finance transactions" ON finance_transactions;

CREATE TABLE IF NOT EXISTS finance_transactions_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES finance_accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES finance_accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_categories(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL NOT NULL,
  fee DECIMAL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO finance_transactions_new (id, user_id, account_id, to_account_id, category_id, type, amount, fee, date, description, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM finance_accounts WHERE finance_accounts.id = finance_transactions.account_id LIMIT 1) as account_id,
  (SELECT id FROM finance_accounts WHERE finance_accounts.id = finance_transactions.to_account_id LIMIT 1) as to_account_id,
  (SELECT id FROM finance_categories WHERE finance_categories.id = finance_transactions.category_id LIMIT 1) as category_id,
  type,
  amount,
  fee,
  date,
  description,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM finance_transactions;

DROP TABLE IF EXISTS finance_transactions CASCADE;
ALTER TABLE finance_transactions_new RENAME TO finance_transactions;

CREATE INDEX idx_finance_transactions_user_id ON finance_transactions(user_id);
CREATE INDEX idx_finance_transactions_account_id ON finance_transactions(account_id);
CREATE INDEX idx_finance_transactions_type ON finance_transactions(type);
CREATE INDEX idx_finance_transactions_date ON finance_transactions(date);
CREATE INDEX idx_finance_transactions_synced ON finance_transactions(synced);

ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance transactions"
  ON finance_transactions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own finance transactions"
  ON finance_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own finance transactions"
  ON finance_transactions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own finance transactions"
  ON finance_transactions FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 18. FINANCE_BUDGETS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own finance budgets" ON finance_budgets;
DROP POLICY IF EXISTS "Users can insert own finance budgets" ON finance_budgets;
DROP POLICY IF EXISTS "Users can update own finance budgets" ON finance_budgets;
DROP POLICY IF EXISTS "Users can delete own finance budgets" ON finance_budgets;

CREATE TABLE IF NOT EXISTS finance_budgets_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_categories(id) ON DELETE CASCADE,
  period VARCHAR(50) NOT NULL,
  amount DECIMAL NOT NULL,
  spent DECIMAL DEFAULT 0,
  month INTEGER,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO finance_budgets_new (id, user_id, category_id, period, amount, spent, month, year, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM finance_categories WHERE finance_categories.id = finance_budgets.category_id LIMIT 1) as category_id,
  period,
  amount,
  spent,
  month,
  year,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM finance_budgets;

DROP TABLE IF EXISTS finance_budgets CASCADE;
ALTER TABLE finance_budgets_new RENAME TO finance_budgets;

CREATE INDEX idx_finance_budgets_user_id ON finance_budgets(user_id);
CREATE INDEX idx_finance_budgets_category_id ON finance_budgets(category_id);
CREATE INDEX idx_finance_budgets_synced ON finance_budgets(synced);

ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance budgets"
  ON finance_budgets FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own finance budgets"
  ON finance_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own finance budgets"
  ON finance_budgets FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own finance budgets"
  ON finance_budgets FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 19. FINANCE_RECURRING_TRANSACTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own finance recurring transactions" ON finance_recurring_transactions;
DROP POLICY IF EXISTS "Users can insert own finance recurring transactions" ON finance_recurring_transactions;
DROP POLICY IF EXISTS "Users can update own finance recurring transactions" ON finance_recurring_transactions;
DROP POLICY IF EXISTS "Users can delete own finance recurring transactions" ON finance_recurring_transactions;

CREATE TABLE IF NOT EXISTS finance_recurring_transactions_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES finance_accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_categories(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  last_processed TIMESTAMPTZ,
  next_due TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO finance_recurring_transactions_new (id, user_id, account_id, category_id, type, amount, frequency, start_date, end_date, last_processed, next_due, is_active, description, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  (SELECT id FROM finance_accounts WHERE finance_accounts.id = finance_recurring_transactions.account_id LIMIT 1) as account_id,
  (SELECT id FROM finance_categories WHERE finance_categories.id = finance_recurring_transactions.category_id LIMIT 1) as category_id,
  type,
  amount,
  frequency,
  start_date,
  end_date,
  last_processed,
  next_due,
  is_active,
  description,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM finance_recurring_transactions;

DROP TABLE IF EXISTS finance_recurring_transactions CASCADE;
ALTER TABLE finance_recurring_transactions_new RENAME TO finance_recurring_transactions;

CREATE INDEX idx_finance_recurring_transactions_user_id ON finance_recurring_transactions(user_id);
CREATE INDEX idx_finance_recurring_transactions_account_id ON finance_recurring_transactions(account_id);
CREATE INDEX idx_finance_recurring_transactions_synced ON finance_recurring_transactions(synced);

ALTER TABLE finance_recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance recurring transactions"
  ON finance_recurring_transactions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own finance recurring transactions"
  ON finance_recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own finance recurring transactions"
  ON finance_recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own finance recurring transactions"
  ON finance_recurring_transactions FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 20. FINANCE_SAVINGS_GOALS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own finance savings goals" ON finance_savings_goals;
DROP POLICY IF EXISTS "Users can insert own finance savings goals" ON finance_savings_goals;
DROP POLICY IF EXISTS "Users can update own finance savings goals" ON finance_savings_goals;
DROP POLICY IF EXISTS "Users can delete own finance savings goals" ON finance_savings_goals;

CREATE TABLE IF NOT EXISTS finance_savings_goals_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL NOT NULL,
  current_amount DECIMAL DEFAULT 0,
  account_id UUID REFERENCES finance_accounts(id) ON DELETE CASCADE,
  deadline TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  icon VARCHAR(50),
  color VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO finance_savings_goals_new (id, user_id, name, target_amount, current_amount, account_id, deadline, status, icon, color, description, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  name,
  target_amount,
  current_amount,
  (SELECT id FROM finance_accounts WHERE finance_accounts.id = finance_savings_goals.account_id LIMIT 1) as account_id,
  deadline,
  status,
  icon,
  color,
  description,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM finance_savings_goals;

DROP TABLE IF EXISTS finance_savings_goals CASCADE;
ALTER TABLE finance_savings_goals_new RENAME TO finance_savings_goals;

CREATE INDEX idx_finance_savings_goals_user_id ON finance_savings_goals(user_id);
CREATE INDEX idx_finance_savings_goals_status ON finance_savings_goals(status);
CREATE INDEX idx_finance_savings_goals_synced ON finance_savings_goals(synced);

ALTER TABLE finance_savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance savings goals"
  ON finance_savings_goals FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own finance savings goals"
  ON finance_savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own finance savings goals"
  ON finance_savings_goals FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own finance savings goals"
  ON finance_savings_goals FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 21. SUPPLEMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own supplements" ON supplements;
DROP POLICY IF EXISTS "Users can insert own supplements" ON supplements;
DROP POLICY IF EXISTS "Users can update own supplements" ON supplements;
DROP POLICY IF EXISTS "Users can delete own supplements" ON supplements;

CREATE TABLE IF NOT EXISTS supplements_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  form VARCHAR(50),
  dosage DECIMAL,
  dosage_unit VARCHAR(50),
  category VARCHAR(50),
  brand VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO supplements_new (id, user_id, name, type, form, dosage, dosage_unit, category, brand, description, is_active, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  user_id,
  name,
  type,
  form,
  dosage,
  dosage_unit,
  category,
  brand,
  description,
  is_active,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM supplements;

DROP TABLE IF EXISTS supplements CASCADE;
ALTER TABLE supplements_new RENAME TO supplements;

CREATE INDEX idx_supplements_user_id ON supplements(user_id);
CREATE INDEX idx_supplements_type ON supplements(type);
CREATE INDEX idx_supplements_synced ON supplements(synced);

ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supplements"
  ON supplements FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own supplements"
  ON supplements FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own supplements"
  ON supplements FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own supplements"
  ON supplements FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 22. SUPPLEMENT_INVENTORY
-- =====================================================

DROP POLICY IF EXISTS "Users can view own supplement inventory" ON supplement_inventory;
DROP POLICY IF EXISTS "Users can insert own supplement inventory" ON supplement_inventory;
DROP POLICY IF EXISTS "Users can update own supplement inventory" ON supplement_inventory;
DROP POLICY IF EXISTS "Users can delete own supplement inventory" ON supplement_inventory;

CREATE TABLE IF NOT EXISTS supplement_inventory_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  min_quantity INTEGER,
  unit VARCHAR(50),
  purchase_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  price DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO supplement_inventory_new (id, supplement_id, quantity, min_quantity, unit, purchase_date, expiration_date, price, notes, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id LIMIT 1) as supplement_id,
  quantity,
  min_quantity,
  unit,
  purchase_date,
  expiration_date,
  price,
  notes,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM supplement_inventory;

DROP TABLE IF EXISTS supplement_inventory CASCADE;
ALTER TABLE supplement_inventory_new RENAME TO supplement_inventory;

CREATE INDEX idx_supplement_inventory_supplement_id ON supplement_inventory(supplement_id);
CREATE INDEX idx_supplement_inventory_synced ON supplement_inventory(synced);

ALTER TABLE supplement_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supplement inventory"
  ON supplement_inventory FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) IS NULL
  );

CREATE POLICY "Users can insert own supplement inventory"
  ON supplement_inventory FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) IS NULL
  );

CREATE POLICY "Users can update own supplement inventory"
  ON supplement_inventory FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) IS NULL
  );

CREATE POLICY "Users can delete own supplement inventory"
  ON supplement_inventory FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_inventory.supplement_id) IS NULL
  );

-- =====================================================
-- 23. SUPPLEMENT_SCHEDULES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own supplement schedules" ON supplement_schedules;
DROP POLICY IF EXISTS "Users can insert own supplement schedules" ON supplement_schedules;
DROP POLICY IF EXISTS "Users can update own supplement schedules" ON supplement_schedules;
DROP POLICY IF EXISTS "Users can delete own supplement schedules" ON supplement_schedules;

CREATE TABLE IF NOT EXISTS supplement_schedules_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
  frequency VARCHAR(50) NOT NULL,
  timing VARCHAR(50),
  days_of_week JSONB,
  dosage DECIMAL,
  quantity INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO supplement_schedules_new (id, supplement_id, frequency, timing, days_of_week, dosage, quantity, is_active, start_date, end_date, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id LIMIT 1) as supplement_id,
  frequency,
  timing,
  days_of_week,
  dosage,
  quantity,
  is_active,
  start_date,
  end_date,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM supplement_schedules;

DROP TABLE IF EXISTS supplement_schedules CASCADE;
ALTER TABLE supplement_schedules_new RENAME TO supplement_schedules;

CREATE INDEX idx_supplement_schedules_supplement_id ON supplement_schedules(supplement_id);
CREATE INDEX idx_supplement_schedules_synced ON supplement_schedules(synced);

ALTER TABLE supplement_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supplement schedules"
  ON supplement_schedules FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) IS NULL
  );

CREATE POLICY "Users can insert own supplement schedules"
  ON supplement_schedules FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) IS NULL
  );

CREATE POLICY "Users can update own supplement schedules"
  ON supplement_schedules FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) IS NULL
  );

CREATE POLICY "Users can delete own supplement schedules"
  ON supplement_schedules FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_schedules.supplement_id) IS NULL
  );

-- =====================================================
-- 24. SUPPLEMENT_LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own supplement logs" ON supplement_logs;
DROP POLICY IF EXISTS "Users can insert own supplement logs" ON supplement_logs;
DROP POLICY IF EXISTS "Users can update own supplement logs" ON supplement_logs;
DROP POLICY IF EXISTS "Users can delete own supplement logs" ON supplement_logs;

CREATE TABLE IF NOT EXISTS supplement_logs_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES supplement_schedules(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL,
  dosage DECIMAL,
  quantity INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

INSERT INTO supplement_logs_new (id, supplement_id, schedule_id, date, status, dosage, quantity, notes, rating, created_at, updated_at, synced, deleted, deleted_at)
SELECT
  uuid_generate_v4() as id,
  (SELECT id FROM supplements WHERE supplements.id = supplement_logs.supplement_id LIMIT 1) as supplement_id,
  (SELECT id FROM supplement_schedules WHERE supplement_schedules.id = supplement_logs.schedule_id LIMIT 1) as schedule_id,
  date,
  status,
  dosage,
  quantity,
  notes,
  rating,
  created_at,
  updated_at,
  synced,
  deleted,
  deleted_at
FROM supplement_logs;

DROP TABLE IF EXISTS supplement_logs CASCADE;
ALTER TABLE supplement_logs_new RENAME TO supplement_logs;

CREATE INDEX idx_supplement_logs_supplement_id ON supplement_logs(supplement_id);
CREATE INDEX idx_supplement_logs_schedule_id ON supplement_logs(schedule_id);
CREATE INDEX idx_supplement_logs_date ON supplement_logs(date);
CREATE INDEX idx_supplement_logs_synced ON supplement_logs(synced);

ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supplement logs"
  ON supplement_logs FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) IS NULL
  );

CREATE POLICY "Users can insert own supplement logs"
  ON supplement_logs FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) IS NULL
  );

CREATE POLICY "Users can update own supplement logs"
  ON supplement_logs FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) IS NULL
  );

CREATE POLICY "Users can delete own supplement logs"
  ON supplement_logs FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) OR
    (SELECT user_id FROM supplements WHERE supplements.id = supplement_logs.supplement_id) IS NULL
  );

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
  'metrics', 'history', 'tags', 'item_tags', 'notes', 'sync_queue',
  'exercises', 'workouts', 'workout_exercises', 'workout_sets',
  'finance_accounts', 'finance_categories', 'finance_transactions',
  'finance_budgets', 'finance_recurring_transactions', 'finance_savings_goals',
  'supplements', 'supplement_inventory', 'supplement_schedules', 'supplement_logs'
)
AND column_name = 'id'
ORDER BY table_name;

-- =====================================================
-- COMPLETE
-- =====================================================
