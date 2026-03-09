import { withDB, type Exercise, type ExerciseCategory } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export interface CreateExerciseData {
  name: string
  description?: string
  categoryId: string  // UUID
  isDefault?: boolean
}

export interface UpdateExerciseData {
  name?: string
  description?: string
  categoryId?: string
}

export class ExercisesRepository {
  /**
   * Get exercise by ID
   */
  async getById(id: string): Promise<Exercise | undefined> {
    return withDB((db) => db.exercises.get(id)) ?? undefined
  }

  /**
   * Get all exercises (including deleted)
   */
  async getAll(): Promise<Exercise[]> {
    return withDB((db) => db.exercises.orderBy('updatedAt').reverse().toArray()) ?? []
  }

  /**
   * Get active exercises only (excludes deleted)
   */
  async getActive(): Promise<Exercise[]> {
    const all = await this.getAll()
    return filterActive(all)
  }

  /**
   * Get exercises by category
   */
  async getByCategory(categoryId: string): Promise<Exercise[]> {
    const exercises = await withDB((db) =>
      db.exercises
        .where('categoryId')
        .equals(categoryId)
        .reverse()
        .toArray()
    ) || []
    // Filter out deleted exercises
    return exercises.filter(exercise => !exercise.deleted)
  }

  /**
   * Get exercises by workout type
   */
  async getByWorkoutType(workoutTypeId: string): Promise<Exercise[]> {
    const categories = await withDB((db) =>
      db.exerciseCategories
        .where('workoutTypeId')
        .equals(workoutTypeId)
        .toArray()
    ) ?? []

    const categoryIds = categories.map(c => c.id)
    const exercises = await this.getActive()
    
    return exercises.filter(e => categoryIds.includes(e.categoryId))
  }

  /**
   * Search exercises by name
   */
  async search(query: string): Promise<Exercise[]> {
    const lowerQuery = query.toLowerCase()
    const exercises = await this.getActive()
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(lowerQuery) ||
      (exercise.description && exercise.description.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Create a new exercise
   */
  async create(data: CreateExerciseData): Promise<string> {
    const now = new Date()
    const id = generateUUID()

    await withDB((db) =>
      db.exercises.add({
        id,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        isDefault: data.isDefault ?? false,
        createdAt: now,
        updatedAt: now,
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'insert', { ...data, id })

    return id
  }

  /**
   * Update an exercise
   */
  async update(id: string, data: UpdateExerciseData): Promise<void> {
    const updateData: Partial<Exercise> = {
      ...data,
      updatedAt: new Date(),
    }

    await withDB((db) => db.exercises.update(id, updateData))

    // Mark for sync
    await this.markForSync(id, 'update', updateData)
  }

  /**
   * Soft delete an exercise (mark as deleted)
   */
  async delete(id: string): Promise<void> {
    const tombstone = createTombstone()

    await withDB((db) =>
      db.exercises.update(id, {
        ...tombstone,
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  /**
   * Permanently delete an exercise (hard delete)
   * Use only for cleaning up old tombstones or local-only records
   */
  async hardDelete(id: string): Promise<void> {
    await withDB((db) => db.exercises.delete(id))
  }

  /**
   * Mark exercise for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: generateUUID(),
        table: 'exercises',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Get unsynced exercises
   */
  async getUnsynced(): Promise<Exercise[]> {
    const syncRecords = withDB((db) =>
      db.syncQueue
        .where('table')
        .equals('exercises')
        .and((record) => !record.synced)
        .toArray()
    ) ?? []

    const exercises: Exercise[] = []
    for (const record of await syncRecords) {
      const exercise = await withDB((db) => db.exercises.get(record.recordId))
      if (exercise) {
        exercises.push(exercise)
      }
    }

    return exercises
  }

  /**
   * Mark exercise as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.exercises.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('[table+recordId]')
        .equals(['exercises', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.syncQueue.update(key, { synced: true }))
    }
  }
}

// ============================================
// Exercise Categories Repository
// ============================================

export class ExerciseCategoriesRepository {
  /**
   * Get category by ID
   */
  async getById(id: string): Promise<ExerciseCategory | undefined> {
    return withDB((db) => db.exerciseCategories.get(id)) ?? undefined
  }

  /**
   * Get all categories
   */
  async getAll(): Promise<ExerciseCategory[]> {
    return withDB((db) => db.exerciseCategories.orderBy('name').toArray()) ?? []
  }

  /**
   * Get categories by workout type
   */
  async getByWorkoutType(workoutTypeId: string): Promise<ExerciseCategory[]> {
    const categories = await withDB((db) =>
      db.exerciseCategories
        .where('workoutTypeId')
        .equals(workoutTypeId)
        .toArray()
    ) || []
    // Filter out deleted categories
    return categories.filter(cat => !cat.deleted)
  }

  /**
   * Create a new category
   */
  async create(name: string, workoutTypeId: string): Promise<string> {
    const id = generateUUID()

    await withDB((db) =>
      db.exerciseCategories.add({
        id,
        name,
        workoutTypeId,
        createdAt: new Date(),
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'insert', { id, name, workoutTypeId })

    return id
  }

  /**
   * Mark category for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: generateUUID(),
        table: 'exercise_categories',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Mark category as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.exerciseCategories.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('[table+recordId]')
        .equals(['exercise_categories', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.syncQueue.update(key, { synced: true }))
    }
  }
}

export const exercisesRepository = new ExercisesRepository()
export const exerciseCategoriesRepository = new ExerciseCategoriesRepository()
