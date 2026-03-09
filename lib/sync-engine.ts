import { withDB, ensureDB } from '@/lib/db'

/**
 * Sync Engine
 *
 * Handles synchronization between local IndexedDB and remote server
 */

export interface SyncResult {
  success: boolean
  pushed: number
  pulled: number
  errors: string[]
  lastSync: Date | null
}

/**
 * Push local changes to server
 */
export async function pushChanges(): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const errors: string[] = []
  let count = 0

  console.log('[Sync Engine] pushChanges: Checking IndexedDB...')
  
  // Ensure database is opened
  const db = await ensureDB()
  if (!db) {
    console.error('[Sync Engine] pushChanges: IndexedDB not available')
    return { success: false, count: 0, errors: ['IndexedDB not available'] }
  }
  
  console.log('[Sync Engine] withDB: DB available, checking syncQueue...')
  
  // Use filter instead of where().equals() for boolean comparison
  const unsynced = await db.syncQueue
    .filter(record => record.synced === false)
    .toArray()

  console.log('[Sync Engine] Unsynced records:', unsynced.length)
  if (unsynced.length > 0) {
    console.log('[Sync Engine] Unsynced data:', unsynced)
  }

  if (unsynced.length === 0) {
    console.log('[Sync Engine] No changes to push')
    return { success: true, count: 0, errors }
  }

  try {
    console.log(`[Sync Engine] Pushing ${unsynced.length} changes...`)

    // Send to server
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changes: unsynced,
        lastSync: await getLastSyncTime(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    const result = await response.json()

    console.log('[Sync Engine] API response:', result)

    // Mark as synced
    if (result.processed && result.processed.length > 0) {
      console.log('[Sync Engine] Marking as synced:', result.processed)
      await markAsSynced(result.processed)
      count = result.processed.length
    } else {
      console.log('[Sync Engine] No processed IDs in response')
    }

    console.log('[Sync Engine] Pushed count:', count)

    console.log(`[Sync Engine] Pushed ${count} changes successfully`)

    return { success: true, count, errors }
  } catch (error) {
    console.error('[Sync Engine] Push error:', error)
    errors.push(error instanceof Error ? error.message : 'Unknown push error')
    return { success: false, count: 0, errors }
  }
}

/**
 * Pull remote changes from server
 */
export async function pullChanges(): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const errors: string[] = []
  let count = 0

  try {
    const lastSync = await getLastSyncTime()

    console.log(`[Sync Engine] Pulling changes since ${lastSync}...`)

    // Get unsynced records to send to API
    const unsyncedRecords = (await withDB((db) => 
      db.syncQueue.where('synced').equals(0).toArray()
    )) ?? []

    // Send to API to get remote changes
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changes: unsyncedRecords,
        lastSync: lastSync.toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    const result = await response.json()

    if (result.changes && result.changes.length > 0) {
      // Apply remote changes
      for (const change of result.changes) {
        await applyRemoteChange(change)
        count++
      }
      console.log(`[Sync Engine] Applied ${count} remote changes`)
    }

    console.log(`[Sync Engine] Pulled ${count} changes successfully`)

    return { success: true, count, errors }
  } catch (error) {
    console.error('[Sync Engine] Pull error:', error)
    errors.push(error instanceof Error ? error.message : 'Unknown pull error')
    return { success: false, count: 0, errors }
  }
}

/**
 * Apply a remote change to local database
 */
async function applyRemoteChange(change: {
  table: string
  operation: string
  data: object
  id?: number
  recordId?: string  // Local ID from syncQueue (UUID string)
}): Promise<void> {
  const { table, operation, data, id, recordId } = change

  switch (table) {
    case 'collections':
      await applyCollectionChange(operation as any, data, id)
      break
    case 'items':
      await applyItemChange(operation as any, data, id)
      break
    case 'books':
      await applyBookChange(operation as any, data, recordId, String(id))
      break
    case 'book_quotes':
      await applyBookQuoteChange(operation as any, data, recordId, id)
      break
    // Add more tables as needed
    default:
      console.warn(`[Sync Engine] Unknown table: ${table}`)
  }
}

/**
 * Apply collection change
 */
async function applyCollectionChange(
  operation: 'insert' | 'update' | 'delete',
  data: any,
  id?: number
): Promise<void> {
  switch (operation) {
    case 'insert':
    case 'update':
      if (id) {
        await withDB((db) => db.collections.put({ ...data, id, synced: true }))
      }
      break
    case 'delete':
      if (id) {
        await withDB((db) => db.collections.delete(id))
      }
      break
  }
}

/**
 * Apply item change
 */
