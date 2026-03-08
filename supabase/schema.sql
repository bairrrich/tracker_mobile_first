-- Supabase Database Schema for All Tracker Mobile
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  synced BOOLEAN DEFAULT false
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  status TEXT DEFAULT 'active',
  rating REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  synced BOOLEAN DEFAULT false
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- History table
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  value REAL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Item-Tags junction table
CREATE TABLE IF NOT EXISTS item_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_items_collection_id ON items(collection_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_item_id ON metrics(item_id);
CREATE INDEX IF NOT EXISTS idx_history_item_id ON history(item_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_item_id ON notes(item_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Metrics and History are read-only for users (managed through items)
CREATE POLICY "Users can view metrics through items"
  ON metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = metrics.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view history through items"
  ON history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = history.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
