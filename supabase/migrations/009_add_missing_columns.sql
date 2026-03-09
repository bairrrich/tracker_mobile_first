-- =====================================================
-- Add missing timestamp and synced columns
-- Run this in Supabase SQL Editor
-- =====================================================

-- Books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;

-- Collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;

-- Items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;

-- Book Quotes table
ALTER TABLE book_quotes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;

-- =====================================================
-- Refresh schema cache
-- =====================================================

-- This forces Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- COMPLETE - Columns added
-- =====================================================
