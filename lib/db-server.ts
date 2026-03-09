import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './db-schema'

// Create SQLite database connection
const sqlite = new Database('tracker.db')

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

// Create Drizzle instance
export const db = drizzle(sqlite, { schema })

// Export schema for use in repositories
export * from './db-schema'

// Helper function to close database connection
export async function closeDatabase() {
  sqlite.close()
}

// Helper function to initialize database
// All IDs are UUID strings for consistency across Supabase, IndexedDB, and client code
export async function initializeDatabase() {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0 NOT NULL
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      collection_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      status TEXT DEFAULT 'active',
      rating REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0 NOT NULL,
      FOREIGN KEY (collection_id) REFERENCES collections(id)
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      action TEXT NOT NULL,
      value REAL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      created_at TEXT NOT NULL
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS item_tags (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      tag_id TEXT,
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `)

  console.log('[Database] Tables initialized with UUID support')
}
