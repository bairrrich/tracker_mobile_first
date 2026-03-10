'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { FinanceTransaction, FinanceCategory, FinanceAccount } from '@/lib/db'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface TransactionCardProps {
  transaction: FinanceTransaction
  category?: FinanceCategory
  account?: FinanceAccount
  onEdit: () => void
  onDelete: () => void
  selected?: boolean
  onSelect?: (selected: boolean) => void
  showCheckbox?: boolean
}

export function TransactionCard({ transaction, category, account, onEdit, onDelete, selected = false, onSelect, showCheckbox = false }: TransactionCardProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const formatCurrency = (amount: number, currency: string = 'RUB') => new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
  const formatShortDate = (date: Date | string) => format(new Date(date), 'dd.MM.yyyy')

  const getTypeColor = (type: string) => {
    if (type === 'income') return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (type === 'expense') return 'bg-red-500/10 text-red-500 border-red-500/20'
    if (type === 'transfer') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    return ''
  }

  const getIcon = (type: string) => {
    if (type === 'income') return '↑'
    if (type === 'expense') return '↓'
    if (type === 'transfer') return '→'
    return ''
  }

  const isPositive = transaction.type === 'income' || (transaction.type === 'transfer' && account?.id === transaction.toAccountId)

  return (
    <>
      <Card className={`bg-[var(--card)] border-[var(--border)] ${selected ? 'ring-2 ring-[var(--primary)]' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {showCheckbox && onSelect && (
              <div className="flex items-center gap-2">
                <Checkbox checked={selected} onCheckedChange={onSelect} />
              </div>
            )}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getTypeColor(transaction.type)}`}>
                {getIcon(transaction.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[var(--text)] truncate">{category?.name || t('transfer')}</p>
                  <Badge variant="outline" className={getTypeColor(transaction.type)}>{t(transaction.type)}</Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)] truncate">{account?.name || t('selectAccount')}</p>
                {transaction.description && <p className="text-xs text-[var(--text-muted)] truncate mt-1">{transaction.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-[var(--text-muted)]">{formatShortDate(transaction.date)}</p>
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex gap-1">
                      {transaction.tags.slice(0, 3).map((tag: string, i: number) => (<Badge key={i} variant="secondary" className="text-xs px-1 py-0 h-5">{tag}</Badge>))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : '-'}{formatCurrency(transaction.amount, account?.currency)}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">⋮</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>{t('edit', { ns: 'Common' })}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-500">{t('delete', { ns: 'Common' })}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTransaction')}</AlertDialogTitle>
            <AlertDialogDescription>Вы уверены, что хотите удалить эту транзакцию? Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>{tc('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}