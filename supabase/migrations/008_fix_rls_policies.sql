-- =====================================================
-- Fix RLS Policies to allow anonymous writes
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing policies and recreate with NULL user_id support

-- Collections
DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
CREATE POLICY "Allow anonymous insert collections"
  ON collections FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Items
DROP POLICY IF EXISTS "Users can insert own items" ON items;
CREATE POLICY "Allow anonymous insert items"
  ON items FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Books
DROP POLICY IF EXISTS "Users can insert own books" ON books;
CREATE POLICY "Allow anonymous insert books"
  ON books FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Book Quotes
DROP POLICY IF EXISTS "Users can insert own book quotes" ON book_quotes;
CREATE POLICY "Allow anonymous insert book quotes"
  ON book_quotes FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Metrics
DROP POLICY IF EXISTS "Users can insert own metrics" ON metrics;
CREATE POLICY "Allow anonymous insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- History
DROP POLICY IF EXISTS "Users can insert own history" ON history;
CREATE POLICY "Allow anonymous insert history"
  ON history FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Tags
DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
CREATE POLICY "Allow anonymous insert tags"
  ON tags FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Notes
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Allow anonymous insert notes"
  ON notes FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Sync Queue
DROP POLICY IF EXISTS "Users can insert own sync queue" ON sync_queue;
CREATE POLICY "Allow anonymous insert sync queue"
  ON sync_queue FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- =====================================================
-- COMPLETE - RLS policies updated
-- =====================================================
