'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Calendar, Clock, Dumbbell, Activity, Heart } from 'lucide-react'
import { workoutsRepository } from '@/lib/repositories/workouts-repository'
import type { Workout } from '@/lib/db'

const WORKOUT_TYPE_ICONS: Record<string, React.ReactNode> = {
  strength: <Dumbbell className="w-4 h-4" />,
  cardio: <Activity className="w-4 h-4" />,
  yoga: <Heart className="w-4 h-4" />,
}

const WORKOUT_TYPE_COLORS: Record<string, string> = {
  strength: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  cardio: 'bg-red-500/10 text-red-600 dark:text-red-400',
  yoga: 'bg-green-500/10 text-green-600 dark:text-green-400',
}

export default function WorkoutsPage() {
  const t = useTranslations('Workouts')
  const [workouts, setWorkouts] = React.useState<Workout[]>([])
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)

  // Load data on mount
  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const workoutsData = await workoutsRepository.getActive()
      setWorkouts(workoutsData)
    } catch (error) {
      console.error('Failed to load workouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter workouts
  const filteredWorkouts = React.useMemo(() => {
    return workouts.filter((workout) => {
      // Type filter
      if (selectedType !== 'all' && workout.workoutTypeId !== selectedType) {
        return false
      }

      // Search filter (by notes)
      if (searchQuery && workout.notes) {
        const query = searchQuery.toLowerCase()
        return workout.notes.toLowerCase().includes(query)
      }

      return true
    })
  }, [workouts, selectedType, searchQuery])

  const getWorkoutTypeName = (typeId: string) => {
    const names: Record<string, string> = {
      strength: t('strength'),
      cardio: t('cardio'),
      yoga: t('yoga'),
    }
    return names[typeId] || typeId
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return t('noDuration')
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <Button onClick={() => {
            // TODO: Start new workout
            console.log('Start new workout')
          }}>
            <Plus className="w-4 h-4 mr-2" />
            {t('startWorkout')}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchWorkouts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="strength">{t('strength')}</SelectItem>
                <SelectItem value="cardio">{t('cardio')}</SelectItem>
                <SelectItem value="yoga">{t('yoga')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Workouts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="empty-state-icon text-6xl mb-4">📝</div>
            <h3 className="empty-state-title text-xl font-semibold mb-2">
              {t('noWorkoutsFound')}
            </h3>
            <p className="empty-state-description text-muted-foreground max-w-md mx-auto mb-4">
              {searchQuery || selectedType !== 'all'
                ? t('adjustFilters')
                : t('startFirstWorkout')}
            </p>
            {!searchQuery && selectedType === 'all' && (
              <Button onClick={() => {
                // TODO: Start new workout
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {t('startWorkout')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkouts.map((workout) => {
              const icon = WORKOUT_TYPE_ICONS[workout.workoutTypeId]
              const color = WORKOUT_TYPE_COLORS[workout.workoutTypeId]

              return (
                <div
                  key={workout.id}
                  className="group p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    // TODO: View workout details
                    console.log('View workout:', workout.id)
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={color}>
                          {getWorkoutTypeName(workout.workoutTypeId)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(workout.date)}
                        </span>
                      </div>

                      {/* Duration and notes */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {workout.durationSeconds && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(workout.durationSeconds)}
                          </span>
                        )}
                        {workout.notes && (
                          <p className="text-sm text-muted-foreground truncate">
                            {workout.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
