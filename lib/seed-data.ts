import { DEFAULT_EXERCISES } from '@/lib/static-exercise-data'

/**
 * Seed database with default exercises (only if exercises don't exist)
 */
export async function seedDefaultData() {
  const { exercisesRepository } = await import('@/lib/repositories/exercises-repository')

  console.log('[Seed] Checking if seeding is needed...')

  // Check if exercises already exist
  const existingExercises = await exercisesRepository.getAll()

  if (existingExercises.length > 0) {
    console.log('[Seed] Data already exists, skipping seeding')
    return
  }

  console.log('[Seed] Starting default exercises seeding...')

  // Seed exercises
  for (const exercise of DEFAULT_EXERCISES) {
    try {
      await exercisesRepository.create({
        name: exercise.name,
        description: exercise.description,
        categoryId: exercise.categoryId,
        isDefault: true,
      })
      console.log(`[Seed] Created exercise: ${exercise.name}`)
    } catch (error) {
      console.log(`[Seed] Exercise ${exercise.name} may already exist`)
    }
  }

  console.log('[Seed] Default data seeding complete!')
}
