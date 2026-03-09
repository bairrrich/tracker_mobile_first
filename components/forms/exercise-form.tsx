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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { exercisesRepository, exerciseCategoriesRepository } from '@/lib/repositories/exercises-repository'
import { WORKOUT_TYPES, type WorkoutTypeId, type ExerciseCategoryId } from '@/lib/static-exercise-data'
import type { Exercise } from '@/lib/db'

interface ExerciseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editExercise?: Exercise | null
}

export function ExerciseForm({ open, onOpenChange, editExercise }: ExerciseFormProps) {
  const t = useTranslations('Exercises')
  const tCommon = useTranslations('Common')

  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [selectedWorkoutType, setSelectedWorkoutType] = React.useState<WorkoutTypeId>('strength')
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [categories, setCategories] = React.useState<Array<{ id: ExerciseCategoryId; name: string; workoutTypeId: WorkoutTypeId }>>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  // Load categories when workout type changes or form opens
  React.useEffect(() => {
    if (open) {
      loadCategories()
      if (editExercise) {
        // Load exercise data for editing
        setName(editExercise.name)
        setDescription(editExercise.description || '')
        // Will set category after loading categories
      } else {
        // Reset form for new exercise
        resetForm()
      }
    }
  }, [open, editExercise])

  // Set category when editing
  React.useEffect(() => {
    if (editExercise && categories.length > 0) {
      setSelectedCategory(editExercise.categoryId)
      // Find workout type from category
      const category = categories.find(c => c.id === editExercise.categoryId)
      if (category) {
        setSelectedWorkoutType(category.workoutTypeId)
      }
    }
  }, [editExercise, categories])

  const loadCategories = async () => {
    const allCategories = await exerciseCategoriesRepository.getAll()
    setCategories(allCategories.map(c => ({ id: c.id, name: c.name, workoutTypeId: c.workoutTypeId })))
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedWorkoutType('strength')
    setSelectedCategory('' as ExerciseCategoryId)
  }

  const filteredCategories = categories.filter(
    c => c.workoutTypeId === selectedWorkoutType
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !selectedCategory) {
      return
    }

    setIsSubmitting(true)
    try {
      if (editExercise) {
        // Update existing exercise
        await exercisesRepository.update(editExercise.id, {
          name: name.trim(),
          description: description.trim(),
          categoryId: selectedCategory as ExerciseCategoryId,
        })
      } else {
        // Create new exercise
        await exercisesRepository.create({
          name: name.trim(),
          description: description.trim(),
          categoryId: selectedCategory as ExerciseCategoryId,
          isDefault: false,
        })
      }

      // Close form and reset
      resetForm()
      onOpenChange(false)

      // Reload exercises page (custom event)
      window.dispatchEvent(new CustomEvent('exercises-changed'))
    } catch (error) {
      console.error('Failed to save exercise:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editExercise) return

    setIsSubmitting(true)
    try {
      await exercisesRepository.delete(editExercise.id)
      setShowDeleteDialog(false)
      onOpenChange(false)
      resetForm()

      // Reload exercises page
      window.dispatchEvent(new CustomEvent('exercises-changed'))
    } catch (error) {
      console.error('Failed to delete exercise:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editExercise ? t('editExercise') : t('addExercise')}
            </DialogTitle>
            <DialogDescription>
              {editExercise ? t('editExerciseDescription') : t('addExerciseDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('exerciseName')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('exerciseNamePlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Workout Type */}
            <div className="grid gap-2">
              <Label>{t('workoutType')}</Label>
              <Select
                value={selectedWorkoutType}
                onValueChange={(value) => {
                  setSelectedWorkoutType(value as WorkoutTypeId)
                  setSelectedCategory('')
                }}
                disabled={isSubmitting || !!editExercise}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectWorkoutType')} />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {t(type.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>{t('category')}</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={isSubmitting || filteredCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            {editExercise && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting}
              >
                {tCommon('delete')}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  onOpenChange(false)
                }}
                disabled={isSubmitting}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim() || !selectedCategory}>
                {isSubmitting ? tCommon('saving') : editExercise ? tCommon('save') : tCommon('add')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteExercise')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteExerciseDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? tCommon('deleting') : tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
