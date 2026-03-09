import { withDB, type Exercise, type ExerciseCategoryId } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import { EXERCISE_CATEGORIES, WORKOUT_TYPES, type WorkoutTypeId } from '@/lib/static-exercise-data'

export interface CreateExerciseData {
  name: string
  description?: string
  categoryId: ExerciseCategoryId  // Static category ID
  isDefault?: boolean
}

export interface UpdateExerciseData {
  name?: string
  description?: string
  categoryId?: ExerciseCategoryId
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
  async getByCategory(categoryId: ExerciseCategoryId): Promise<Exercise[]> {
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
  async getByWorkoutType(workoutTypeId: WorkoutTypeId): Promise<Exercise[]> {
    // Get category IDs for this workout type from static data
    const categoryIds = EXERCISE_CATEGORIES
      .filter(cat => cat.workoutTypeId === workoutTypeId)
      .map(cat => cat.id)

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
// Exercise Categories Repository (Static Data)
// ============================================

export class ExerciseCategoriesRepository {
  /**
   * Get category by ID (from static data)
   */
  getById(id: ExerciseCategoryId) {
    return EXERCISE_CATEGORIES.find(cat => cat.id === id)
  }

  /**
   * Get all categories (from static data)
   */
  getAll() {
    return EXERCISE_CATEGORIES
  }

  /**
   * Get categories by workout type (from static data)
   */
  getByWorkoutType(workoutTypeId: WorkoutTypeId) {
    return EXERCISE_CATEGORIES.filter(cat => cat.workoutTypeId === workoutTypeId)
  }

  /**
   * Get available workout types (from static data)
   */
  getWorkoutTypes() {
    return WORKOUT_TYPES
  }
}

export const exercisesRepository = new ExercisesRepository()
export const exerciseCategoriesRepository = new ExerciseCategoriesRepository()
