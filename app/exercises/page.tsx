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
import { Search, Plus, Dumbbell, Activity, Heart } from 'lucide-react'
import { ExerciseForm } from '@/components/forms/exercise-form'
import { exercisesRepository, exerciseCategoriesRepository } from '@/lib/repositories/exercises-repository'
import { WORKOUT_TYPES } from '@/lib/static-exercise-data'
import Link from 'next/link'
import type { Exercise, ExerciseCategory, WorkoutTypeEntity } from '@/lib/db'

type WorkoutType = 'strength' | 'cardio' | 'yoga' | 'all'

const WORKOUT_TYPE_ICONS: Record<string, React.ReactNode> = {
  strength: <Dumbbell className="w-4 h-4" />,
  cardio: <Activity className="w-4 h-4" />,
  yoga: <Heart className="w-4 h-4" />,
}

export default function ExercisesPage() {
  const t = useTranslations('Exercises')
  const [exercises, setExercises] = React.useState<Exercise[]>([])
  const [categories, setCategories] = React.useState<ExerciseCategory[]>([])
  const [workoutTypes, setWorkoutTypes] = React.useState<WorkoutTypeEntity[]>([])
  const [selectedType, setSelectedType] = React.useState<WorkoutType>('all')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editExercise, setEditExercise] = React.useState<Exercise | null>(null)

  // Listen for exercises changes
  React.useEffect(() => {
    const handleExercisesChanged = () => loadData()
    window.addEventListener('exercises-changed', handleExercisesChanged)
    return () => window.removeEventListener('exercises-changed', handleExercisesChanged)
  }, [])

  // Load data on mount
  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [exercisesData, categoriesData] = await Promise.all([
        exercisesRepository.getActive(),
        exerciseCategoriesRepository.getAll(),
      ])
      setExercises(exercisesData)
      setCategories(categoriesData)
      setWorkoutTypes(WORKOUT_TYPES)
    } catch (error) {
      console.error('Failed to load exercises:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter exercises based on selected type, category, and search
  const filteredExercises = React.useMemo(() => {
    return exercises.filter((exercise) => {
      // Type filter
      if (selectedType !== 'all') {
        const category = categories.find(c => c.id === exercise.categoryId)
        if (category?.workoutTypeId !== selectedType) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && exercise.categoryId !== selectedCategory) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          exercise.name.toLowerCase().includes(query) ||
          (exercise.description && exercise.description.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [exercises, categories, selectedType, selectedCategory, searchQuery])

  // Get categories for selected type
  const availableCategories = React.useMemo(() => {
    if (selectedType === 'all') {
      return categories
    }
    return categories.filter(c => c.workoutTypeId === selectedType)
  }, [categories, selectedType])

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

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/workouts">
                <Dumbbell className="w-4 h-4 mr-2" />
                {t('workouts')}
              </Link>
            </Button>
            <Button onClick={() => {
              setEditExercise(null)
              setIsFormOpen(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('addExercise')}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchExercises')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Workout Type Filter */}
            <Select value={selectedType} onValueChange={(value) => {
              setSelectedType(value as WorkoutType)
              setSelectedCategory('all')
            }}>
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

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('filterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Exercises List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="empty-state-icon text-6xl mb-4">🏋️</div>
            <h3 className="empty-state-title text-xl font-semibold mb-2">
              {t('noExercisesFound')}
            </h3>
            <p className="empty-state-description text-muted-foreground max-w-md mx-auto mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? t('adjustFilters')
                : t('createFirstExercise')}
            </p>
            {!searchQuery && selectedCategory === 'all' && selectedType === 'all' && (
              <Button onClick={() => {
                setEditExercise(null)
                setIsFormOpen(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addExercise')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => {
              const category = categories.find(c => c.id === exercise.categoryId)
              const workoutType = workoutTypes.find(wt => wt.id === category?.workoutTypeId)

              return (
                <div
                  key={exercise.id}
                  className="group p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setEditExercise(exercise)
                    setIsFormOpen(true)
                  }}
                >
                  {/* Header with icon and name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 text-2xl">
                      {WORKOUT_TYPE_ICONS[workoutType?.id || 'strength']}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {exercise.name}
                      </h3>
                      {category && (
                        <p className="text-sm text-muted-foreground">
                          {category.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {exercise.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {workoutType && (
                      <Badge variant="outline" className="text-xs">
                        {WORKOUT_TYPE_ICONS[workoutType.id]}
                        <span className="ml-1">{workoutType.name}</span>
                      </Badge>
                    )}
                    {category && (
                      <Badge variant="secondary" className="text-xs">
                        {category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Exercise Form */}
      <ExerciseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editExercise={editExercise}
      />
    </MainLayout>
  )
}
