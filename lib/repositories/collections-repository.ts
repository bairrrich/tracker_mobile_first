import { withDB, type Collection, type CollectionType } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export class CollectionsRepository {
  /**
   * Get all collections (including deleted)
   */
  async getAll(): Promise<Collection[]> {
    return withDB((db) => db.collections.orderBy('updatedAt').reverse().toArray()) ?? []
  }

  /**
   * Get active collections only (excludes deleted)
   */
  async getActive(): Promise<Collection[]> {
    const all = await this.getAll()
    return filterActive(all)
  }

  /**
   * Get collection by ID
   */
  async getById(id: string): Promise<Collection | undefined> {
    return withDB((db) => db.collections.get(id)) ?? undefined
  }

  /**
   * Get collections by type
   */
  async getByType(type: CollectionType): Promise<Collection[]> {
    return withDB((db) => db.collections.where('type').equals(type).toArray()) ?? []
  }

  /**
   * Create a new collection
   */
  async create(
    data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'synced'>
  ): Promise<string> {
    const now = new Date()
    const id = generateUUID()

    await withDB((db) =>
      db.collections.add({
        ...data,
        id,
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
   * Update a collection
   */
  async update(
    id: string,
    data: Partial<Omit<Collection, 'id' | 'createdAt' | 'synced'>>
  ): Promise<void> {
    withDB((db) => {
      db.collections.update(id, {
        ...data,
        updatedAt: new Date(),
      })
    })

    // Mark for sync
    await this.markForSync(id, 'update', data)
  }

  /**
   * Delete a collection (soft delete with tombstone)
   */
  async delete(id: string): Promise<void> {
    const collection = await this.getById(id)
    if (!collection) return

    withDB((db) => {
      db.collections.update(id, {
        ...collection,
        ...createTombstone(),
        synced: false,
      })
    })

    // Mark for sync - send tombstone to server
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  /**
   * Permanently delete a collection (hard delete)
   * Use only for cleaning up old tombstones or local-only records
   */
  async hardDelete(id: string): Promise<void> {
    withDB((db) => {
      db.collections.delete(id)
    })
  }

  /**
   * Get item count for a collection
   */
  async getItemCount(collectionId: string): Promise<number> {
    return withDB((db) => db.items.where('collectionId').equals(collectionId).count()) ?? 0
  }

  /**
   * Get all collections with item counts
   */
  async getAllWithCounts(): Promise<
    Array<Collection & { itemCount: number }>
  > {
    const collections = await this.getActive()
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
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    withDB((db) => {
      db.syncQueue.add({
        id: generateUUID(),
        table: 'collections',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    })
  }

  /**
   * Mark collection as synced
   */
  async markAsSynced(id: string): Promise<void> {
    withDB((db) => {
      db.collections.update(id, { synced: true })
    })
  }
}

export const collectionsRepository = new CollectionsRepository()
