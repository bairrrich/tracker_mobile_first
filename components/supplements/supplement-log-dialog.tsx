'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/forms/form-field'
import { useForm } from '@/hooks/use-form'
import { useFinancesStore } from '@/store/finances-store'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import type { Supplement, SupplementLogStatus } from '@/lib/db'

interface SupplementLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplement?: Supplement
  scheduleId?: string
}

const logSchema = z.object({
  status: z.enum(['taken', 'skipped', 'missed']),
  dosage: z.number().optional(),
  quantity: z.number().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

type LogFormData = z.infer<typeof logSchema>

const STATUS_OPTIONS = [
  { value: 'taken', label: '✅ Принято', color: 'text-green-500' },
  { value: 'skipped', label: '⏭️ Пропущено', color: 'text-yellow-500' },
  { value: 'missed', label: '❌ Забыто', color: 'text-red-500' },
]

export function SupplementLogDialog({ open, onOpenChange, supplement, scheduleId }: SupplementLogDialogProps) {
  const t = useTranslations('Supplements')
  const tc = useTranslations('Common')
  const toast = useToast()
  const { addLog } = useFinancesStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<LogFormData>({
    schema: logSchema,
    defaultValues: {
      status: 'taken',
      dosage: supplement?.dosage,
      quantity: 1,
      notes: '',
      rating: undefined,
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: tc('saving') })
      try {
        await addLog({
          supplementId: supplement!.id,
          scheduleId,
          date: new Date(),
          time: new Date(),
          status: data.status,
          dosage: data.dosage,
          quantity: data.quantity,
          notes: data.notes,
          rating: data.rating,
        })
        toast.dismiss(toastId)
        toast.success({ title: tc('success'), description: t('logCreated') })
        onOpenChange(false)
        reset()
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: tc('error'), description: error instanceof Error ? error.message : tc('saveFailed') })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  React.useEffect(() => {
    if (open && supplement) {
      setValue('dosage', supplement.dosage)
      reset()
    }
  }, [open, supplement])

  if (!supplement) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('logIntake')}</DialogTitle>
          <DialogDescription>{t('logDescription', { name: supplement.name })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="text-center p-4 bg-[var(--card)] rounded-lg">
              <p className="text-2xl mb-2">{supplement.brand ? `${supplement.brand} -` : ''}</p>
              <p className="font-bold text-lg">{supplement.name}</p>
              {supplement.dosage && <p className="text-sm text-[var(--text-muted)]">{supplement.dosage} {supplement.dosageUnit}</p>}
            </div>
            <FormField label={t('status')} error={errors.status}>
              <Select value={values.status} onValueChange={(value: SupplementLogStatus) => setValue('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={opt.color}>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {values.status === 'taken' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label={t('dosage')} error={errors.dosage}>
                    <Input type="number" step="0.01" min="0" value={values.dosage || ''} onChange={(e) => setValue('dosage', parseFloat(e.target.value) || 0)} />
                  </FormField>
                  <FormField label={t('quantity')} error={errors.quantity}>
                    <Input type="number" step="1" min="0" value={values.quantity || ''} onChange={(e) => setValue('quantity', parseFloat(e.target.value) || 0)} />
                  </FormField>
                </div>
                <FormField label={t('rating')} error={errors.rating}>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={values.rating === rating ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setValue('rating', rating)}
                        className="w-10 h-10 p-0"
                      >
                        {'⭐'.repeat(rating)}
                      </Button>
                    ))}
                  </div>
                </FormField>
              </>
            )}
            <FormField label={t('notes')} error={errors.notes}>
              <Textarea placeholder={t('logNotes')} value={values.notes || ''} onChange={(e) => setValue('notes', e.target.value)} rows={3} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{tc('cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? tc('saving') : tc('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}