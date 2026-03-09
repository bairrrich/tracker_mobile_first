export interface SeedData {
  workoutTypes: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string; workoutTypeId: string }>
  exercises: Array<{ name: string; categoryId: string; description?: string }>
}

/**
 * Default workout types
 */
export const WORKOUT_TYPES = [
  { id: 'strength', name: 'Strength' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'yoga', name: 'Yoga' },
]

/**
 * Default exercise categories by workout type
 */
export const EXERCISE_CATEGORIES = [
  // Strength categories
  { id: 'chest', name: 'Chest', workoutTypeId: 'strength' },
  { id: 'back', name: 'Back', workoutTypeId: 'strength' },
  { id: 'legs', name: 'Legs', workoutTypeId: 'strength' },
  { id: 'shoulders', name: 'Shoulders', workoutTypeId: 'strength' },
  { id: 'biceps', name: 'Biceps', workoutTypeId: 'strength' },
  { id: 'triceps', name: 'Triceps', workoutTypeId: 'strength' },
  { id: 'abs', name: 'Abs', workoutTypeId: 'strength' },
  
  // Cardio categories
  { id: 'running', name: 'Running', workoutTypeId: 'cardio' },
  { id: 'cycling', name: 'Cycling', workoutTypeId: 'cardio' },
  { id: 'swimming', name: 'Swimming', workoutTypeId: 'cardio' },
  { id: 'elliptical', name: 'Elliptical', workoutTypeId: 'cardio' },
  { id: 'rowing', name: 'Rowing', workoutTypeId: 'cardio' },
  { id: 'jumping', name: 'Jumping', workoutTypeId: 'cardio' },
  
  // Yoga categories
  { id: 'standing_poses', name: 'Standing Poses', workoutTypeId: 'yoga' },
  { id: 'balances', name: 'Balances', workoutTypeId: 'yoga' },
  { id: 'seated_poses', name: 'Seated Poses', workoutTypeId: 'yoga' },
  { id: 'twists', name: 'Twists', workoutTypeId: 'yoga' },
  { id: 'backbends', name: 'Backbends', workoutTypeId: 'yoga' },
  { id: 'inversions', name: 'Inversions', workoutTypeId: 'yoga' },
]

/**
 * Default exercises library
 */
