# Exercises Feature Specification

## Overview

The Exercises feature allows users to track workouts across three types: **Strength**, **Cardio**, and **Yoga**. Each type has specific categories and tracking metrics.

## User Stories

### US-1: Browse Exercises by Type
- As a user, I want to browse exercises filtered by workout type (Strength/Cardio/Yoga)
- So that I can find exercises relevant to my training

### US-2: Create Custom Exercises
- As a user, I want to create custom exercises with specific categories
- So that I can track exercises not in the default library

### US-3: Log Workout Sessions
- As a user, I want to log completed workouts with exercise details
- So that I can track my progress over time

### US-4: Track Strength Training
- As a user, I want to log sets, reps, and weight for strength exercises
- So that I can track my strength progression

### US-5: Track Cardio Sessions
- As a user, I want to log duration and distance for cardio exercises
- So that I can track my endurance improvement

### US-6: Track Yoga Practice
- As a user, I want to log duration and poses for yoga sessions
- So that I can track my flexibility practice

## Database Schema

### Tables (snake_case, all use UUID for IDs)

```sql
-- Workout types (strength, cardio, yoga)
CREATE TABLE workout_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT
);

-- Exercise categories (linked to workout types)
CREATE TABLE exercise_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  workout_type_id TEXT REFERENCES workout_types(id),
  created_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT
);

-- Exercises library
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES exercise_categories(id),
  is_default INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT
);

-- Workout sessions
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  workout_type_id TEXT REFERENCES workout_types(id),
  date TEXT NOT NULL,
  duration_seconds INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT
);

-- Workout exercises (exercises in a workout)
CREATE TABLE workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT REFERENCES workouts(id),
  exercise_id TEXT REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT
);

-- Sets for strength exercises
CREATE TABLE workout_sets (
  id TEXT PRIMARY KEY,
  workout_exercise_id TEXT REFERENCES workout_exercises(id),
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight REAL,
  duration_seconds INTEGER, -- for timed sets
  completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  deleted_at TEXT
);
```

### IndexedDB Schema (Dexie)

```typescript
this.version(9).stores({
  workoutTypes: 'id, name, createdAt, synced, deleted',
  exerciseCategories: 'id, name, workoutTypeId, createdAt, synced, deleted',
  exercises: 'id, name, categoryId, isDefault, createdAt, updatedAt, synced, deleted',
  workouts: 'id, workoutTypeId, date, createdAt, updatedAt, synced, deleted',
  workoutExercises: 'id, workoutId, exerciseId, orderIndex, synced, deleted',
  workoutSets: 'id, workoutExerciseId, setNumber, completed, synced, deleted',
})
```

## API Endpoints

### Exercises
- `GET /api/exercises` - List all exercises (filter by category, workout_type)
- `POST /api/exercises` - Create new exercise
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Soft delete exercise

### Workouts
- `GET /api/workouts` - List user's workouts (filter by date, type)
- `POST /api/workouts` - Create new workout session
- `GET /api/workouts/:id` - Get workout details with exercises
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Soft delete workout

### Sync
- `POST /api/sync` - Existing endpoint, extended for exercise tables

## UI Components

### Pages
1. `/exercises` - Exercise library browser
2. `/exercises/new` - Create new exercise
3. `/workouts` - Workout history
4. `/workouts/new` - Start new workout session
5. `/workouts/:id` - Workout details and results

### Components
1. `WorkoutTypeSelector` - Tabs for Strength/Cardio/Yoga
2. `ExerciseBrowser` - Filterable exercise list
3. `ExerciseCard` - Exercise display with details
4. `WorkoutLogger` - Active workout tracking interface
5. `SetTracker` - Strength set/rep/weight input
6. `CardioTracker` - Duration/distance input
7. `YogaTracker` - Pose duration tracker
8. `WorkoutHistory` - Past workouts list
9. `ProgressChart` - Progress visualization

## Sync Integration

### Tables with `synced` field:
- All exercise-related tables support offline-first sync
- Use tombstone pattern for soft deletes
- Changes queued in `syncQueue` table

### Repositories:
- `WorkoutTypesRepository`
- `ExerciseCategoriesRepository`
- `ExercisesRepository`
- `WorkoutsRepository`
- `WorkoutExercisesRepository`
- `WorkoutSetsRepository`

## Type Definitions

```typescript
type WorkoutType = 'strength' | 'cardio' | 'yoga'

interface WorkoutType {
  id: string
  name: string
  createdAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

interface ExerciseCategory {
  id: string
  name: string
  workoutTypeId: string
  createdAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

interface Exercise {
  id: string
  name: string
  description?: string
  categoryId: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

interface Workout {
  id: string
  workoutTypeId: string
  date: Date
  durationSeconds?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

interface WorkoutExercise {
  id: string
  workoutId: string
  exerciseId: string
  orderIndex: number
  createdAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}

interface WorkoutSet {
  id: string
  workoutExerciseId: string
  setNumber: number
  reps?: number
  weight?: number
  durationSeconds?: number
  completed: boolean
  createdAt: Date
  synced: boolean
  deleted?: boolean
  deletedAt?: Date
}
```

## Default Data

### Workout Types
- strength (Силовая)
- cardio (Кардио)
- yoga (Йога)

### Categories - Strength
- chest (Грудь)
- back (Спина)
- legs (Ноги)
- shoulders (Плечи)
- biceps (Бицепс)
- triceps (Трицепс)
- abs (Пресс)

### Categories - Cardio
- running (Бег)
- cycling (Велоспорт)
- swimming (Плавание)
- elliptical (Эллипс)
- rowing (Гребля)
- jumping (Прыжки)

### Categories - Yoga
- standing_poses (Асаны стоя)
- balances (Балансы)
- seated_poses (Сидячие асаны)
- twists (Скрутки)
- backbends (Прогибы)
- inversions (Перевернутые позы)

## Implementation Priority

1. Database schema + repositories
2. Exercise browser UI
3. Workout logging UI
4. Sync integration
5. Progress tracking
6. Gamification features
