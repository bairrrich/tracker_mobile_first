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
import { z } from 'zod'
import type { SupplementType, SupplementForm, SupplementCategory } from '@/lib/db'

interface SupplementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: string | null
}

const supplementSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  type: z.enum(['vitamin', 'mineral', 'supplement', 'protein', 'herb', 'other']),
  form: z.enum(['tablet', 'capsule', 'powder', 'liquid', 'gummy', 'softgel']),
  dosage: z.number().optional(),
  dosageUnit: z.string().optional(),
  category: z.enum(['health', 'sport', 'beauty', 'immunity', 'energy', 'sleep', 'other']).optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
})

type SupplementFormData = z.infer<typeof supplementSchema>

const TYPE_OPTIONS = [
  { value: 'vitamin', label: '💊 Витамин' },
  { value: 'mineral', label: '🧂 Минерал' },
  { value: 'supplement', label: '🌿 БАД' },
  { value: 'protein', label: '🥤 Протеин' },
  { value: 'herb', label: '🌱 Трава' },
  { value: 'other', label: '📦 Другое' },
]

const FORM_OPTIONS = [
  { value: 'tablet', label: 'Таблетки' },
  { value: 'capsule', label: 'Капсулы' },
  { value: 'powder', label: 'Порошок' },
  { value: 'liquid', label: 'Жидкость' },
  { value: 'gummy', label: 'Жевательные' },
  { value: 'softgel', label: 'Мягкие капсулы' },
]

const CATEGORY_OPTIONS = [
  { value: 'health', label: 'Здоровье' },
  { value: 'sport', label: 'Спорт' },
  { value: 'beauty', label: 'Красота' },
  { value: 'immunity', label: 'Иммунитет' },
  { value: 'energy', label: 'Энергия' },
  { value: 'sleep', label: 'Сон' },
  { value: 'other', label: 'Другое' },
]

export function SupplementForm({ open, onOpenChange, editId }: SupplementFormProps) {
  const t = useTranslations('Supplements')
  const tc = useTranslations('Common')
  const toast = useToast()
  const { addSupplement, updateSupplement } = useFinancesStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<SupplementFormData>({
    schema: supplementSchema,
    defaultValues: {
      name: '',
      type: 'vitamin',
      form: 'tablet',
      dosage: undefined,
      dosageUnit: '',
      category: 'health',
      brand: '',
      description: '',
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? tc('updating') : tc('creating') })
      try {
        const supplementData = {
          name: data.name,
          type: data.type,
          form: data.form,
          dosage: data.dosage,
          dosageUnit: data.dosageUnit,
          category: data.category,
          brand: data.brand,
          description: data.description,
        }
        if (editId) {
          await updateSupplement(editId, supplementData)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('supplementUpdated') })
        } else {
          await addSupplement(supplementData)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('supplementCreated') })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('edit') : t('add')}</DialogTitle>
          <DialogDescription>{t('formDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField label={t('name')} error={errors.name}>
              <Input placeholder={t('namePlaceholder')} value={values.name} onChange={(e) => setValue('name', e.target.value)} />
            </FormField>
            <FormField label={t('type')} error={errors.type}>
              <Select value={values.type} onValueChange={(value: SupplementType) => setValue('type', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectType')} /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('form')} error={errors.form}>
              <Select value={values.form} onValueChange={(value: SupplementForm) => setValue('form', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectForm')} /></SelectTrigger>
                <SelectContent>
                  {FORM_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('dosage')} error={errors.dosage}>
                <Input type="number" step="0.01" min="0" value={values.dosage || ''} onChange={(e) => setValue('dosage', parseFloat(e.target.value) || 0)} />
              </FormField>
              <FormField label={t('dosageUnit')} error={errors.dosageUnit}>
                <Input placeholder="mg, mcg, IU" value={values.dosageUnit || ''} onChange={(e) => setValue('dosageUnit', e.target.value)} />
              </FormField>
            </div>
            <FormField label={t('category')} error={errors.category}>
              <Select value={values.category} onValueChange={(value: SupplementCategory) => setValue('category', value)}>
                <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('brand')} error={errors.brand}>
              <Input placeholder={t('brandPlaceholder')} value={values.brand || ''} onChange={(e) => setValue('brand', e.target.value)} />
            </FormField>
            <FormField label={t('description')} error={errors.description}>
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