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
import type { FinanceAccount } from '@/lib/db'

interface SavingsGoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
}

const goalSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  targetAmount: z.number().positive('Цель должна быть больше 0'),
  currentAmount: z.number().min(0, 'Не может быть отрицательным'),
  accountId: z.string().optional(),
  deadline: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

type GoalFormData = z.infer<typeof goalSchema>

const GOAL_ICONS = [
  { value: 'house', label: '🏠 Дом' },
  { value: 'car', label: '🚗 Авто' },
  { value: 'plane', label: '✈️ Путешествие' },
  { value: 'graduation-cap', label: '🎓 Образование' },
  { value: 'heart', label: '❤️ Здоровье' },
  { value: 'gift', label: '🎁 Подарок' },
  { value: 'briefcase', label: '💼 Бизнес' },
  { value: 'piggy-bank', label: '💰 Накопления' },
]

const GOAL_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f97316', '#ef4444', '#14b8a6', '#eab308',
]

export function SavingsGoalForm({ open, onOpenChange, editId }: SavingsGoalFormProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const toast = useToast()
  const { accounts, addSavingsGoal, updateSavingsGoal } = useFinancesStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<GoalFormData>({
    schema: goalSchema,
    defaultValues: { name: '', targetAmount: 0, currentAmount: 0, accountId: '', deadline: '', description: '', icon: 'piggy-bank', color: '#22c55e' },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? 'Обновление цели...' : 'Создание цели...' })
      try {
        const goalData = { name: data.name, targetAmount: data.targetAmount, currentAmount: data.currentAmount, accountId: data.accountId || undefined, deadline: data.deadline ? new Date(data.deadline) : undefined, description: data.description || undefined, icon: data.icon, color: data.color }
        if (editId) { await updateSavingsGoal(editId, goalData); toast.dismiss(toastId); toast.success({ title: 'Цель обновлена', description: 'Цель накоплений обновлена' }) }
        else { await addSavingsGoal(goalData); toast.dismiss(toastId); toast.success({ title: 'Цель создана', description: 'Цель накоплений создана' }) }
        onOpenChange(false)
        reset()
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить цель' })
      } finally { setIsSubmitting(false) }
    },
  })

  React.useEffect(() => { if (open) reset() }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('goals.edit') : t('goals.add')}</DialogTitle>
          <DialogDescription>{t('goals.createDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={t('goals.name')} error={errors.name}><Input placeholder={t('goals.namePlaceholder')} value={values.name} onChange={(e) => setValue('name', e.target.value)} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('goals.targetAmount')} error={errors.targetAmount}><Input type="number" step="0.01" min="0" value={values.targetAmount || ''} onChange={(e) => setValue('targetAmount', parseFloat(e.target.value) || 0)} /></FormField>
              <FormField label={t('goals.currentAmount')} error={errors.currentAmount}><Input type="number" step="0.01" min="0" value={values.currentAmount || ''} onChange={(e) => setValue('currentAmount', parseFloat(e.target.value) || 0)} /></FormField>
            </div>
            <FormField label={t('selectAccount')}><Select value={values.accountId} onValueChange={(value) => setValue('accountId', value)}><SelectTrigger><SelectValue placeholder={t('selectAccount')} /></SelectTrigger><SelectContent>{accounts.map((account: FinanceAccount) => (<SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>))}</SelectContent></Select></FormField>
            <FormField label={t('goals.deadline')}><Input type="date" value={values.deadline || ''} onChange={(e) => setValue('deadline', e.target.value)} /></FormField>
            <FormField label={tc('icon')}><Select value={values.icon} onValueChange={(value) => setValue('icon', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOAL_ICONS.map((icon) => (<SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>))}</SelectContent></Select></FormField>
            <FormField label={tc('color')}><div className="flex gap-2 flex-wrap">{GOAL_COLORS.map((color) => (<button key={color} type="button" className={`w-8 h-8 rounded-full border-2 ${values.color === color ? 'border-[var(--text)]' : 'border-transparent'}`} style={{ backgroundColor: color }} onClick={() => setValue('color', color)} />))}</div></FormField>
            <FormField label={t('description')}><Input placeholder={t('goals.descriptionPlaceholder')} value={values.description || ''} onChange={(e) => setValue('description', e.target.value)} /></FormField>
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