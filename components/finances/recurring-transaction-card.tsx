'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { FinanceRecurringTransaction, FinanceCategory, FinanceAccount } from '@/lib/db'
import { format } from 'date-fns'

interface RecurringTransactionCardProps {
  transaction: FinanceRecurringTransaction
  category?: FinanceCategory
  account?: FinanceAccount
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

const getFrequencyLabel = (freq: string) => {
  const labels: Record<string, string> = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно',
  }
  return labels[freq] || freq
}

export function RecurringTransactionCard({ transaction, category, account, onEdit, onDelete, onToggle }: RecurringTransactionCardProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')

  const formatCurrency = (amount: number, currency: string = 'RUB') =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)

  const formatDate = (date: Date | string) => format(new Date(date), 'dd.MM.yyyy')

  const getNextDueDate = () => {
    if (!transaction.startDate) return null
    const start = new Date(transaction.startDate)
    const today = new Date()
    let next = new Date(start)

    while (next < today) {
      switch (transaction.frequency) {
        case 'daily': next.setDate(next.getDate() + 1); break
        case 'weekly': next.setDate(next.getDate() + 7); break
        case 'monthly': next.setMonth(next.getMonth() + 1); break
        case 'yearly': next.setFullYear(next.getFullYear() + 1); break
      }
      if (transaction.endDate && next > new Date(transaction.endDate)) return null
    }
    return next
  }

  const nextDue = getNextDueDate()
  const typeColor = transaction.type === 'income' ? 'text-green-500' : transaction.type === 'expense' ? 'text-red-500' : 'text-blue-500'
  const typeIcon = transaction.type === 'income' ? '↑' : transaction.type === 'expense' ? '↓' : '→'

  return (
    <Card className="bg-[var(--card)] border-[var(--border)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[var(--border)] ${typeColor}`}>
              {typeIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[var(--text)]">{category?.name || t('transfer')}</p>
                <Badge variant="outline" className="text-xs">{getFrequencyLabel(transaction.frequency)}</Badge>
                {!transaction.isActive && <Badge variant="secondary" className="text-xs">{tc('inactive')}</Badge>}
              </div>
              <p className="text-sm text-[var(--text-muted)]">{account?.name || t('selectAccount')}</p>
              {transaction.description && <p className="text-xs text-[var(--text-muted)]">{transaction.description}</p>}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-[var(--text-muted)]">{tc('start')}: {formatDate(transaction.startDate)}</p>
                {nextDue && <p className="text-xs text-[var(--text-muted)]">• {tc('nextDue')}: {formatDate(nextDue)}</p>}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className={`text-lg font-bold ${typeColor}`}>{formatCurrency(transaction.amount, account?.currency)}</p>
            <div className="flex items-center gap-2">
              <Switch checked={transaction.isActive} onCheckedChange={onToggle} aria-label="Активно" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">⋮</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>{tc('edit')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-500">{tc('delete')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}