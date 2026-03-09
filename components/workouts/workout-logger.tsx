'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, CheckCircle, Timer, Dumbbell, Activity, Heart } from 'lucide-react'
import { workoutsRepository, workoutExercisesRepository, workoutSetsRepository } from '@/lib/repositories/workouts-repository'
import { exercisesRepository, exerciseCategoriesRepository } from '@/lib/repositories/exercises-repository'
import type { Workout, Exercise, WorkoutExercise, WorkoutSet } from '@/lib/db'

interface WorkoutLoggerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workoutType: 'strength' | 'cardio' | 'yoga'
  onComplete?: (workoutId: string) => void
}

const WORKOUT_TYPE_ICONS: Record<string, React.ReactNode> = {
  strength: <Dumbbell className="w-5 h-5" />,
  cardio: <Activity className="w-5 h-5" />,
  yoga: <Heart className="w-5 h-5" />,
}

const WORKOUT_TYPE_COLORS: Record<string, string> = {
  strength: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  cardio: 'bg-red-500/10 text-red-600 dark:text-red-400',
  yoga: 'bg-green-500/10 text-green-600 dark:text-green-400',
}

export function WorkoutLogger({ open, onOpenChange, workoutType, onComplete }: WorkoutLoggerProps) {
  const t = useTranslations('WorkoutLogger')
  const tCommon = useTranslations('Common')
  
  const [workout, setWorkout] = React.useState<Workout | null>(null)
  const [exercises, setExercises] = React.useState<Exercise[]>([])
  const [workoutExercises, setWorkoutExercises] = React.useState<Array<WorkoutExercise & { exercise: Exercise }>>([])
  const [selectedExerciseId, setSelectedExerciseId] = React.useState('')
  const [elapsedTime, setElapsedTime] = React.useState(0)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isCompleting, setIsCompleting] = React.useState(false)

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && open) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, open])

  // Load exercises on open
  React.useEffect(() => {
    if (open) {
      loadExercises()
      startNewWorkout()
    } else {
      // Reset state when closing
      setWorkout(null)
      setWorkoutExercises([])
      setElapsedTime(0)
      setIsRunning(false)
    }
  }, [open, workoutType])

  const loadExercises = async () => {
    const allExercises = await exercisesRepository.getActive()
    const categories = await exerciseCategoriesRepository.getAll()
    const categoryIds = categories
      .filter(c => c.workoutTypeId === workoutType)
      .map(c => c.id)
    
    const filteredExercises = allExercises.filter(e => categoryIds.includes(e.categoryId))
    setExercises(filteredExercises)
  }

  const startNewWorkout = async () => {
    const workoutId = await workoutsRepository.create({
      workoutTypeId: workoutType,
      date: new Date(),
    })
    
    const newWorkout = await workoutsRepository.getById(workoutId)
    if (newWorkout) {
      setWorkout(newWorkout)
      setIsRunning(true)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const addExercise = async () => {
    if (!selectedExerciseId || !workout) return

    const exercise = exercises.find(e => e.id === selectedExerciseId)
    if (!exercise) return

    const workoutExerciseId = await workoutExercisesRepository.addToWorkout(
      workout.id,
      exercise.id,
      workoutExercises.length
    )

    const newWorkoutExercise = await workoutExercisesRepository.getById(workoutExerciseId)
    if (newWorkoutExercise) {
      setWorkoutExercises(prev => [...prev, { ...newWorkoutExercise, exercise }])
    }
    
    setSelectedExerciseId('')
  }

  const addSet = async (workoutExerciseId: string) => {
    if (!workout) return

    const existingSets = await workoutSetsRepository.getByWorkoutExercise(workoutExerciseId)
    const nextSetNumber = existingSets.length + 1

    await workoutSetsRepository.add(workoutExerciseId, nextSetNumber)
    
    // Reload workout exercises to get updated sets
    reloadWorkoutExercises()
  }

  const updateSet = async (setId: string, data: { reps?: number; weight?: number }) => {
    await workoutSetsRepository.update(setId, data)
  }

  const removeExercise = async (workoutExerciseId: string) => {
    await workoutExercisesRepository.delete(workoutExerciseId)
    setWorkoutExercises(prev => prev.filter(we => we.id !== workoutExerciseId))
  }

  const reloadWorkoutExercises = async () => {
    if (!workout) return

    const weList = await workoutExercisesRepository.getByWorkout(workout.id)
    const weWithExercises = await Promise.all(
      weList.map(async (we) => {
        const exercise = await exercisesRepository.getById(we.exerciseId)
        return { ...we, exercise: exercise! }
      })
    )
    setWorkoutExercises(weWithExercises)
  }

  const completeWorkout = async () => {
    if (!workout) return

    setIsCompleting(true)
    try {
      // Update workout duration
      await workoutsRepository.update(workout.id, {
        durationSeconds: elapsedTime,
      })

      // Mark as synced
      await workoutsRepository.markAsSynced(workout.id)
      
      // Reload to get updated workout
      const updatedWorkout = await workoutsRepository.getById(workout.id)
      
      onOpenChange(false)
      if (onComplete && updatedWorkout) {
        onComplete(updatedWorkout.id)
      }
    } catch (error) {
      console.error('Failed to complete workout:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${WORKOUT_TYPE_COLORS[workoutType]}`}>
              {WORKOUT_TYPE_ICONS[workoutType]}
            </div>
            <div>
              <DialogTitle>{t('activeWorkout')}</DialogTitle>
              <DialogDescription>
                {t('trackingWorkout')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 py-4 bg-[var(--card)] rounded-lg">
          <Timer className={`w-6 h-6 ${isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-3xl font-mono font-bold">{formatTime(elapsedTime)}</span>
        </div>

        {/* Add Exercise */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>{t('addExercise')}</Label>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectExercise')} />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addExercise} disabled={!selectedExerciseId}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Workout Exercises */}
        <div className="space-y-4 py-4">
          {workoutExercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('noExercisesAdded')}
            </p>
          ) : (
            workoutExercises.map((we) => (
              <WorkoutExerciseCard
                key={we.id}
                workoutExercise={we}
                workoutType={workoutType}
                onAddSet={() => addSet(we.id)}
                onUpdateSet={updateSet}
                onRemove={() => removeExercise(we.id)}
              />
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsRunning(false)
              onOpenChange(false)
            }}
            disabled={isCompleting}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={completeWorkout}
            disabled={isCompleting || workoutExercises.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isCompleting ? tCommon('saving') : t('completeWorkout')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Workout Exercise Card Component
// ============================================

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise & { exercise: Exercise }
  workoutType: string
  onAddSet: () => void
  onUpdateSet: (setId: string, data: { reps?: number; weight?: number }) => void
  onRemove: () => void
}

function WorkoutExerciseCard({
  workoutExercise,
  workoutType,
  onAddSet,
  onUpdateSet,
  onRemove,
}: WorkoutExerciseCardProps) {
  const t = useTranslations('WorkoutLogger')
  const [sets, setSets] = React.useState<WorkoutSet[]>([])

  React.useEffect(() => {
    loadSets()
  }, [workoutExercise.id])

  const loadSets = async () => {
    const workoutSets = await workoutSetsRepository.getByWorkoutExercise(workoutExercise.id)
    setSets(workoutSets)
  }

  const handleUpdateSet = async (setId: string, field: 'reps' | 'weight' | 'durationSeconds', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    await onUpdateSet(setId, { [field]: numValue })
    loadSets()
  }

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold">{workoutExercise.exercise.name}</h4>
          {workoutExercise.exercise.description && (
            <p className="text-sm text-muted-foreground">{workoutExercise.exercise.description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Sets Header */}
      <div className="grid grid-cols-10 gap-2 mb-2 text-sm font-medium text-muted-foreground">
        <div className="col-span-1">{t('set')}</div>
        {workoutType === 'strength' && (
          <>
            <div className="col-span-3">{t('weight')}</div>
            <div className="col-span-3">{t('reps')}</div>
          </>
        )}
        {(workoutType === 'cardio' || workoutType === 'yoga') && (
          <div className="col-span-6">{t('duration')}</div>
        )}
        <div className="col-span-2"></div>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-10 gap-2 items-center">
            <div className="col-span-1 text-sm font-medium">{index + 1}</div>
            {workoutType === 'strength' && (
              <>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="0"
                    value={set.weight?.toString() || ''}
                    onChange={(e) => handleUpdateSet(set.id, 'weight', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="0"
                    value={set.reps?.toString() || ''}
                    onChange={(e) => handleUpdateSet(set.id, 'reps', e.target.value)}
                    className="h-9"
                  />
                </div>
              </>
            )}
            {(workoutType === 'cardio' || workoutType === 'yoga') && (
              <div className="col-span-6">
                <Input
                  type="number"
                  placeholder={t('seconds')}
                  value={set.durationSeconds?.toString() || ''}
                  onChange={(e) => handleUpdateSet(set.id, 'durationSeconds', e.target.value)}
                  className="h-9"
                />
              </div>
            )}
            <div className="col-span-2">
              <Button
                variant={set.completed ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  workoutSetsRepository.update(set.id, { completed: !set.completed })
                  loadSets()
                }}
                className="w-full"
              >
                {set.completed ? <CheckCircle className="w-4 h-4" /> : t('mark')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddSet}
        className="w-full mt-3"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('addSet')}
      </Button>
    </div>
  )
}
