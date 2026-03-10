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
import { transactionSchema, type TransactionFormData } from '@/lib/validations/finance.schema'
import type { TransactionType, FinanceAccount, FinanceCategory } from '@/lib/db'

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
  initialType?: TransactionType
}

export function TransactionForm({ open, onOpenChange, editId, initialType = 'expense' }: TransactionFormProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const { addTransaction, updateTransaction, accounts, categories } = useFinancesStore()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<TransactionFormData>({
    schema: transactionSchema,
    defaultValues: { type: initialType, amount: 0, accountId: '', toAccountId: '', categoryId: '', date: new Date().toISOString().split('T')[0], description: '', tags: '', fee: 0 },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? 'Обновление транзакции...' : 'Создание транзакции...' })
      try {
        const transactionData = {
          accountId: data.accountId,
          toAccountId: data.type === 'transfer' ? data.toAccountId : undefined,
          categoryId: data.type !== 'transfer' ? data.categoryId : undefined,
          amount: data.amount,
          type: data.type,
          date: new Date(data.date),
          description: data.description || undefined,
          tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
          fee: data.type === 'transfer' && data.fee ? data.fee : undefined,
        }
        if (editId) {
          await updateTransaction(editId, transactionData)
          toast.dismiss(toastId)
          toast.success({ title: 'Транзакция обновлена', description: 'Транзакция успешно обновлена' })
        } else {
          await addTransaction(transactionData)
          toast.dismiss(toastId)
          toast.success({ title: 'Транзакция создана', description: 'Транзакция успешно добавлена' })
        }
        onOpenChange(false)
        reset()
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить транзакцию' })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  React.useEffect(() => {
    if (open) {
      setValue('type', initialType || 'expense')
      const today = new Date().toISOString().split('T')[0]
      if (today) setValue('date', today)
    }
  }, [open, initialType])

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('editTransaction') : t('addTransaction')}</DialogTitle>
          <DialogDescription>{editId ? 'Редактирование транзакции' : 'Добавьте новую транзакцию для учёта финансов'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={t('selectType')} error={errors.type}>
              <Select value={values.type} onValueChange={(value: TransactionType) => setValue('type', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectType')} /></SelectTrigger>
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
            <FormField label={t('date')} error={errors.date}>
              <Input type="date" value={values.date} onChange={(e) => setValue('date', e.target.value)} max={new Date().toISOString().split('T')[0]} />
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
            {values.type === 'transfer' && (
              <FormField label={t('fee')} error={errors.fee}>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={values.fee || ''} onChange={(e) => setValue('fee', parseFloat(e.target.value) || 0)} />
              </FormField>
            )}
            <FormField label={t('description')} error={errors.description}>
              <Textarea placeholder="Описание транзакции" value={values.description || ''} onChange={(e) => setValue('description', e.target.value)} rows={3} />
            </FormField>
            <FormField label={t('tags')} error={errors.tags}>
              <Input placeholder="тег1, тег2, тег3" value={values.tags || ''} onChange={(e) => setValue('tags', e.target.value)} />
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