import { withDB, type Workout, type WorkoutExercise, type WorkoutSet } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import type { WorkoutTypeId } from '@/lib/static-exercise-data'

export interface CreateWorkoutData {
  workoutTypeId: WorkoutTypeId
  date?: Date
  durationSeconds?: number
  notes?: string
}

export interface UpdateWorkoutData {
  workoutTypeId?: WorkoutTypeId
  date?: Date
  durationSeconds?: number
  notes?: string
}

export class WorkoutsRepository {
  /**
   * Get workout by ID
   */
  async getById(id: string): Promise<Workout | undefined> {
    return withDB((db) => db.workouts.get(id)) ?? undefined
  }

  /**
   * Get all workouts (including deleted)
   */
  async getAll(): Promise<Workout[]> {
    return withDB((db) => db.workouts.orderBy('date').reverse().toArray()) ?? []
  }

  /**
   * Get active workouts only (excludes deleted)
   */
  async getActive(): Promise<Workout[]> {
    const all = await this.getAll()
    return filterActive(all)
  }

  /**
   * Get workouts by type
   */
  async getByType(workoutTypeId: string): Promise<Workout[]> {
    const workouts = await withDB((db) =>
      db.workouts
        .where('workoutTypeId')
        .equals(workoutTypeId)
        .reverse()
        .toArray()
    ) || []
    // Filter out deleted workouts
    return workouts.filter(w => !w.deleted)
  }

  /**
   * Get workouts by date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Workout[]> {
    const workouts = await this.getActive()
    return workouts.filter(w => w.date >= startDate && w.date <= endDate)
  }

  /**
   * Get recent workouts
   */
  async getRecent(limit: number = 10): Promise<Workout[]> {
    const workouts = await this.getActive()
    return workouts.slice(0, limit)
  }

