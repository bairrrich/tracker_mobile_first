export type { WorkoutTypeEntity, WorkoutTypeId, ExerciseCategory, ExerciseCategoryId } from '@/lib/db'
import type { WorkoutTypeEntity, WorkoutTypeId, ExerciseCategory, ExerciseCategoryId } from '@/lib/db'

/**
 * Static workout types - predefined in the app
 */
export const WORKOUT_TYPES: WorkoutTypeEntity[] = [
  { id: 'strength', name: 'Strength' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'yoga', name: 'Yoga' },
]

/**
 * Static exercise categories - predefined in the app
 */
export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
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
 * Helper to get workout type by ID
 */
export function getWorkoutTypeById(id: WorkoutTypeId): WorkoutTypeEntity | undefined {
  return WORKOUT_TYPES.find(wt => wt.id === id)
}

/**
 * Helper to get categories by workout type
 */
export function getCategoriesByWorkoutType(workoutTypeId: WorkoutTypeId): ExerciseCategory[] {
  return EXERCISE_CATEGORIES.filter(cat => cat.workoutTypeId === workoutTypeId)
}

/**
 * Helper to get category by ID
 */
export function getCategoryById(id: ExerciseCategoryId): ExerciseCategory | undefined {
  return EXERCISE_CATEGORIES.find(cat => cat.id === id)
}

/**
 * Default exercises library - seeded on first load
 */
