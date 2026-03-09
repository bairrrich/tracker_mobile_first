import Dexie, { type EntityTable } from 'dexie'

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
  id: number
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
  collectionId?: number
  createdAt: Date
  updatedAt: Date
  synced: boolean
}

export interface Collection {
  id: number
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
  id: number
  collectionId: number
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
  id: number
  itemId: number
  type: string
  value: number
  unit?: string
  date: Date
  createdAt: Date
}

export interface History {
  id: number
  itemId: number
  action: string
  value?: number
  note?: string
  createdAt: Date
}

export interface Tag {
  id: number
  name: string
  color?: string
  createdAt: Date
}

export interface ItemTag {
  id?: number
  itemId: number
  tagId: number
}

export interface Note {
  id: number
  itemId: number
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface SyncQueue {
  id: number
  table: string
  recordId: number
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

  constructor() {
    super('tracker_db')

    this.version(1).stores({
      // Collections
      collections: '++id, name, type, createdAt, updatedAt, synced',

      // Items
      items: '++id, collectionId, name, status, createdAt, updatedAt, synced',

      // Metrics
      metrics: '++id, itemId, type, date, createdAt',

      // History
      history: '++id, itemId, action, createdAt',

      // Tags
      tags: '++id, name, createdAt',

      // Item-Tags junction table
      itemTags: '[itemId+tagId]',

      // Notes
      notes: '++id, itemId, createdAt, updatedAt',

      // Sync queue
      syncQueue: '++id, table, recordId, synced, createdAt',
    })

    // Indexes for better query performance
    this.version(2).stores({
      // Add compound indexes
      items: '++id, [collectionId+status], [collectionId+updatedAt], synced',
      metrics: '++id, [itemId+type], [itemId+date], createdAt',
      history: '++id, [itemId+action], createdAt',
      itemTags: '[itemId+tagId]',
    })

    // Add books table in version 3
    this.version(3).stores({
      books: '++id, title, author, status, genre, createdAt, updatedAt, synced',
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

// ============================================
// Helper functions
// ============================================

/**
 * Generate a unique ID for offline-first sync
 */
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

/**
 * Mark a record for sync
 */
export async function markForSync(
  table: string,
  recordId: number,
  operation: 'insert' | 'update' | 'delete',
  data?: object
): Promise<void> {
  if (!db) {
    console.warn('IndexedDB is not available')
    return
  }
  
  await db.syncQueue.add({
    id: generateId(),
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
 */
export async function markAsSynced(ids: number[]): Promise<void> {
  if (!db) {
    console.warn('IndexedDB is not available')
    return
  }
  
  await db.syncQueue.bulkUpdate(
    ids.map((id) => ({
      key: id,
      changes: { synced: true },
    }))
  )
}
