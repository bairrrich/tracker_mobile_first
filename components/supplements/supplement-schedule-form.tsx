'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/forms/form-field'
import { useForm } from '@/hooks/use-form'
import { useFinancesStore } from '@/store/finances-store'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import type { Supplement, SupplementTiming, SupplementFrequency } from '@/lib/db'

interface SupplementScheduleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplementId?: string
  editId?: string | null
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Пн' },
  { value: 1, label: 'Вт' },
  { value: 2, label: 'Ср' },
  { value: 3, label: 'Чт' },
  { value: 4, label: 'Пт' },
  { value: 5, label: 'Сб' },
  { value: 6, label: 'Вс' },
]

const TIMING_OPTIONS = [
  { value: 'morning', label: 'Утро' },
  { value: 'afternoon', label: 'День' },
  { value: 'evening', label: 'Вечер' },
  { value: 'before_workout', label: 'Перед тренировкой' },
  { value: 'after_workout', label: 'После тренировки' },
  { value: 'with_meal', label: 'С едой' },
  { value: 'before_meal', label: 'До еды' },
  { value: 'after_meal', label: 'После еды' },
]

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'as_needed', label: 'По необходимости' },
]

const scheduleSchema = z.object({
  supplementId: z.string().min(1, 'Выберите добавку'),
  frequency: z.enum(['daily', 'weekly', 'as_needed']),
  timing: z.enum(['morning', 'afternoon', 'evening', 'before_workout', 'after_workout', 'with_meal', 'before_meal', 'after_meal']),
  daysOfWeek: z.array(z.number()).optional(),
  dosage: z.number().optional(),
  quantity: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

export function SupplementScheduleForm({ open, onOpenChange, supplementId, editId }: SupplementScheduleFormProps) {
  const t = useTranslations('Supplements')
  const tc = useTranslations('Common')
  const toast = useToast()
  const { supplements, addSchedule, updateSchedule } = useFinancesStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedDays, setSelectedDays] = React.useState<number[]>([])

  const { values, errors, setValue, handleSubmit, reset } = useForm<ScheduleFormData>({
    schema: scheduleSchema,
    defaultValues: {
      supplementId: supplementId || '',
      frequency: 'daily',
      timing: 'morning',
      daysOfWeek: [],
      dosage: undefined,
      quantity: 1,
      startDate: '',
      endDate: '',
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? tc('updating') : tc('creating') })
      try {
        const scheduleData = {
          supplementId: data.supplementId,
          frequency: data.frequency,
          timing: data.timing,
          daysOfWeek: data.frequency === 'weekly' ? selectedDays : undefined,
          dosage: data.dosage,
          quantity: data.quantity,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        }
        if (editId) {
          await updateSchedule(editId, scheduleData)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('scheduleUpdated') })
        } else {
          await addSchedule(scheduleData)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('scheduleCreated') })
        }
        onOpenChange(false)
        reset()
        setSelectedDays([])
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: tc('error'), description: error instanceof Error ? error.message : tc('saveFailed') })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  React.useEffect(() => {
    if (open) {
      if (supplementId) setValue('supplementId', supplementId)
      reset()
      setSelectedDays([])
    }
  }, [open, supplementId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('editSchedule') : t('addSchedule')}</DialogTitle>
          <DialogDescription>{t('scheduleDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={t('supplement')} error={errors.supplementId}>
              <Select value={values.supplementId} onValueChange={(value) => setValue('supplementId', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectSupplement')} /></SelectTrigger>
                <SelectContent>
                  {supplements.map((s: Supplement) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('frequencyLabel')} error={errors.frequency}>
              <Select value={values.frequency} onValueChange={(value: SupplementFrequency) => setValue('frequency', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            {values.frequency === 'weekly' && (
              <FormField label={t('daysOfWeek')} error={errors.daysOfWeek}>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="w-10 h-10 p-0"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </FormField>
            )}
            <FormField label={t('timingLabel')} error={errors.timing}>
              <Select value={values.timing} onValueChange={(value: SupplementTiming) => setValue('timing', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMING_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('dosage')} error={errors.dosage}>
                <Input type="number" step="0.01" min="0" value={values.dosage || ''} onChange={(e) => setValue('dosage', parseFloat(e.target.value) || 0)} />
              </FormField>
              <FormField label={t('quantity')} error={errors.quantity}>
                <Input type="number" step="1" min="0" value={values.quantity || ''} onChange={(e) => setValue('quantity', parseFloat(e.target.value) || 0)} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('startDate')} error={errors.startDate}>
                <Input type="date" value={values.startDate || ''} onChange={(e) => setValue('startDate', e.target.value)} />
              </FormField>
              <FormField label={t('endDate')} error={errors.endDate}>
                <Input type="date" value={values.endDate || ''} onChange={(e) => setValue('endDate', e.target.value)} />
              </FormField>
            </div>
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