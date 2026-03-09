'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Dumbbell, Activity, Heart, Trash2 } from 'lucide-react'
import { workoutsRepository, workoutExercisesRepository, workoutSetsRepository } from '@/lib/repositories/workouts-repository'
import { exercisesRepository } from '@/lib/repositories/exercises-repository'
import type { Workout } from '@/lib/db'

interface WorkoutDetailsProps {
  workout: Workout | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: () => void
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

export function WorkoutDetails({ workout, open, onOpenChange, onDelete }: WorkoutDetailsProps) {
  const t = useTranslations('Workouts')
  const tCommon = useTranslations('Common')
  const [workoutExercises, setWorkoutExercises] = React.useState<Array<any>>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (open && workout) {
      loadWorkoutDetails()
    }
  }, [open, workout])

  const loadWorkoutDetails = async () => {
    if (!workout) return
    setIsLoading(true)
    try {
      const weList = await workoutExercisesRepository.getByWorkout(workout.id)
      const weWithDetails = await Promise.all(
        weList.map(async (we) => {
          const exercise = await exercisesRepository.getById(we.exerciseId)
          const sets = await workoutSetsRepository.getByWorkoutExercise(we.id)
          return { ...we, exercise, sets }
        })
      )
      setWorkoutExercises(weWithDetails)
    } catch (error) {
      console.error('Failed to load workout details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleDelete = async () => {
    if (!workout) return
    await workoutsRepository.delete(workout.id)
    onOpenChange(false)
    if (onDelete) {
      onDelete()
    }
  }

  if (!workout) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${WORKOUT_TYPE_COLORS[workout.workoutTypeId]}`}>
                {WORKOUT_TYPE_ICONS[workout.workoutTypeId]}
              </div>
              <div>
                <DialogTitle className="capitalize">
                  {t(workout.workoutTypeId)}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(workout.date)}
                </div>
              </div>
            </div>
            <Badge variant="outline" className={WORKOUT_TYPE_COLORS[workout.workoutTypeId]}>
              {t(workout.workoutTypeId)}
            </Badge>
          </div>
        </DialogHeader>

        {/* Stats */}
        {workout.durationSeconds && (
          <div className="flex items-center gap-2 p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{t('duration')}</p>
              <p className="text-lg font-semibold">{formatTime(workout.durationSeconds)}</p>
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-4 py-4">
          <h3 className="font-semibold text-lg">{t('exercises')}</h3>
          
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
          ) : workoutExercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No exercises added</p>
          ) : (
            <div className="space-y-3">
              {workoutExercises.map((we) => (
                <div key={we.id} className="border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{we.exercise?.name || 'Unknown Exercise'}</h4>
                      {we.exercise?.description && (
                        <p className="text-sm text-muted-foreground">{we.exercise.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Sets */}
                  {we.sets && we.sets.length > 0 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-10 gap-2 text-sm font-medium text-muted-foreground">
                        <div className="col-span-2">{t('sets')}</div>
                        {workout.workoutTypeId === 'strength' ? (
                          <>
                            <div className="col-span-4">{t('weight')}</div>
                            <div className="col-span-4">{t('reps')}</div>
                          </>
                        ) : (
                          <div className="col-span-8">{t('duration')}</div>
                        )}
                      </div>
                      {we.sets.map((set: any, index: number) => (
                        <div key={set.id} className="grid grid-cols-10 gap-2 text-sm">
                          <div className="col-span-2 font-medium">{index + 1}</div>
                          {workout.workoutTypeId === 'strength' ? (
                            <>
                              <div className="col-span-4">{set.weight ? `${set.weight} kg` : '-'}</div>
                              <div className="col-span-4">{set.reps ? `${set.reps} reps` : '-'}</div>
                            </>
                          ) : (
                            <div className="col-span-8">{set.durationSeconds ? `${set.durationSeconds}s` : '-'}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {workout.notes && (
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="font-semibold mb-2">{t('notes')}</h3>
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </div>
        )}

        {/* Delete Button */}
        <DialogFooter className="border-t border-[var(--border)] pt-4">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            {tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
