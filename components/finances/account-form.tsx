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
import { accountSchema, type AccountFormData } from '@/lib/validations/finance.schema'
import type { AccountType, Currency } from '@/lib/db'

interface AccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
}

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'cash', label: 'Наличные', icon: '💵' },
  { value: 'card', label: 'Карта', icon: '💳' },
  { value: 'deposit', label: 'Депозит', icon: '🏦' },
]

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'RUB', label: '₽ - RUB' },
  { value: 'USD', label: '$ - USD' },
  { value: 'EUR', label: '€ - EUR' },
  { value: 'GBP', label: '£ - GBP' },
  { value: 'JPY', label: '¥ - JPY' },
  { value: 'CNY', label: '¥ - CNY' },
]

export function AccountForm({ open, onOpenChange, editId }: AccountFormProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const { addAccount, updateAccount } = useFinancesStore()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<AccountFormData>({
    schema: accountSchema,
    defaultValues: { name: '', type: 'cash', currency: 'RUB', initialBalance: 0, icon: '', color: '' },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? 'Обновление счёта...' : 'Создание счёта...' })
      try {
        const accountType = ACCOUNT_TYPES.find(t => t.value === data.type)
        if (editId) {
          await updateAccount(editId, { name: data.name, type: data.type, currency: data.currency, icon: accountType?.icon })
          toast.dismiss(toastId)
          toast.success({ title: 'Счёт обновлён', description: 'Счёт успешно обновлён' })
        } else {
          await addAccount({ name: data.name, type: data.type, currency: data.currency, initialBalance: data.initialBalance, icon: accountType?.icon })
          toast.dismiss(toastId)
          toast.success({ title: 'Счёт создан', description: 'Счёт успешно добавлен' })
        }
        onOpenChange(false)
        reset()
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить счёт' })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  React.useEffect(() => { if (open) reset() }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('editAccount') : t('addAccount')}</DialogTitle>
          <DialogDescription>{editId ? 'Редактирование счёта' : 'Создайте новый счёт для учёта финансов'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={t('accountName')} error={errors.name}>
              <Input placeholder="Например: Основная карта" value={values.name} onChange={(e) => setValue('name', e.target.value)} />
            </FormField>
            <FormField label={t('accountType')} error={errors.type}>
              <Select value={values.type} onValueChange={(value: AccountType) => setValue('type', value)}>
                <SelectTrigger><SelectValue placeholder={t('accountType')} /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (<SelectItem key={type.value} value={type.value}>{type.icon} {type.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('currency')} error={errors.currency}>
              <Select value={values.currency} onValueChange={(value: Currency) => setValue('currency', value)}>
                <SelectTrigger><SelectValue placeholder={t('currency')} /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (<SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('initialBalance')} error={errors.initialBalance}>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={values.initialBalance || ''} onChange={(e) => setValue('initialBalance', parseFloat(e.target.value) || 0)} />
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