'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface AddFundsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalName: string
  currentAmount: number
  onAdd: (amount: number) => Promise<void>
}

export function AddFundsDialog({ open, onOpenChange, goalName, currentAmount, onAdd }: AddFundsDialogProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const toast = useToast()
  const [amount, setAmount] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const formatCurrency = (val: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2 }).format(val)

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) { toast.error({ title: tc('error'), description: t('enterValidAmount') }); return }
    setIsSubmitting(true)
    try {
      await onAdd(numAmount)
      toast.success({ title: t('fundsAdded'), description: `${t('added')}: ${formatCurrency(numAmount)}` })
      setAmount('')
      onOpenChange(false)
    } catch (error) {
      toast.error({ title: tc('error'), description: error instanceof Error ? error.message : tc('saveFailed') })
    } finally { setIsSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('goals.addFunds')}</DialogTitle>
          <DialogDescription>{t('goals.addFundsTo', { goalName })}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">{t('goals.addAmount')}</Label>
            <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="text-sm text-[var(--text-muted)]">{t('goals.currentAmount')}: <span className="font-medium text-[var(--text)]">{formatCurrency(currentAmount)}</span></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{tc('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !amount}>{tc('add')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}