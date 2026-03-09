import { withDB, type WorkoutTypeEntity } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { filterActive } from '@/lib/utils/sync-utils'

export class WorkoutTypesRepository {
  /**
   * Get workout type by ID
   */
  async getById(id: string): Promise<WorkoutTypeEntity | undefined> {
    return withDB((db) => db.workoutTypes.get(id)) ?? undefined
  }

  /**
   * Get all workout types
   */
  async getAll(): Promise<WorkoutTypeEntity[]> {
    return withDB((db) => db.workoutTypes.orderBy('name').toArray()) ?? []
  }

  /**
   * Get active workout types only
   */
  async getActive(): Promise<WorkoutTypeEntity[]> {
    const all = await this.getAll()
    return filterActive(all)
  }

  /**
   * Create a new workout type
   */
  async create(name: string): Promise<string> {
    const id = generateUUID()

    await withDB((db) =>
      db.workoutTypes.add({
        id,
        name,
        createdAt: new Date(),
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'insert', { id, name })

    return id
  }

  /**
   * Mark workout type for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: generateUUID(),
        table: 'workout_types',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Mark workout type as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.workoutTypes.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('[table+recordId]')
        .equals(['workout_types', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.syncQueue.update(key, { synced: true }))
    }
  }
}

export const workoutTypesRepository = new WorkoutTypesRepository()