export const DEFAULT_EXERCISES = [
  // Chest exercises
  { name: 'Bench Press', categoryId: 'chest' as ExerciseCategoryId, description: 'Barbell bench press for chest development' },
  { name: 'Incline Dumbbell Press', categoryId: 'chest' as ExerciseCategoryId, description: 'Upper chest focus with dumbbells' },
  { name: 'Push-Ups', categoryId: 'chest' as ExerciseCategoryId, description: 'Bodyweight chest exercise' },
  { name: 'Cable Flyes', categoryId: 'chest' as ExerciseCategoryId, description: 'Isolation exercise for chest' },
  { name: 'Dips', categoryId: 'chest' as ExerciseCategoryId, description: 'Chest and triceps compound movement' },

  // Back exercises
  { name: 'Pull-Ups', categoryId: 'back' as ExerciseCategoryId, description: 'Bodyweight back exercise' },
  { name: 'Barbell Rows', categoryId: 'back' as ExerciseCategoryId, description: 'Compound back builder' },
  { name: 'Lat Pulldowns', categoryId: 'back' as ExerciseCategoryId, description: 'Machine exercise for lats' },
  { name: 'Deadlift', categoryId: 'back' as ExerciseCategoryId, description: 'Full body compound movement' },
  { name: 'Seated Cable Row', categoryId: 'back' as ExerciseCategoryId, description: 'Machine rowing exercise' },

  // Legs exercises
  { name: 'Squats', categoryId: 'legs' as ExerciseCategoryId, description: 'King of leg exercises' },
  { name: 'Leg Press', categoryId: 'legs' as ExerciseCategoryId, description: 'Machine leg exercise' },
  { name: 'Lunges', categoryId: 'legs' as ExerciseCategoryId, description: 'Unilateral leg exercise' },
  { name: 'Leg Curls', categoryId: 'legs' as ExerciseCategoryId, description: 'Hamstring isolation' },
  { name: 'Calf Raises', categoryId: 'legs' as ExerciseCategoryId, description: 'Calf development' },

  // Shoulders exercises
  { name: 'Overhead Press', categoryId: 'shoulders' as ExerciseCategoryId, description: 'Compound shoulder builder' },
  { name: 'Lateral Raises', categoryId: 'shoulders' as ExerciseCategoryId, description: 'Side delt isolation' },
  { name: 'Front Raises', categoryId: 'shoulders' as ExerciseCategoryId, description: 'Front delt exercise' },
  { name: 'Face Pulls', categoryId: 'shoulders' as ExerciseCategoryId, description: 'Rear delt and upper back' },
  { name: 'Arnold Press', categoryId: 'shoulders' as ExerciseCategoryId, description: 'Rotational shoulder press' },

  // Biceps exercises
  { name: 'Barbell Curls', categoryId: 'biceps' as ExerciseCategoryId, description: 'Classic biceps builder' },
  { name: 'Hammer Curls', categoryId: 'biceps' as ExerciseCategoryId, description: 'Biceps and brachialis' },
  { name: 'Preacher Curls', categoryId: 'biceps' as ExerciseCategoryId, description: 'Isolated biceps curl' },
  { name: 'Concentration Curls', categoryId: 'biceps' as ExerciseCategoryId, description: 'Peak contraction curl' },
  { name: 'Incline Dumbbell Curls', categoryId: 'biceps' as ExerciseCategoryId, description: 'Stretch-focused curl' },

  // Triceps exercises
  { name: 'Tricep Pushdowns', categoryId: 'triceps' as ExerciseCategoryId, description: 'Cable tricep exercise' },
  { name: 'Skull Crushers', categoryId: 'triceps' as ExerciseCategoryId, description: 'Lying tricep extension' },
  { name: 'Close-Grip Bench Press', categoryId: 'triceps' as ExerciseCategoryId, description: 'Compound tricep movement' },
  { name: 'Overhead Extensions', categoryId: 'triceps' as ExerciseCategoryId, description: 'Long head focus' },
  { name: 'Diamond Push-Ups', categoryId: 'triceps' as ExerciseCategoryId, description: 'Bodyweight tricep exercise' },

  // Abs exercises
  { name: 'Crunches', categoryId: 'abs' as ExerciseCategoryId, description: 'Basic ab exercise' },
  { name: 'Plank', categoryId: 'abs' as ExerciseCategoryId, description: 'Isometric core hold' },
  { name: 'Russian Twists', categoryId: 'abs' as ExerciseCategoryId, description: 'Rotational core exercise' },
  { name: 'Leg Raises', categoryId: 'abs' as ExerciseCategoryId, description: 'Lower ab focus' },
  { name: 'Cable Crunches', categoryId: 'abs' as ExerciseCategoryId, description: 'Weighted ab exercise' },

  // Running exercises
  { name: 'Treadmill Run', categoryId: 'running' as ExerciseCategoryId, description: 'Indoor running' },
  { name: 'Outdoor Run', categoryId: 'running' as ExerciseCategoryId, description: 'Outdoor running' },
  { name: 'Sprint Intervals', categoryId: 'running' as ExerciseCategoryId, description: 'High-intensity running' },
  { name: 'Long Distance Run', categoryId: 'running' as ExerciseCategoryId, description: 'Endurance running' },

  // Cycling exercises
  { name: 'Stationary Bike', categoryId: 'cycling' as ExerciseCategoryId, description: 'Indoor cycling' },
  { name: 'Road Cycling', categoryId: 'cycling' as ExerciseCategoryId, description: 'Outdoor cycling' },
  { name: 'Spin Class', categoryId: 'cycling' as ExerciseCategoryId, description: 'Group cycling workout' },
  { name: 'Mountain Biking', categoryId: 'cycling' as ExerciseCategoryId, description: 'Off-road cycling' },

  // Swimming exercises
  { name: 'Freestyle', categoryId: 'swimming' as ExerciseCategoryId, description: 'Front crawl swimming' },
  { name: 'Breaststroke', categoryId: 'swimming' as ExerciseCategoryId, description: 'Traditional swimming style' },
  { name: 'Backstroke', categoryId: 'swimming' as ExerciseCategoryId, description: 'Back swimming' },
  { name: 'Butterfly', categoryId: 'swimming' as ExerciseCategoryId, description: 'Advanced swimming style' },

  // Elliptical exercises
  { name: 'Elliptical Workout', categoryId: 'elliptical' as ExerciseCategoryId, description: 'Low-impact cardio' },
  { name: 'Elliptical Intervals', categoryId: 'elliptical' as ExerciseCategoryId, description: 'HIIT on elliptical' },

  // Rowing exercises
  { name: 'Rowing Machine', categoryId: 'rowing' as ExerciseCategoryId, description: 'Indoor rowing' },
  { name: 'Concept2 Row', categoryId: 'rowing' as ExerciseCategoryId, description: 'Standard rowing workout' },

  // Jumping exercises
  { name: 'Jump Rope', categoryId: 'jumping' as ExerciseCategoryId, description: 'Skipping rope' },
  { name: 'Box Jumps', categoryId: 'jumping' as ExerciseCategoryId, description: 'Plyometric jumps' },
  { name: 'Burpees', categoryId: 'jumping' as ExerciseCategoryId, description: 'Full body jump exercise' },

  // Standing poses
  { name: 'Mountain Pose (Tadasana)', categoryId: 'standing_poses' as ExerciseCategoryId, description: 'Foundation pose' },
  { name: 'Warrior I (Virabhadrasana I)', categoryId: 'standing_poses' as ExerciseCategoryId, description: 'Standing strength pose' },
  { name: 'Warrior II (Virabhadrasana II)', categoryId: 'standing_poses' as ExerciseCategoryId, description: 'Hip opening pose' },
  { name: 'Triangle Pose (Trikonasana)', categoryId: 'standing_poses' as ExerciseCategoryId, description: 'Side stretch pose' },

  // Balances
  { name: 'Tree Pose (Vrksasana)', categoryId: 'balances' as ExerciseCategoryId, description: 'Standing balance' },
  { name: 'Eagle Pose (Garudasana)', categoryId: 'balances' as ExerciseCategoryId, description: 'Wrapped balance' },
  { name: 'Warrior III (Virabhadrasana III)', categoryId: 'balances' as ExerciseCategoryId, description: 'Forward balance' },

  // Seated poses
  { name: 'Staff Pose (Dandasana)', categoryId: 'seated_poses' as ExerciseCategoryId, description: 'Foundation seated pose' },
  { name: 'Seated Forward Bend (Paschimottanasana)', categoryId: 'seated_poses' as ExerciseCategoryId, description: 'Hamstring stretch' },
  { name: 'Butterfly Pose (Baddha Konasana)', categoryId: 'seated_poses' as ExerciseCategoryId, description: 'Hip opener' },

  // Twists
  { name: 'Seated Spinal Twist (Ardha Matsyendrasana)', categoryId: 'twists' as ExerciseCategoryId, description: 'Seated twist' },
  { name: 'Revolved Triangle (Parivrtta Trikonasana)', categoryId: 'twists' as ExerciseCategoryId, description: 'Standing twist' },
  { name: 'Supine Twist (Supta Matsyendrasana)', categoryId: 'twists' as ExerciseCategoryId, description: 'Lying twist' },

  // Backbends
  { name: 'Cobra Pose (Bhujangasana)', categoryId: 'backbends' as ExerciseCategoryId, description: 'Gentle backbend' },
  { name: 'Upward Dog (Urdhva Mukha Svanasana)', categoryId: 'backbends' as ExerciseCategoryId, description: 'Full backbend' },
  { name: 'Bridge Pose (Setu Bandhasana)', categoryId: 'backbends' as ExerciseCategoryId, description: 'Supported backbend' },
  { name: 'Wheel Pose (Urdhva Dhanurasana)', categoryId: 'backbends' as ExerciseCategoryId, description: 'Full wheel backbend' },

  // Inversions
  { name: 'Downward Dog (Adho Mukha Svanasana)', categoryId: 'inversions' as ExerciseCategoryId, description: 'Foundational inversion' },
  { name: 'Shoulder Stand (Sarvangasana)', categoryId: 'inversions' as ExerciseCategoryId, description: 'Supported inversion' },
  { name: 'Headstand (Sirsasana)', categoryId: 'inversions' as ExerciseCategoryId, description: 'Advanced inversion' },
  { name: 'Plow Pose (Halasana)', categoryId: 'inversions' as ExerciseCategoryId, description: 'Forward inversion' },
]
