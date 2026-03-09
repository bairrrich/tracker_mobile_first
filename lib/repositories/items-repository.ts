import { withDB, type Item } from '@/lib/db'

export type ItemStatus = 'active' | 'archived' | 'completed'

export interface CreateItemData {
  collectionId: number
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
   * Get all items
   */
  async getAll(): Promise<Item[]> {
    return withDB((db) => db.items.orderBy('updatedAt').reverse().toArray()) ?? []
  }

  /**
   * Get items by collection ID
   */
  async getByCollection(collectionId: number): Promise<Item[]> {
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
    collectionId: number,
    status: ItemStatus
  ): Promise<Item[]> {
    return withDB((db) =>
      db.items
        .where('[collectionId+status]')
        .equals([collectionId, status])
        .reverse()
        .toArray()
    ) ?? []
  }

  /**
   * Get item by ID
   */
  async getById(id: number): Promise<Item | undefined> {
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
  async create(data: CreateItemData): Promise<number> {
    const now = new Date()
    const id = await withDB((db) =>
      db.items.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
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
    ) ?? 0

    // Mark for sync
    await this.markForSync(id as number, 'insert', data)

    return id as number
  }

  /**
   * Update an item
   */
  async update(id: number, data: UpdateItemData): Promise<void> {
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
   * Delete an item
   */
  async delete(id: number): Promise<void> {
    // Delete related metrics, history, notes, and tags
    await withDB((db) => db.metrics.where('itemId').equals(id).delete())
    await withDB((db) => db.history.where('itemId').equals(id).delete())
    await withDB((db) => db.notes.where('itemId').equals(id).delete())
    await withDB((db) => db.itemTags.where('itemId').equals(id).delete())

    await withDB((db) => db.items.delete(id))

    // Mark for sync
    await this.markForSync(id, 'delete')
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
    id: number,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
        table: 'items',
        recordId: String(id),
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
      const item = await withDB((db) => db.items.get(Number(record.recordId)))
      if (item) {
        items.push(item)
      }
    }

    return items
  }

  /**
   * Mark item as synced
   */
  async markAsSynced(id: number): Promise<void> {
    await withDB((db) => db.items.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('[table+recordId]')
        .equals(['items', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.syncQueue.update(key, { synced: true }))
    }
  }
}

export const itemsRepository = new ItemsRepository()
