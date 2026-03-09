import Dexie, { type EntityTable } from 'dexie'
import { generateUUID } from './utils/uuid'

// ============================================
// Type Definitions
// ============================================

export type CollectionType =
  | 'finances'
  | 'exercises'
  | 'books'
  | 'supplements'
  | 'food'
  | 'herbs'
  | 'notes'
  | 'custom'

export type BookStatus = 'reading' | 'completed' | 'planned' | 'abandoned'
export type BookFormat = 'hardcover' | 'paperback' | 'ebook' | 'audiobook'

export interface Book {
  id: string  // UUID instead of number
  title: string
  author: string
  description?: string
  coverImage?: string
  status: BookStatus
  rating?: number
  pagesTotal?: number
  pagesRead?: number
  startDate?: Date
  endDate?: Date
  genre?: string
  isbn?: string
  publisher?: string
  publishYear?: number
  language?: string
  format?: BookFormat
  notes?: string
  collectionId?: string  // UUID instead of number
  createdAt: Date
  updatedAt: Date
  synced: boolean
}

export interface BookQuote {
  id: string  // UUID
  bookId: string  // UUID
  text: string
  page?: number
  createdAt: Date
  synced: boolean
}

export interface Collection {
  id: string  // UUID
  name: string
  type: CollectionType
  icon?: string
  color?: string
  description?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
}

export interface Item {
  id: string  // UUID
  collectionId: string  // UUID
  name: string
  description?: string
  image?: string
  status: 'active' | 'archived' | 'completed'
  rating?: number
  createdAt: Date
  updatedAt: Date
  synced: boolean
}

export interface Metric {
  id: string  // UUID
  itemId: string  // UUID
  type: string
  value: number
  unit?: string
  date: Date
  createdAt: Date
}

export interface History {
  id: string  // UUID
  itemId: string  // UUID
  action: string
  value?: number
  note?: string
  createdAt: Date
}

export interface Tag {
  id: string  // UUID
  name: string
  color?: string
  createdAt: Date
}

export interface ItemTag {
  id: string  // UUID
  itemId: string  // UUID
  tagId: string  // UUID
}

export interface Note {
  id: string  // UUID
  itemId: string  // UUID
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface SyncQueue {
  id: string  // UUID
  table: string
  recordId: string  // UUID
  operation: 'insert' | 'update' | 'delete'
  data: string
  synced: boolean
  createdAt: Date
}

// ============================================
// Dexie Database
// ============================================

export class TrackerDatabase extends Dexie {
  collections!: EntityTable<Collection, 'id'>
  items!: EntityTable<Item, 'id'>
  metrics!: EntityTable<Metric, 'id'>
  history!: EntityTable<History, 'id'>
  tags!: EntityTable<Tag, 'id'>
  itemTags!: EntityTable<ItemTag, 'id'>
  notes!: EntityTable<Note, 'id'>
  syncQueue!: EntityTable<SyncQueue, 'id'>
  books!: EntityTable<Book, 'id'>
  bookQuotes!: EntityTable<BookQuote, 'id'>

  constructor() {
    super('tracker_db')

    this.version(6).stores({
      // All tables now use UUID string ids
      collections: 'id, name, type, createdAt, updatedAt, synced',
      items: 'id, collectionId, name, status, createdAt, updatedAt, synced',
      metrics: 'id, itemId, type, date, createdAt',
      history: 'id, itemId, action, createdAt',
      tags: 'id, name, createdAt',
      itemTags: 'id, itemId, tagId',
      notes: 'id, itemId, createdAt, updatedAt',
      syncQueue: 'id, table, recordId, synced, createdAt',
      books: 'id, title, author, status, genre, createdAt, updatedAt, synced',
      bookQuotes: 'id, bookId, createdAt, synced',
    })
  }
}

// ============================================
// Export database instance
// ============================================

// Проверка доступности IndexedDB перед созданием базы данных
function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

export const db = isIndexedDBAvailable() ? new TrackerDatabase() : null

/**
 * Helper function для проверки доступности DB
 * Возвращает null если DB недоступна
 */
export function withDB<T>(fn: (db: TrackerDatabase) => T): T | null {
  if (!db) {
    console.warn('[DB] IndexedDB is not available')
    return null
  }
  return fn(db)
}

/**
 * Ensure database is opened
 */
export async function ensureDB(): Promise<TrackerDatabase | null> {
  if (!db) {
    console.warn('[DB] IndexedDB is not available')
    return null
  }
  
  // Wait for database to be ready
  if (!db.isOpen()) {
    console.log('[DB] Opening database...')
    await db.open()
  }
  
  // Verify syncQueue exists and has data
  try {
    const count = await db.syncQueue.count()
    console.log('[DB] syncQueue count:', count)
  } catch (e) {
    console.error('[DB] Error accessing syncQueue:', e)
  }
  
  return db
}

// ============================================
// Helper functions
// ============================================

/**
 * Mark a record for sync
 * Uses UUID for recordId
 */
export async function markForSync(
  table: string,
  recordId: string,  // UUID string
  operation: 'insert' | 'update' | 'delete',
  data?: object
): Promise<void> {
  if (!db) {
    console.warn('IndexedDB is not available')
    return
  }

  await db.syncQueue.add({
    id: generateUUID(),  // Use UUID for sync queue id
    table,
    recordId,
    operation,
    data: data ? JSON.stringify(data) : '',
    synced: false,
    createdAt: new Date(),
  })
}

/**
 * Get unsynced records
 */
export async function getUnsyncedRecords() {
  if (!db) {
    console.warn('IndexedDB is not available')
    return []
  }
  
  return await db.syncQueue.where('synced').equals(0).toArray()
}

/**
 * Mark records as synced
 * Uses UUID string ids
 */
export async function markAsSynced(ids: string[]): Promise<void> {
  if (!db) {
    console.warn('IndexedDB is not available')
    return
  }

  // Update each sync record individually
  for (const id of ids) {
    const record = await db.syncQueue.get(id)
    if (record) {
      await db.syncQueue.update(id, { synced: true })
    }
  }
}