  /**
   * Create a new workout
   */
  async create(data: CreateWorkoutData): Promise<string> {
    const now = new Date()
    const id = generateUUID()

    await withDB((db) =>
      db.workouts.add({
        id,
        workoutTypeId: data.workoutTypeId,
        date: data.date || now,
        durationSeconds: data.durationSeconds,
        notes: data.notes,
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
   * Update a workout
   */
  async update(id: string, data: UpdateWorkoutData): Promise<void> {
    const updateData: Partial<Workout> = {
      ...data,
      updatedAt: new Date(),
    }

    await withDB((db) => db.workouts.update(id, updateData))

    // Mark for sync
    await this.markForSync(id, 'update', updateData)
  }

  /**
   * Soft delete a workout
   */
  async delete(id: string): Promise<void> {
    const tombstone = createTombstone()

    await withDB((db) =>
      db.workouts.update(id, {
        ...tombstone,
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  /**
   * Mark workout for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.sync_queue.add({
        id: generateUUID(),
        table: 'workouts',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Get unsynced workouts
   */
  async getUnsynced(): Promise<Workout[]> {
    const syncRecords = withDB((db) =>
      db.sync_queue
        .where('table')
        .equals('workouts')
        .and((record) => !record.synced)
        .toArray()
    ) ?? []

    const workouts: Workout[] = []
    for (const record of await syncRecords) {
      const workout = await withDB((db) => db.workouts.get(record.recordId))
      if (workout) {
        workouts.push(workout)
      }
    }

    return workouts
  }

  /**
   * Mark workout as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.workouts.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.sync_queue
        .where('[table+recordId]')
        .equals(['workouts', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.sync_queue.update(key, { synced: true }))
    }
  }
}

// ============================================
// Workout Exercises Repository
// ============================================

export class WorkoutExercisesRepository {
  /**
   * Get workout exercise by ID
   */
  async getById(id: string): Promise<WorkoutExercise | undefined> {
    return withDB((db) => db.workout_exercises.get(id)) ?? undefined
  }

  /**
   * Get exercises for a workout
   */
  async getByWorkout(workoutId: string): Promise<WorkoutExercise[]> {
    const exercises = await withDB((db) =>
      db.workout_exercises
        .where('workoutId')
        .equals(workoutId)
        .sortBy('orderIndex')
    ) || []
    // Filter out deleted
    return exercises.filter(e => !e.deleted)
  }

  /**
   * Add exercise to workout
   */
  async addToWorkout(
    workoutId: string,
    exerciseId: string,
    orderIndex?: number
  ): Promise<string> {
    const id = generateUUID()

    // Get max order index if not provided
    const existingExercises = await this.getByWorkout(workoutId)
    const newIndex = orderIndex ?? existingExercises.length

    await withDB((db) =>
      db.workout_exercises.add({
        id,
        workoutId,
        exerciseId,
        orderIndex: newIndex,
        createdAt: new Date(),
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'insert', { id, workoutId, exerciseId, orderIndex: newIndex })

    return id
  }

  /**
   * Remove exercise from workout
   */
  async delete(id: string): Promise<void> {
    const tombstone = createTombstone()

    await withDB((db) =>
      db.workout_exercises.update(id, {
        ...tombstone,
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  /**
   * Mark workout exercise as synced
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.sync_queue.add({
        id: generateUUID(),
        table: 'workout_exercises',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Mark workout exercise as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.workout_exercises.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.sync_queue
        .where('[table+recordId]')
        .equals(['workout_exercises', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.sync_queue.update(key, { synced: true }))
    }
  }
}

// ============================================
// Workout Sets Repository
// ============================================

export class WorkoutSetsRepository {
  /**
   * Get set by ID
   */
  async getById(id: string): Promise<WorkoutSet | undefined> {
    return withDB((db) => db.workout_sets.get(id)) ?? undefined
  }

  /**
   * Get sets for a workout exercise
   */
  async getByWorkoutExercise(workoutExerciseId: string): Promise<WorkoutSet[]> {
    const sets = await withDB((db) =>
      db.workout_sets
        .where('workoutExerciseId')
        .equals(workoutExerciseId)
        .sortBy('setNumber')
    ) || []
    // Filter out deleted
    return sets.filter(s => !s.deleted)
  }

  /**
   * Add a set
   */
  async add(
    workoutExerciseId: string,
    setNumber: number,
    reps?: number,
    weight?: number,
    durationSeconds?: number
  ): Promise<string> {
    const id = generateUUID()

    await withDB((db) =>
      db.workout_sets.add({
        id,
        workoutExerciseId,
        setNumber,
        reps,
        weight,
        durationSeconds,
        completed: false,
        createdAt: new Date(),
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'insert', { id, workoutExerciseId, setNumber, reps, weight, durationSeconds })

    return id
  }

  /**
   * Update a set
   */
  async update(
    id: string,
    data: { reps?: number; weight?: number; durationSeconds?: number; completed?: boolean }
  ): Promise<void> {
    await withDB((db) => db.workout_sets.update(id, data))

    // Mark for sync
    await this.markForSync(id, 'update', { id, ...data })
  }

  /**
   * Mark set as completed
   */
  async markCompleted(id: string): Promise<void> {
    await this.update(id, { completed: true })
  }

  /**
   * Delete a set
   */
  async delete(id: string): Promise<void> {
    const tombstone = createTombstone()

    await withDB((db) =>
      db.workout_sets.update(id, {
        ...tombstone,
        synced: false,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  /**
   * Mark set for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.sync_queue.add({
        id: generateUUID(),
        table: 'workout_sets',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Mark set as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.workout_sets.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.sync_queue
        .where('[table+recordId]')
        .equals(['workout_sets', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.sync_queue.update(key, { synced: true }))
    }
  }
}

export const workoutsRepository = new WorkoutsRepository()
export const workoutExercisesRepository = new WorkoutExercisesRepository()
export const workoutSetsRepository = new WorkoutSetsRepository()