export const DEFAULT_EXERCISES = [
  // Chest exercises
  { name: 'Bench Press', categoryId: 'chest', description: 'Barbell bench press for chest development' },
  { name: 'Incline Dumbbell Press', categoryId: 'chest', description: 'Upper chest focus with dumbbells' },
  { name: 'Push-Ups', categoryId: 'chest', description: 'Bodyweight chest exercise' },
  { name: 'Cable Flyes', categoryId: 'chest', description: 'Isolation exercise for chest' },
  { name: 'Dips', categoryId: 'chest', description: 'Chest and triceps compound movement' },
  
  // Back exercises
  { name: 'Pull-Ups', categoryId: 'back', description: 'Bodyweight back exercise' },
  { name: 'Barbell Rows', categoryId: 'back', description: 'Compound back builder' },
  { name: 'Lat Pulldowns', categoryId: 'back', description: 'Machine exercise for lats' },
  { name: 'Deadlift', categoryId: 'back', description: 'Full body compound movement' },
  { name: 'Seated Cable Row', categoryId: 'back', description: 'Machine rowing exercise' },
  
  // Legs exercises
  { name: 'Squats', categoryId: 'legs', description: 'King of leg exercises' },
  { name: 'Leg Press', categoryId: 'legs', description: 'Machine leg exercise' },
  { name: 'Lunges', categoryId: 'legs', description: 'Unilateral leg exercise' },
  { name: 'Leg Curls', categoryId: 'legs', description: 'Hamstring isolation' },
  { name: 'Calf Raises', categoryId: 'legs', description: 'Calf development' },
  
  // Shoulders exercises
  { name: 'Overhead Press', categoryId: 'shoulders', description: 'Compound shoulder builder' },
  { name: 'Lateral Raises', categoryId: 'shoulders', description: 'Side delt isolation' },
  { name: 'Front Raises', categoryId: 'shoulders', description: 'Front delt exercise' },
  { name: 'Face Pulls', categoryId: 'shoulders', description: 'Rear delt and upper back' },
  { name: 'Arnold Press', categoryId: 'shoulders', description: 'Rotational shoulder press' },
  
  // Biceps exercises
  { name: 'Barbell Curls', categoryId: 'biceps', description: 'Classic biceps builder' },
  { name: 'Hammer Curls', categoryId: 'biceps', description: 'Biceps and brachialis' },
  { name: 'Preacher Curls', categoryId: 'biceps', description: 'Isolated biceps curl' },
  { name: 'Concentration Curls', categoryId: 'biceps', description: 'Peak contraction curl' },
  { name: 'Incline Dumbbell Curls', categoryId: 'biceps', description: 'Stretch-focused curl' },
  
  // Triceps exercises
  { name: 'Tricep Pushdowns', categoryId: 'triceps', description: 'Cable tricep exercise' },
  { name: 'Skull Crushers', categoryId: 'triceps', description: 'Lying tricep extension' },
  { name: 'Close-Grip Bench Press', categoryId: 'triceps', description: 'Compound tricep movement' },
  { name: 'Overhead Extensions', categoryId: 'triceps', description: 'Long head focus' },
  { name: 'Diamond Push-Ups', categoryId: 'triceps', description: 'Bodyweight tricep exercise' },
  
  // Abs exercises
  { name: 'Crunches', categoryId: 'abs', description: 'Basic ab exercise' },
  { name: 'Plank', categoryId: 'abs', description: 'Isometric core hold' },
  { name: 'Russian Twists', categoryId: 'abs', description: 'Rotational core exercise' },
  { name: 'Leg Raises', categoryId: 'abs', description: 'Lower ab focus' },
  { name: 'Cable Crunches', categoryId: 'abs', description: 'Weighted ab exercise' },
  
  // Running exercises
  { name: 'Treadmill Run', categoryId: 'running', description: 'Indoor running' },
  { name: 'Outdoor Run', categoryId: 'running', description: 'Outdoor running' },
  { name: 'Sprint Intervals', categoryId: 'running', description: 'High-intensity running' },
  { name: 'Long Distance Run', categoryId: 'running', description: 'Endurance running' },
  
  // Cycling exercises
  { name: 'Stationary Bike', categoryId: 'cycling', description: 'Indoor cycling' },
  { name: 'Road Cycling', categoryId: 'cycling', description: 'Outdoor cycling' },
  { name: 'Spin Class', categoryId: 'cycling', description: 'Group cycling workout' },
  { name: 'Mountain Biking', categoryId: 'cycling', description: 'Off-road cycling' },
  
  // Swimming exercises
  { name: 'Freestyle', categoryId: 'swimming', description: 'Front crawl swimming' },
  { name: 'Breaststroke', categoryId: 'swimming', description: 'Traditional swimming style' },
  { name: 'Backstroke', categoryId: 'swimming', description: 'Back swimming' },
  { name: 'Butterfly', categoryId: 'swimming', description: 'Advanced swimming style' },
  
  // Elliptical exercises
  { name: 'Elliptical Workout', categoryId: 'elliptical', description: 'Low-impact cardio' },
  { name: 'Elliptical Intervals', categoryId: 'elliptical', description: 'HIIT on elliptical' },
  
  // Rowing exercises
  { name: 'Rowing Machine', categoryId: 'rowing', description: 'Indoor rowing' },
  { name: 'Concept2 Row', categoryId: 'rowing', description: 'Standard rowing workout' },
  
  // Jumping exercises
  { name: 'Jump Rope', categoryId: 'jumping', description: 'Skipping rope' },
  { name: 'Box Jumps', categoryId: 'jumping', description: 'Plyometric jumps' },
  { name: 'Burpees', categoryId: 'jumping', description: 'Full body jump exercise' },
  
  // Standing poses
  { name: 'Mountain Pose (Tadasana)', categoryId: 'standing_poses', description: 'Foundation pose' },
  { name: 'Warrior I (Virabhadrasana I)', categoryId: 'standing_poses', description: 'Standing strength pose' },
  { name: 'Warrior II (Virabhadrasana II)', categoryId: 'standing_poses', description: 'Hip opening pose' },
  { name: 'Triangle Pose (Trikonasana)', categoryId: 'standing_poses', description: 'Side stretch pose' },
  
  // Balances
  { name: 'Tree Pose (Vrksasana)', categoryId: 'balances', description: 'Standing balance' },
  { name: 'Eagle Pose (Garudasana)', categoryId: 'balances', description: 'Wrapped balance' },
  { name: 'Warrior III (Virabhadrasana III)', categoryId: 'balances', description: 'Forward balance' },
  
  // Seated poses
  { name: 'Staff Pose (Dandasana)', categoryId: 'seated_poses', description: 'Foundation seated pose' },
  { name: 'Seated Forward Bend (Paschimottanasana)', categoryId: 'seated_poses', description: 'Hamstring stretch' },
  { name: 'Butterfly Pose (Baddha Konasana)', categoryId: 'seated_poses', description: 'Hip opener' },
  
  // Twists
  { name: 'Seated Spinal Twist (Ardha Matsyendrasana)', categoryId: 'twists', description: 'Seated twist' },
  { name: 'Revolved Triangle (Parivrtta Trikonasana)', categoryId: 'twists', description: 'Standing twist' },
  { name: 'Supine Twist (Supta Matsyendrasana)', categoryId: 'twists', description: 'Lying twist' },
  
  // Backbends
  { name: 'Cobra Pose (Bhujangasana)', categoryId: 'backbends', description: 'Gentle backbend' },
  { name: 'Upward Dog (Urdhva Mukha Svanasana)', categoryId: 'backbends', description: 'Full backbend' },
  { name: 'Bridge Pose (Setu Bandhasana)', categoryId: 'backbends', description: 'Supported backbend' },
  { name: 'Wheel Pose (Urdhva Dhanurasana)', categoryId: 'backbends', description: 'Full wheel backbend' },
  
  // Inversions
  { name: 'Downward Dog (Adho Mukha Svanasana)', categoryId: 'inversions', description: 'Foundational inversion' },
  { name: 'Shoulder Stand (Sarvangasana)', categoryId: 'inversions', description: 'Supported inversion' },
  { name: 'Headstand (Sirsasana)', categoryId: 'inversions', description: 'Advanced inversion' },
  { name: 'Plow Pose (Halasana)', categoryId: 'inversions', description: 'Forward inversion' },
]

/**
 * Seed database with default data
 */
export async function seedDefaultData() {
  const { workoutTypesRepository } = await import('@/lib/repositories/workout-types-repository')
  const { exerciseCategoriesRepository } = await import('@/lib/repositories/exercises-repository')
  const { exercisesRepository } = await import('@/lib/repositories/exercises-repository')
  
  console.log('[Seed] Starting default data seeding...')
  
  // Seed workout types
  for (const type of WORKOUT_TYPES) {
    try {
      await workoutTypesRepository.create(type.name)
      console.log(`[Seed] Created workout type: ${type.name}`)
    } catch (error) {
      console.log(`[Seed] Workout type ${type.name} may already exist`)
    }
  }
  
  // Seed categories
  for (const category of EXERCISE_CATEGORIES) {
    try {
      await exerciseCategoriesRepository.create(category.name, category.workoutTypeId)
      console.log(`[Seed] Created category: ${category.name}`)
    } catch (error) {
      console.log(`[Seed] Category ${category.name} may already exist`)
    }
  }
  
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
