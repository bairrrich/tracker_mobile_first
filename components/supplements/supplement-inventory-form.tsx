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
import type { Supplement } from '@/lib/db'

interface SupplementInventoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplementId?: string
  editId?: string | null
}

const inventorySchema = z.object({
  supplementId: z.string().min(1, 'Выберите добавку'),
  quantity: z.number().min(0, 'Количество не может быть отрицательным'),
  minQuantity: z.number().min(0).optional(),
  unit: z.string().optional(),
  purchaseDate: z.string().optional(),
  expirationDate: z.string().optional(),
  price: z.number().min(0).optional(),
})

type InventoryFormData = z.infer<typeof inventorySchema>

export function SupplementInventoryForm({ open, onOpenChange, supplementId, editId }: SupplementInventoryFormProps) {
  const t = useTranslations('Supplements')
  const tc = useTranslations('Common')
  const toast = useToast()
  const { supplements, addInventory, updateInventory } = useFinancesStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { values, errors, setValue, handleSubmit, reset } = useForm<InventoryFormData>({
    schema: inventorySchema,
    defaultValues: {
      supplementId: supplementId || '',
      quantity: 0,
      minQuantity: 10,
      unit: 'шт',
      purchaseDate: '',
      expirationDate: '',
      price: 0,
    },
    onSubmit: async (data) => {
      setIsSubmitting(true)
      const toastId = toast.loading({ title: editId ? tc('updating') : tc('creating') })
      try {
        const inventoryData = {
          supplementId: data.supplementId,
          quantity: data.quantity,
          minQuantity: data.minQuantity,
          unit: data.unit,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
          price: data.price,
        }
        if (editId) {
          await updateInventory(editId, inventoryData)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('inventoryUpdated') })
        } else {
          await addInventory(inventoryData)
          toast.dismiss(toastId)
          toast.success({ title: tc('success'), description: t('inventoryCreated') })
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

  React.useEffect(() => {
    if (open) {
      if (supplementId) setValue('supplementId', supplementId)
      reset()
    }
  }, [open, supplementId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? t('editInventory') : t('addInventory')}</DialogTitle>
          <DialogDescription>{t('inventoryDescription')}</DialogDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('quantity')} error={errors.quantity}>
                <Input type="number" step="1" min="0" value={values.quantity || ''} onChange={(e) => setValue('quantity', parseFloat(e.target.value) || 0)} />
              </FormField>
              <FormField label={t('minQuantity')} error={errors.minQuantity}>
                <Input type="number" step="1" min="0" value={values.minQuantity || ''} onChange={(e) => setValue('minQuantity', parseFloat(e.target.value) || 0)} />
              </FormField>
            </div>
            <FormField label={t('unit')} error={errors.unit}>
              <Input placeholder="шт, г, мл" value={values.unit || ''} onChange={(e) => setValue('unit', e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('purchaseDate')} error={errors.purchaseDate}>
                <Input type="date" value={values.purchaseDate || ''} onChange={(e) => setValue('purchaseDate', e.target.value)} />
              </FormField>
              <FormField label={t('expirationDate')} error={errors.expirationDate}>
                <Input type="date" value={values.expirationDate || ''} onChange={(e) => setValue('expirationDate', e.target.value)} />
              </FormField>
            </div>
            <FormField label={t('price')} error={errors.price}>
              <Input type="number" step="0.01" min="0" value={values.price || ''} onChange={(e) => setValue('price', parseFloat(e.target.value) || 0)} />
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