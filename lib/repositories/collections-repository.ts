import { db, type Collection, type CollectionType } from '@/lib/db'

export class CollectionsRepository {
  /**
   * Get all collections
   */
  async getAll(): Promise<Collection[]> {
    return await db.collections.orderBy('updatedAt').reverse().toArray()
  }

  /**
   * Get collection by ID
   */
  async getById(id: number): Promise<Collection | undefined> {
    return await db.collections.get(id)
  }

  /**
   * Get collections by type
   */
  async getByType(type: CollectionType): Promise<Collection[]> {
    return await db.collections.where('type').equals(type).toArray()
  }

  /**
   * Create a new collection
   */
  async create(
    data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'synced'>
  ): Promise<number> {
    const now = new Date()
    const id = await db.collections.add({
      ...data,
      createdAt: now,
      updatedAt: now,
      synced: false,
    })

    // Mark for sync
    await this.markForSync(id, 'insert', data)

    return id as number
  }

  /**
   * Update a collection
   */
  async update(
    id: number,
    data: Partial<Omit<Collection, 'id' | 'createdAt' | 'synced'>>
  ): Promise<void> {
    await db.collections.update(id, {
      ...data,
      updatedAt: new Date(),
    })

    // Mark for sync
    await this.markForSync(id, 'update', data)
  }

  /**
   * Delete a collection
   */
  async delete(id: number): Promise<void> {
    // Delete related items first
    const itemIds = await db.items
      .where('collectionId')
      .equals(id)
      .primaryKeys()

    for (const itemId of itemIds) {
      await db.items.delete(itemId)
    }

    await db.collections.delete(id)

    // Mark for sync
    await this.markForSync(id, 'delete')
  }

  /**
   * Get item count for a collection
   */
  async getItemCount(collectionId: number): Promise<number> {
    return await db.items.where('collectionId').equals(collectionId).count()
  }

  /**
   * Get all collections with item counts
   */
  async getAllWithCounts(): Promise<
    Array<Collection & { itemCount: number }>
  > {
    const collections = await this.getAll()
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => ({
        ...collection,
        itemCount: await this.getItemCount(collection.id),
      }))
    )
    return collectionsWithCounts
  }

  /**
   * Mark collection for sync
   */
  private async markForSync(
    id: number,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await db.syncQueue.add({
      id: Date.now() + Math.floor(Math.random() * 1000),
      table: 'collections',
      recordId: id,
      operation,
      data: data ? JSON.stringify(data) : '',
      synced: false,
      createdAt: new Date(),
    })
  }

  /**
   * Get unsynced collections
   */
  async getUnsynced(): Promise<Collection[]> {
    const syncRecords = await db.syncQueue
      .where('table')
      .equals('collections')
      .and((record) => !record.synced)
      .toArray()

    const collections: Collection[] = []
    for (const record of syncRecords) {
      const collection = await db.collections.get(record.recordId)
      if (collection) {
        collections.push(collection)
      }
    }

    return collections
  }

  /**
   * Mark collection as synced
   */
  async markAsSynced(id: number): Promise<void> {
    await db.collections.update(id, { synced: true })

    const syncRecords = await db.syncQueue
      .where('[table+recordId]')
      .equals(['collections', id])
      .and((record) => !record.synced)
      .primaryKeys()

    for (const key of syncRecords) {
      await db.syncQueue.update(key, { synced: true })
    }
  }
}

export const collectionsRepository = new CollectionsRepository()
