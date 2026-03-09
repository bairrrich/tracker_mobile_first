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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { FormField } from '@/components/forms/form-field'
import { useBooksStore } from '@/store/books-store'
import { bookSchema, type BookFormData } from '@/lib/validations/book.schema'
import { useForm } from '@/hooks/use-form'
import type { BookStatus, BookFormat } from '@/lib/db'
import { Star } from 'lucide-react'

interface BookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editBook?: BookFormData & { id?: string } | null
}

const bookStatuses: { value: BookStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
]

const bookFormats: { value: BookFormat; label: string }[] = [
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'paperback', label: 'Paperback' },
  { value: 'ebook', label: 'E-book' },
  { value: 'audiobook', label: 'Audiobook' },
]

export function BookForm({ open, onOpenChange, editBook }: BookFormProps) {
  const t = useTranslations('Books')
  const { addBook, updateBook } = useBooksStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset, setErrors } = useForm<BookFormData>({
    schema: bookSchema,
    defaultValues: {
      title: '',
      author: '',
      description: '',
      coverImage: '',
      status: 'planned',
      rating: undefined,
      pagesTotal: undefined,
      pagesRead: 0,
      startDate: '',
      endDate: '',
      genre: '',
      isbn: '',
      publisher: '',
      publishYear: new Date().getFullYear(),
      language: '',
      format: undefined,
      notes: '',
      collectionId: undefined,
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      try {
        const bookData: any = {
          ...data,
          pagesTotal: data.pagesTotal ? Number(data.pagesTotal) : undefined,
          pagesRead: data.pagesRead ? Number(data.pagesRead) : 0,
          publishYear: data.publishYear ? Number(data.publishYear) : undefined,
          rating: data.rating ? Number(data.rating) : undefined,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          collectionId: undefined,  // Ensure collectionId is not sent
        }

        // Remove empty strings
        Object.keys(bookData).forEach((key) => {
          if (bookData[key] === '' || bookData[key] === undefined) {
            delete bookData[key]
          }
        })

        if (editBook?.id) {
          await updateBook(editBook.id, bookData)
        } else {
          await addBook(bookData)
        }
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to save book:', error)
        setErrors({ title: 'Failed to save book' })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Reset form when dialog opens/closes or edit mode changes
  React.useEffect(() => {
    if (!open) {
      reset()
      setIsSubmitting(false)
    } else if (editBook) {
      // Populate form with edit data
      Object.keys(editBook).forEach((key) => {
        const k = key as keyof BookFormData
        if (editBook[k] !== undefined) {
          setValue(k, editBook[k])
        }
      })
    }
  }, [open, reset, editBook, setValue])

  const isEdit = !!editBook?.id

  // Calculate reading progress
  const progress = values.pagesTotal && values.pagesTotal > 0
    ? Math.round(((values.pagesRead || 0) / values.pagesTotal) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t('editBook') : t('addBook')}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t('updateProgress')
                : t('createFirstBook')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <FormField
              label={t('title')}
              error={errors.title}
              id="title"
            >
              <Input
                id="title"
                placeholder="Book title"
                value={values.title}
                onChange={(e) => setValue('title', e.target.value)}
                required
              />
            </FormField>

            {/* Author */}
            <FormField
              label={t('author')}
              error={errors.author}
              id="author"
            >
              <Input
                id="author"
                placeholder="Author name"
                value={values.author}
                onChange={(e) => setValue('author', e.target.value)}
                required
              />
            </FormField>

            {/* Status and Format */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('status')}
                error={errors.status}
              >
                <Select
                  value={values.status}
                  onValueChange={(v) => setValue('status', v as BookStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {bookStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {t(s.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label={t('format')}
                error={errors.format}
              >
                <Select
                  value={values.format}
                  onValueChange={(v) => setValue('format', v as BookFormat)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder={t('selectFormat')} />
                  </SelectTrigger>
                  <SelectContent>
                    {bookFormats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {t(f.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Description */}
            <FormField
              label={t('description')}
              error={errors.description}
              id="description"
            >
              <Textarea
                id="description"
                placeholder="Short description..."
                value={values.description || ''}
                onChange={(e) => setValue('description', e.target.value)}
                rows={3}
              />
            </FormField>

            {/* Genre and ISBN */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('genre')}
                error={errors.genre}
                id="genre"
              >
                <Input
                  id="genre"
                  placeholder="Genre"
                  value={values.genre || ''}
                  onChange={(e) => setValue('genre', e.target.value)}
                />
              </FormField>

              <FormField
                label={t('isbn')}
                error={errors.isbn}
                id="isbn"
              >
                <Input
                  id="isbn"
                  placeholder="ISBN"
                  value={values.isbn || ''}
                  onChange={(e) => setValue('isbn', e.target.value)}
                />
              </FormField>
            </div>

            {/* Pages */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('totalPages')}
                error={errors.pagesTotal}
                id="pagesTotal"
              >
                <Input
                  id="pagesTotal"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="0"
                  value={values.pagesTotal || ''}
                  onChange={(e) => setValue('pagesTotal', e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormField>

              <FormField
                label={t('pagesRead')}
                error={errors.pagesRead}
                id="pagesRead"
              >
                <Input
                  id="pagesRead"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={values.pagesRead || 0}
                  onChange={(e) => setValue('pagesRead', e.target.value ? Number(e.target.value) : 0)}
                  disabled={!values.pagesTotal}
                />
              </FormField>
            </div>

            {/* Reading Progress */}
            {values.pagesTotal && values.pagesTotal > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('progress')}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Slider
                  value={[values.pagesRead || 0]}
                  min={0}
                  max={values.pagesTotal}
                  step={1}
                  onValueChange={([v]) => setValue('pagesRead', v)}
                  className="w-full"
                />
              </div>
            )}

            {/* Rating */}
            <FormField
              label={t('rating')}
              error={errors.rating}
            >
              <div className="flex items-center gap-2">
                <Slider
                  id="rating"
                  value={[values.rating || 0]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([v]) => setValue('rating', v)}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 w-20">
                  {values.rating ? (
                    <>
                      <span className="font-medium">{values.rating}</span>
                      <Star className="w-4 h-4 fill-primary text-primary" />
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">No rating</span>
                  )}
                </div>
              </div>
            </FormField>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('startDate')}
                error={errors.startDate}
                id="startDate"
              >
                <Input
                  id="startDate"
                  type="date"
                  value={values.startDate || ''}
                  onChange={(e) => setValue('startDate', e.target.value)}
                />
              </FormField>

              <FormField
                label={t('endDate')}
                error={errors.endDate}
                id="endDate"
              >
                <Input
                  id="endDate"
                  type="date"
                  value={values.endDate || ''}
                  onChange={(e) => setValue('endDate', e.target.value)}
                  disabled={values.status !== 'completed'}
                />
              </FormField>
            </div>

            {/* Publisher and Year */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('publisher')}
                error={errors.publisher}
                id="publisher"
              >
                <Input
                  id="publisher"
                  placeholder="Publisher"
                  value={values.publisher || ''}
                  onChange={(e) => setValue('publisher', e.target.value)}
                />
              </FormField>

              <FormField
                label={t('publishYear')}
                error={errors.publishYear}
                id="publishYear"
              >
                <Input
                  id="publishYear"
                  type="number"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  placeholder={String(new Date().getFullYear())}
                  value={values.publishYear || ''}
                  onChange={(e) => setValue('publishYear', e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormField>
            </div>

            {/* Language */}
            <FormField
              label={t('language')}
              error={errors.language}
              id="language"
            >
              <Input
                id="language"
                placeholder="Language"
                value={values.language || ''}
                onChange={(e) => setValue('language', e.target.value)}
              />
            </FormField>

            {/* Cover Image URL */}
            <FormField
              label={t('coverImage')}
              error={errors.coverImage}
              id="coverImage"
            >
              <Input
                id="coverImage"
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={values.coverImage || ''}
                onChange={(e) => setValue('coverImage', e.target.value)}
              />
            </FormField>

            {/* Notes */}
            <FormField
              label={t('notes')}
              error={errors.notes}
              id="notes"
            >
              <Textarea
                id="notes"
                placeholder="Your notes..."
                value={values.notes || ''}
                onChange={(e) => setValue('notes', e.target.value)}
                rows={4}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : isEdit ? t('edit') : t('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
