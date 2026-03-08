import { db } from '@/lib/db'

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

  try {
    // Get unsynced records
    const unsynced = await db.syncQueue
      .where('synced')
      .equals(0)
      .toArray()

    if (unsynced.length === 0) {
      console.log('[Sync Engine] No changes to push')
      return { success: true, count: 0, errors }
    }

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

    // Mark as synced
    if (result.processed && result.processed.length > 0) {
      await markAsSynced(result.processed)
      count = result.processed.length
    }

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

    // For now, we don't have actual remote changes
    // This will be implemented when backend is ready
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changes: [],
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
}): Promise<void> {
  const { table, operation, data, id } = change

  switch (table) {
    case 'collections':
      await applyCollectionChange(operation as any, data, id)
      break
    case 'items':
      await applyItemChange(operation as any, data, id)
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
        await db.collections.put({ ...data, id, synced: true })
      }
      break
    case 'delete':
      if (id) {
        await db.collections.delete(id)
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
        await db.items.put({ ...data, id, synced: true })
      }
      break
    case 'delete':
      if (id) {
        await db.items.delete(id)
      }
      break
  }
}

/**
 * Mark sync queue records as synced
 */
async function markAsSynced(ids: number[]): Promise<void> {
  await db.transaction('rw', db.syncQueue, async () => {
    for (const id of ids) {
      await db.syncQueue.update(id, { synced: true })
    }
  })
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
  return await db.syncQueue.where('synced').equals(0).count()
}

/**
 * Clear all synced records from queue
 */
export async function clearSyncedRecords(): Promise<void> {
  const synced = await db.syncQueue.where('synced').equals(1).toArray()
  const ids = synced.map((r) => r.id as number)

  if (ids.length > 0) {
    await db.syncQueue.bulkDelete(ids)
  }
}
