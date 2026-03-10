'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/forms/form-field'
import { useForm } from '@/hooks/use-form'
import { useFinancesStore } from '@/store/finances-store'
import { useToast } from '@/hooks/use-toast'
import { recurringTransactionSchema, type RecurringTransactionFormData } from '@/lib/validations/finance.schema'
import type { TransactionType, FinanceAccount, FinanceCategory } from '@/lib/db'

interface RecurringTransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', labelKey: 'daily' },
  { value: 'weekly', labelKey: 'weekly' },
  { value: 'monthly', labelKey: 'monthly' },
  { value: 'yearly', labelKey: 'yearly' },
]

export function RecurringTransactionForm({ open, onOpenChange, editId }: RecurringTransactionFormProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const { addRecurringTransaction, updateRecurringTransaction, accounts, categories } = useFinancesStore()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<RecurringTransactionFormData>({
    schema: recurringTransactionSchema,
    defaultValues: {
      type: 'expense',
      amount: 0,
      accountId: '',
      categoryId: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
      toAccountId: '',
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? 'Обновление...' : 'Создание повторяющейся транзакции...' })
      try {
        const transactionData = {
          accountId: data.accountId,
          toAccountId: data.type === 'transfer' ? data.toAccountId : undefined,
          categoryId: data.type !== 'transfer' ? data.categoryId : undefined,
          amount: data.amount,
          type: data.type,
          frequency: data.frequency,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          description: data.description || undefined,
        }
        if (editId) {
          await updateRecurringTransaction(editId, transactionData)
          toast.dismiss(toastId)
          toast.success({ title: 'Обновлено', description: 'Повторяющаяся транзакция обновлена' })
        } else {
          await addRecurringTransaction(transactionData)
          toast.dismiss(toastId)
          toast.success({ title: 'Создано', description: 'Повторяющаяся транзакция создана' })
        }
        onOpenChange(false)
        reset()
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить' })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  React.useEffect(() => { if (open) reset() }, [open])

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('editRecurring') : t('addRecurring')}</DialogTitle>
          <DialogDescription>{t('recurringDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={tc('type')} error={errors.type}>
              <Select value={values.type} onValueChange={(value: TransactionType) => setValue('type', value)}>
                <SelectTrigger><SelectValue placeholder={tc('selectType')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t('income')}</SelectItem>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                  <SelectItem value="transfer">{t('transfer')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('amount')} error={errors.amount}>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={values.amount || ''} onChange={(e) => setValue('amount', parseFloat(e.target.value) || 0)} />
            </FormField>

            <FormField label={t('frequency')} error={errors.frequency}>
              <Select value={values.frequency} onValueChange={(value: any) => setValue('frequency', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectFrequency')} /></SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('startDate')} error={errors.startDate}>
              <Input type="date" value={values.startDate} onChange={(e) => setValue('startDate', e.target.value)} />
            </FormField>

            <FormField label={t('endDate')}>
              <Input type="date" value={values.endDate || ''} onChange={(e) => setValue('endDate', e.target.value)} min={values.startDate} />
            </FormField>

            <FormField label={values.type === 'transfer' ? t('fromAccount') : t('selectAccount')} error={errors.accountId}>
              <Select value={values.accountId} onValueChange={(value) => setValue('accountId', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectAccount')} /></SelectTrigger>
                <SelectContent>
                  {accounts.map((account: FinanceAccount) => (<SelectItem key={account.id} value={account.id}>{account.name} ({account.currency})</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>

            {values.type === 'transfer' && (
              <FormField label={t('toAccount')} error={errors.toAccountId}>
                <Select value={values.toAccountId} onValueChange={(value) => setValue('toAccountId', value)}>
                  <SelectTrigger><SelectValue placeholder={t('toAccount')} /></SelectTrigger>
                  <SelectContent>
                    {accounts.filter((a: FinanceAccount) => a.id !== values.accountId).map((account: FinanceAccount) => (<SelectItem key={account.id} value={account.id}>{account.name} ({account.currency})</SelectItem>))}
                  </SelectContent>
                </Select>
              </FormField>
            )}

            {values.type !== 'transfer' && (
              <FormField label={t('selectCategory')} error={errors.categoryId}>
                <Select value={values.categoryId} onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                  <SelectContent>
                    {(values.type === 'income' ? incomeCategories : expenseCategories).map((category: FinanceCategory) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </FormField>
            )}

            <FormField label={t('description')}>
              <Textarea placeholder={t('descriptionPlaceholder')} value={values.description || ''} onChange={(e) => setValue('description', e.target.value)} rows={3} />
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