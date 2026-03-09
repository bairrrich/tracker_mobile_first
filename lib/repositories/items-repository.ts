import { withDB, type Item } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export type ItemStatus = 'active' | 'archived' | 'completed'

export interface CreateItemData {
  collectionId: string  // UUID
  name: string
  description?: string
  image?: string
  status?: ItemStatus
  rating?: number
}

export interface UpdateItemData {
  name?: string
  description?: string
  image?: string
  status?: ItemStatus
  rating?: number
}

export class ItemsRepository {
  /**
   * Get all items (including deleted)
   */
  async getAll(): Promise<Item[]> {
    return withDB((db) => db.items.orderBy('updatedAt').reverse().toArray()) ?? []
  }

  /**
   * Get active items only (excludes deleted)
   */
  async getActive(): Promise<Item[]> {
    const all = await this.getAll()
    return filterActive(all)
  }

  /**
   * Get items by collection ID
   */
  async getByCollection(collectionId: string): Promise<Item[]> {
    return withDB((db) =>
      db.items
        .where('collectionId')
        .equals(collectionId)
        .reverse()
        .toArray()
    ) ?? []
  }

  /**
   * Get items by collection ID with status filter
   */
  async getByCollectionAndStatus(
    collectionId: string,
    status: ItemStatus
  ): Promise<Item[]> {
    return withDB((db) =>
      db.items
        .where('collectionId')
        .equals(collectionId)
        .toArray()
        .then(items => items.filter(item => item.status === status))
    ) ?? []
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<Item | undefined> {
    return withDB((db) => db.items.get(id)) ?? undefined
  }

  /**
   * Search items by name
   */
  async search(query: string): Promise<Item[]> {
    const lowerQuery = query.toLowerCase()
    return withDB((db) =>
      db.items
        .filter((item) => item.name.toLowerCase().includes(lowerQuery))
        .toArray()
    ) ?? []
  }

  /**
   * Create a new item
   */
  async create(data: CreateItemData): Promise<string> {
    const now = new Date()
    const id = generateUUID()

    await withDB((db) =>
      db.items.add({
        id,
        collectionId: data.collectionId,
        name: data.name,
        description: data.description,
        image: data.image,
        status: data.status || 'active',
        rating: data.rating,
        createdAt: now,
        updatedAt: now,
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'insert', data)

    return id
  }

  /**
   * Update an item
   */
  async update(id: string, data: UpdateItemData): Promise<void> {
    await withDB((db) =>
      db.items.update(id, {
        ...data,
        updatedAt: new Date(),
      })
    )

    // Mark for sync
    await this.markForSync(id, 'update', data)
  }

  /**
   * Delete an item (soft delete with tombstone)
   */
  async delete(id: string): Promise<void> {
    const item = await this.getById(id)
    if (!item) return

    // Mark as deleted with tombstone (soft delete)
    await withDB((db) =>
      db.items.update(id, {
        ...item,
        ...createTombstone(),
        synced: false,
      })
    )

    // Mark for sync - send tombstone to server
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  /**
   * Permanently delete an item (hard delete)
   * Use only for cleaning up old tombstones or local-only records
   */
  async hardDelete(id: string): Promise<void> {
    // Delete related metrics, history, notes, and tags
    await withDB((db) => db.metrics.where('itemId').equals(id).delete())
    await withDB((db) => db.history.where('itemId').equals(id).delete())
    await withDB((db) => db.notes.where('itemId').equals(id).delete())
    await withDB((db) => db.itemTags.where('itemId').equals(id).delete())

    await withDB((db) => db.items.delete(id))
  }

  /**
   * Get items by status
   */
  async getByStatus(status: ItemStatus): Promise<Item[]> {
    return withDB((db) => db.items.where('status').equals(status).toArray()) ?? []
  }

  /**
   * Get recent items
   */
  async getRecent(limit: number = 10): Promise<Item[]> {
    return withDB((db) => db.items.orderBy('updatedAt').reverse().limit(limit).toArray()) ?? []
  }

  /**
   * Get items with rating
   */
  async getByRating(minRating: number): Promise<Item[]> {
    return withDB((db) =>
      db.items
        .filter((item) => (item.rating || 0) >= minRating)
        .toArray()
    ) ?? []
  }

  /**
   * Mark item for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: generateUUID(),
        table: 'items',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Get unsynced items
   */
  async getUnsynced(): Promise<Item[]> {
    const syncRecords = withDB((db) =>
      db.syncQueue
        .where('table')
        .equals('items')
        .and((record) => !record.synced)
        .toArray()
    ) ?? []

    const items: Item[] = []
    for (const record of await syncRecords) {
      const item = await withDB((db) => db.items.get(record.recordId))
      if (item) {
        items.push(item)
      }
    }

    return items
  }

  /**
   * Mark item as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.items.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('table')
        .equals('items')
        .and((record) => record.recordId === id && !record.synced)
        .toArray()
    )) ?? []

    for (const record of syncRecords) {
      await withDB((db) => db.syncQueue.update(record.id, { synced: true }))
    }
  }
}

export const itemsRepository = new ItemsRepository()
