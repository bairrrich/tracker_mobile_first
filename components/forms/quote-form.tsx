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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/form-field'
import { quoteSchema, type QuoteFormData } from '@/lib/validations/quote.schema'
import { useForm } from '@/hooks/use-form'

interface QuoteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (text: string, page?: number) => Promise<void>
  editQuote?: { text: string; page?: number } | null
}

export function QuoteForm({ open, onOpenChange, onSubmit, editQuote }: QuoteFormProps) {
  const t = useTranslations('Books')
  const tCommon = useTranslations('Common')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset, setErrors } = useForm<QuoteFormData>({
    schema: quoteSchema,
    defaultValues: {
      text: '',
      page: undefined,
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data.text, data.page)
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to save quote:', error)
        setErrors({ text: 'Failed to save quote' })
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
    } else if (editQuote) {
      setValue('text', editQuote.text)
      setValue('page', editQuote.page)
    }
  }, [open, reset, editQuote, setValue])

  const isEdit = !!editQuote

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t('editQuote') : t('addQuote')}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t('editQuoteDescription')
                : t('addQuoteDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quote Text */}
            <FormField
              label={t('quoteText')}
              error={errors.text}
              id="text"
            >
              <Textarea
                id="text"
                placeholder={t('quotePlaceholder')}
                value={values.text}
                onChange={(e) => setValue('text', e.target.value)}
                rows={4}
                required
              />
            </FormField>

            {/* Page Number */}
            <FormField
              label={t('page')}
              error={errors.page}
              id="page"
            >
              <Input
                id="page"
                type="number"
                min="1"
                max="10000"
                placeholder="0"
                value={values.page || ''}
                onChange={(e) => setValue('page', e.target.value ? Number(e.target.value) : undefined)}
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
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tCommon('saving') : isEdit ? tCommon('edit') : tCommon('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
