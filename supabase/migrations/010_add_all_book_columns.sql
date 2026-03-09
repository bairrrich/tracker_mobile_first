-- =====================================================
-- Add ALL missing columns to books table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Books table - add ALL missing columns
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS pages_read INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pages_total INTEGER,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS genre VARCHAR(100),
ADD COLUMN IF NOT EXISTS isbn VARCHAR(20),
ADD COLUMN IF NOT EXISTS publisher VARCHAR(200),
ADD COLUMN IF NOT EXISTS publish_year INTEGER,
ADD COLUMN IF NOT EXISTS language VARCHAR(50),
ADD COLUMN IF NOT EXISTS format VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS collection_id BIGINT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;

-- Collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false;

-- Items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
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

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- Verify columns
-- =====================================================

-- Check books table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- =====================================================
-- COMPLETE
-- =====================================================
