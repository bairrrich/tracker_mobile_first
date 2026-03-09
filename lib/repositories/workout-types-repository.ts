import { WORKOUT_TYPES, type WorkoutTypeId, type WorkoutTypeEntity } from '@/lib/static-exercise-data'

/**
 * Workout Types Repository - Static Data
 * Workout types are predefined in the app and not stored in the database
 */
export class WorkoutTypesRepository {
  /**
   * Get workout type by ID
   */
  getById(id: WorkoutTypeId): WorkoutTypeEntity | undefined {
    return WORKOUT_TYPES.find(wt => wt.id === id)
  }

  /**
   * Get all workout types
   */
  getAll(): WorkoutTypeEntity[] {
    return WORKOUT_TYPES
  }

  /**
   * Get active workout types (all static types are active)
   */
  getActive(): WorkoutTypeEntity[] {
    return WORKOUT_TYPES
  }
}

export const workoutTypesRepository = new WorkoutTypesRepository()
