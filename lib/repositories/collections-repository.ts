import { withDB, type Collection, type CollectionType } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'

export class CollectionsRepository {
  /**
   * Get all collections
   */
  async getAll(): Promise<Collection[]> {
    return withDB((db) => db.collections.orderBy('updatedAt').reverse().toArray()) ?? []
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
   * Delete a collection
   */
  async delete(id: string): Promise<void> {
    withDB((db) => {
      db.collections.delete(id)
    })

    // Mark for sync
    await this.markForSync(id, 'delete')
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
