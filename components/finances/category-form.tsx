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
import { categorySchema, type CategoryFormData } from '@/lib/validations/finance.schema'
import type { CategoryType } from '@/lib/db'

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
  initialType?: CategoryType
}

const CATEGORY_ICONS = [
  { value: 'wallet', label: '💰 Кошелёк' },
  { value: 'gift', label: '🎁 Подарок' },
  { value: 'trending-up', label: '📈 Рост' },
  { value: 'shopping-cart', label: '🛒 Корзина' },
  { value: 'car', label: '🚗 Авто' },
  { value: 'home', label: '🏠 Дом' },
  { value: 'film', label: '🎬 Фильм' },
  { value: 'heart', label: '❤️ Сердце' },
  { value: 'shirt', label: '👕 Одежда' },
  { value: 'phone', label: '📱 Телефон' },
  { value: 'book', label: '📚 Книга' },
  { value: 'utensils', label: '🍴 Еда' },
  { value: 'coffee', label: '☕ Кофе' },
  { value: 'plane', label: '✈️ Путешествие' },
]

const CATEGORY_COLORS = [
  '#22c55e', '#ef4444', '#3b82f6', '#f97316', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4', '#84cc16',
]

export function CategoryForm({ open, onOpenChange, editId, initialType = 'expense' }: CategoryFormProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const { addCategory, updateCategory } = useFinancesStore()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<CategoryFormData>({
    schema: categorySchema,
    defaultValues: { name: '', type: initialType, icon: 'wallet', color: '#22c55e' },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? 'Обновление категории...' : 'Создание категории...' })
      try {
        if (editId) {
          await updateCategory(editId, data)
          toast.dismiss(toastId)
          toast.success({ title: 'Категория обновлена', description: 'Категория успешно обновлена' })
        } else {
          await addCategory(data)
          toast.dismiss(toastId)
          toast.success({ title: 'Категория создана', description: 'Категория успешно добавлена' })
        }
        onOpenChange(false)
        reset()
      } catch (error) {
        toast.dismiss(toastId)
        toast.error({ title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить категорию' })
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
          <DialogTitle>{editId ? t('editCategory') : t('addCategory')}</DialogTitle>
          <DialogDescription>{editId ? 'Редактирование категории' : 'Создайте новую категорию для транзакций'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={tc('type')} error={errors.type}>
              <Select value={values.type} onValueChange={(value: CategoryType) => setValue('type', value)}>
                <SelectTrigger><SelectValue placeholder={tc('selectType')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t('income')}</SelectItem>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={tc('name')} error={errors.name}>
              <Input placeholder={tc('name')} value={values.name} onChange={(e) => setValue('name', e.target.value)} />
            </FormField>
            <FormField label="Иконка">
              <Select value={values.icon} onValueChange={(value) => setValue('icon', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {CATEGORY_ICONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Цвет">
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${values.color === color ? 'border-[var(--text)]' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue('color', color)}
                  />
                ))}
              </div>
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