async function applyItemChange(
  operation: 'insert' | 'update' | 'delete',
  data: any,
  id?: number
): Promise<void> {
  switch (operation) {
    case 'insert':
    case 'update':
      if (id) {
        await withDB((db) => db.items.put({ ...data, id, synced: true }))
      }
      break
    case 'delete':
      if (id) {
        await withDB((db) => db.items.delete(id))
      }
      break
  }
}

/**
 * Apply book change
 */
async function applyBookChange(
  operation: 'insert' | 'update' | 'delete',
  data: any,
  localId?: string,  // UUID string
  remoteId?: string
): Promise<void> {
  const id = remoteId || localId
  
  switch (operation) {
    case 'insert':
    case 'update':
      if (id) {
        // Update existing record or create new one
        await withDB((db) => db.books.put({ ...data, id, synced: true }))
      }
      break
    case 'delete':
      if (localId) {
        await withDB((db) => db.books.delete(localId))
      }
      break
  }
}

/**
 * Apply book quote change
 */
async function applyBookQuoteChange(
  operation: 'insert' | 'update' | 'delete',
  data: any,
  _recordId?: string,  // UUID string from syncQueue (unused for quotes)
  id?: number  // Quote ID (number, auto-increment)
): Promise<void> {
  const quoteId = id  // Keep as number for auto-increment
  
  switch (operation) {
    case 'insert':
    case 'update':
      if (quoteId) {
        await withDB((db) => db.bookQuotes.put({ ...data, id: quoteId, synced: true }))
      }
      break
    case 'delete':
      if (quoteId) {
        await withDB((db) => db.bookQuotes.delete(quoteId))
      }
      break
  }
}

/**
 * Mark sync queue records as synced
 */
async function markAsSynced(processedIds: Array<{ 
  id?: {
    localId: number
    remoteId: number | string
    recordId: number
  }
  localId?: number
  remoteId?: number | string
  recordId?: number
} | number>): Promise<void> {
  console.log('[Sync Engine] markAsSynced: Marking IDs as synced:', processedIds)
  
  const db = await ensureDB()
  if (!db) {
    console.error('[Sync Engine] markAsSynced: DB not available')
    return
  }
  
  await db.transaction('rw', db.syncQueue, async () => {
    for (const item of processedIds) {
      // Extract localId from nested structure or direct property
      let localId: number | undefined
      
      if (typeof item === 'object' && item !== null) {
        // Check for nested structure { id: { localId, ... } }
        if ('id' in item && typeof item.id === 'object' && item.id !== null && 'localId' in item.id) {
          localId = (item.id as any).localId
        } 
        // Check for flat structure { localId, ... }
        else if ('localId' in item) {
          localId = (item as any).localId
        }
      }
      
      if (localId !== undefined) {
        console.log('[Sync Engine] markAsSynced: Marking localId', localId, 'as synced')
        await db.syncQueue.update(localId, { synced: true })
      } else {
        // Simple case - item is the ID
        await db.syncQueue.update(item as number, { synced: true })
      }
    }
  })
  
  console.log('[Sync Engine] markAsSynced: Complete')
}

/**
 * Get last sync time from localStorage
 */
async function getLastSyncTime(): Promise<Date> {
  if (typeof window === 'undefined') {
    return new Date(0)
  }

  const lastSync = localStorage.getItem('lastSync')
  return lastSync ? new Date(lastSync) : new Date(0)
}

/**
 * Update last sync time in localStorage
 */
export async function updateLastSyncTime(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem('lastSync', new Date().toISOString())
}

/**
 * Perform full sync (push + pull)
 */
export async function performSync(): Promise<SyncResult> {
  console.log('[Sync Engine] Starting sync...')

  const pushResult = await pushChanges()
  const pullResult = await pullChanges()

  const success = pushResult.success && pullResult.success
  const errors = [...pushResult.errors, ...pullResult.errors]

  if (success) {
    await updateLastSyncTime()
  }

  const result: SyncResult = {
    success,
    pushed: pushResult.count,
    pulled: pullResult.count,
    errors,
    lastSync: success ? new Date() : null,
  }

  console.log('[Sync Engine] Sync complete:', result)

  return result
}

/**
 * Get unsynced count
 */
export async function getUnsyncedCount(): Promise<number> {
  return (await withDB((db) => db.syncQueue.where('synced').equals(0).count())) ?? 0
}

/**
 * Clear all synced records from queue
 */
export async function clearSyncedRecords(): Promise<void> {
  const synced = (await withDB((db) => db.syncQueue.where('synced').equals(1).toArray())) ?? []
  const ids = synced.map((r) => r.id as number)

  if (ids.length > 0) {
    await withDB((db) => db.syncQueue.bulkDelete(ids))
  }
}
