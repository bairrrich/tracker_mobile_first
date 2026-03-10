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
import { budgetSchema, type BudgetFormData } from '@/lib/validations/finance.schema'
import type { BudgetPeriod, FinanceCategory } from '@/lib/db'

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
}

export function BudgetForm({ open, onOpenChange, editId }: BudgetFormProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const { addBudget, updateBudget, categories } = useFinancesStore()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const now = new Date()
  const { values, errors, setValue, handleSubmit, reset } = useForm<BudgetFormData>({
    schema: budgetSchema,
    defaultValues: {
      categoryId: '',
      period: 'monthly',
      amount: 0,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? tc('updating') : tc('creating') })
      try {
        if (editId) {
          await updateBudget(editId, data)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('budgetSaved') })
        } else {
          await addBudget(data)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('budgetCreated') })
        }
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

  React.useEffect(() => { if (open) reset() }, [open])

  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('editBudget') : t('addBudget')}</DialogTitle>
          <DialogDescription>{editId ? t('editBudgetDesc') : t('addBudgetDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={t('selectCategory')} error={errors.categoryId}>
              <Select value={values.categoryId} onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category: FinanceCategory) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('period')} error={errors.period}>
              <Select value={values.period} onValueChange={(value: BudgetPeriod) => setValue('period', value)}>
                <SelectTrigger><SelectValue placeholder={t('period')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('monthly')}</SelectItem>
                  <SelectItem value="weekly">{t('weekly')}</SelectItem>
                  <SelectItem value="yearly">{t('yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('budgetLimit')} error={errors.amount}>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={values.amount || ''} onChange={(e) => setValue('amount', parseFloat(e.target.value) || 0)} />
            </FormField>
            {values.period === 'monthly' && (
              <>
                <FormField label={t('monthly')} error={errors.month}>
                  <Select value={String(values.month)} onValueChange={(value) => setValue('month', parseInt(value))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'].map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t('yearly')} error={errors.year}>
                  <Input type="number" value={values.year || ''} onChange={(e) => setValue('year', parseInt(e.target.value) || now.getFullYear())} />
                </FormField>
              </>
            )}
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