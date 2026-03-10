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
  id: string  // UUID
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
  collectionId?: string  // UUID
  createdAt: Date
  updatedAt: Date
  deleted?: boolean  // Tombstone flag for offline-first sync
  deletedAt?: Date  // Tombstone timestamp
  synced: boolean
}

export interface BookQuote {
  id: string  // UUID
  bookId: string  // UUID
  text: string
  page?: number
  createdAt: Date
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
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
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
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
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
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
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
}

export interface History {
  id: string  // UUID
  itemId: string  // UUID
  action: string
  value?: number
  note?: string
  createdAt: Date
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
}

export interface Tag {
  id: string  // UUID
  name: string
  color?: string
  createdAt: Date
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
}

export interface ItemTag {
  id: string  // UUID
  itemId: string  // UUID
  tagId: string  // UUID
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
}

export interface Note {
  id: string  // UUID
  itemId: string  // UUID
  content: string
  createdAt: Date
  updatedAt: Date
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date  // Tombstone timestamp
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
// Exercise & Workout Types (Static Data)
// ============================================

export type WorkoutTypeId = 'strength' | 'cardio' | 'yoga'

export interface WorkoutTypeEntity {
  id: WorkoutTypeId  // Static ID: 'strength', 'cardio', 'yoga'
  name: string
}

export type ExerciseCategoryId = 
  // Strength
  | 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'abs'
  // Cardio
  | 'running' | 'cycling' | 'swimming' | 'elliptical' | 'rowing' | 'jumping'
  // Yoga
  | 'standing_poses' | 'balances' | 'seated_poses' | 'twists' | 'backbends' | 'inversions'

export interface ExerciseCategory {
  id: ExerciseCategoryId  // Static ID
  name: string
  workoutTypeId: WorkoutTypeId
}

export interface Exercise {
  id: string  // UUID
  name: string
  description?: string
  categoryId: ExerciseCategoryId  // Static category ID
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface Workout {
  id: string  // UUID
  workoutTypeId: WorkoutTypeId  // Static workout type ID
  date: Date
  durationSeconds?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface WorkoutExercise {
  id: string  // UUID
  workoutId: string  // UUID
  exerciseId: string  // UUID
  orderIndex: number
  createdAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface WorkoutSet {
  id: string  // UUID
  workoutExerciseId: string  // UUID
  setNumber: number
  reps?: number
  weight?: number
  durationSeconds?: number
  completed: boolean
  createdAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

// ============================================
// Finance Types
// ============================================

export type AccountType = 'cash' | 'card' | 'deposit'
export type Currency = 'RUB' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type CategoryType = 'income' | 'expense'
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type GoalStatus = 'active' | 'completed' | 'paused'

export interface FinanceAccount {
  id: string  // UUID
  userId?: string
  name: string
  type: AccountType
  currency: Currency
  initialBalance: number
  currentBalance: number
  icon?: string
  color?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface FinanceCategory {
  id: string  // UUID
  userId?: string
  name: string
  type: CategoryType
  isPredefined: boolean
  icon?: string
  color?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface FinanceTransaction {
  id: string  // UUID
  userId?: string
  accountId: string  // UUID
  toAccountId?: string  // UUID (for transfers)
  categoryId?: string  // UUID (for income/expense)
  amount: number
  type: TransactionType
  date: Date
  description?: string
  tags?: string[]  // Array of tag strings
  fee?: number  // Commission for transfers
  isRecurring: boolean
  recurringTransactionId?: string  // UUID
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface FinanceBudget {
  id: string  // UUID
  userId?: string
  categoryId: string  // UUID
  period: BudgetPeriod
  amount: number
  spent: number
  month?: number  // 1-12
  year?: number  // e.g., 2026
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface FinanceRecurringTransaction {
  id: string  // UUID
  userId?: string
  accountId: string  // UUID
  toAccountId?: string  // UUID
  categoryId?: string  // UUID
  amount: number
  type: TransactionType
  frequency: RecurringFrequency
  startDate: Date
  endDate?: Date
  lastProcessed?: Date
  isActive: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

export interface FinanceSavingsGoal {
  id: string  // UUID
  userId?: string
  name: string
  targetAmount: number
  currentAmount: number
  accountId?: string  // UUID
  deadline?: Date
  status: GoalStatus
  icon?: string
  color?: string
  description?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
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
  // Exercise & Workout tables (workoutTypes and exerciseCategories are now static)
  exercises!: EntityTable<Exercise, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutExercises!: EntityTable<WorkoutExercise, 'id'>
  workoutSets!: EntityTable<WorkoutSet, 'id'>
  // Finance tables
  financeAccounts!: EntityTable<FinanceAccount, 'id'>
  financeCategories!: EntityTable<FinanceCategory, 'id'>
  financeTransactions!: EntityTable<FinanceTransaction, 'id'>
  financeBudgets!: EntityTable<FinanceBudget, 'id'>
  financeRecurringTransactions!: EntityTable<FinanceRecurringTransaction, 'id'>
  financeSavingsGoals!: EntityTable<FinanceSavingsGoal, 'id'>

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
    })

    // Version 7: Add books and bookQuotes tables
    this.version(7).stores({
      books: 'id, title, author, status, genre, createdAt, updatedAt, synced',
      bookQuotes: 'id, bookId, createdAt, synced',
    })

    // Version 8: Add composite index [table+recordId] to syncQueue
    this.version(8).stores({
      syncQueue: 'id, table, recordId, synced, createdAt, [table+recordId]',
    })

    // Version 9: Add exercise and workout tables (removed workoutTypes and exerciseCategories - now static)
    this.version(9).stores({
      exercises: 'id, name, categoryId, isDefault, createdAt, updatedAt, synced, deleted',
      workouts: 'id, workoutTypeId, date, createdAt, updatedAt, synced, deleted',
      workoutExercises: 'id, workoutId, exerciseId, orderIndex, synced, deleted',
      workoutSets: 'id, workoutExerciseId, setNumber, completed, synced, deleted',
    })

    // Version 10: Add finance tables
    this.version(10).stores({
      financeAccounts: 'id, userId, type, currency, createdAt, updatedAt, synced, deleted',
      financeCategories: 'id, userId, type, isPredefined, createdAt, updatedAt, synced, deleted',
      financeTransactions: 'id, userId, accountId, toAccountId, categoryId, type, date, createdAt, updatedAt, synced, deleted',
      financeBudgets: 'id, userId, categoryId, period, month, year, createdAt, updatedAt, synced, deleted',
      financeRecurringTransactions: 'id, userId, accountId, type, frequency, isActive, startDate, endDate, createdAt, updatedAt, synced, deleted',
    })

    // Version 11: Add savings goals table
    this.version(11).stores({
      financeSavingsGoals: 'id, userId, status, deadline, createdAt, updatedAt, synced, deleted',
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
    try {
      await db.open()
      console.log('[DB] Database opened successfully, version:', db.verno)
    } catch (error) {
      // Handle version upgrade errors
      if (error instanceof Error && error.message.includes('UpgradeError')) {
        console.error('[DB] Version upgrade error, clearing old database...')
        // Close and delete the old database
        await db.close()
        await Dexie.delete('tracker_db')
        console.log('[DB] Old database deleted, reopening...')
        // Reopen will create new database with correct version
        await db.open()
      } else {
        console.error('[DB] Error opening database:', error)
        return null
      }
    }
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
