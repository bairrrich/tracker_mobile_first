'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { FinanceBudget, FinanceCategory } from '@/lib/db'

interface BudgetCardProps {
  budget: FinanceBudget
  category?: FinanceCategory
  onEdit: () => void
  onDelete: () => void
}

export function BudgetCard({ budget, category, onEdit, onDelete }: BudgetCardProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')

  const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount)
  
  const percentage = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0
  const remaining = budget.amount - budget.spent
  const isOverBudget = budget.spent > budget.amount

  const getPeriodLabel = () => {
    if (budget.period === 'monthly' && budget.month) {
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      return `${months[budget.month - 1]} ${budget.year}`
    }
    return t(budget.period)
  }

  return (
    <Card className={`bg-[var(--card)] border-[var(--border)] ${isOverBudget ? 'border-red-500' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <span>{category?.icon || '📊'}</span>
            <span>{category?.name || t('selectCategory')}</span>
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">⋮</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>{tc('edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-500">{tc('delete')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">{getPeriodLabel()}</span>
          {isOverBudget && (
            <Badge variant="destructive" className="text-xs">{t('overBudget')}</Badge>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)]">{t('spent')}</p>
            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-500' : 'text-[var(--text)]'}`}>
              {formatCurrency(budget.spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">{t('budgetLimit')}</p>
            <p className="text-sm font-medium">{formatCurrency(budget.amount)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Progress value={percentage} className={`h-2 ${isOverBudget ? 'bg-red-500/20' : ''}`} />
          <p className="text-xs text-right">
            {percentage.toFixed(0)}% • {t('remaining')}: <span className={isOverBudget ? 'text-red-500' : 'text-green-500'}>{formatCurrency(remaining)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}