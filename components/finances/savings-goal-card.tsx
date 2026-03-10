'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { FinanceSavingsGoal, FinanceAccount } from '@/lib/db'

interface SavingsGoalCardProps {
  goal: FinanceSavingsGoal
  account?: FinanceAccount
  onEdit: () => void
  onDelete: () => void
  onAddFunds: () => void
}

const STATUS_LABELS: Record<string, string> = { active: 'Активна', paused: 'На паузе', completed: 'Достигнута' }
const STATUS_COLORS: Record<string, string> = { active: 'bg-green-500/10 text-green-500 border-green-500/20', paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }

export function SavingsGoalCard({ goal, account, onEdit, onDelete, onAddFunds }: SavingsGoalCardProps) {
  const t = useTranslations('Finances')
  const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: account?.currency || 'RUB', minimumFractionDigits: 0 }).format(amount)
  const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
  const remaining = goal.targetAmount - goal.currentAmount
  const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount

  const getDeadlineLabel = () => {
    if (!goal.deadline) return null
    const deadline = new Date(goal.deadline)
    const now = new Date()
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return `Просрочено (${Math.abs(daysLeft)} дн.)`
    if (daysLeft === 0) return 'Сегодня'
    if (daysLeft === 1) return 'Завтра'
    if (daysLeft < 30) return `${daysLeft} дн.`
    const months = Math.ceil(daysLeft / 30)
    return `${months} мес.`
  }

  const deadlineLabel = getDeadlineLabel()

  return (
    <Card className={`bg-[var(--card)] border-[var(--border)] ${isCompleted ? 'border-green-500' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${goal.color}20` }}>{goal.icon || '💰'}</div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">{goal.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_COLORS[goal.status]}>{STATUS_LABELS[goal.status]}</Badge>
                  {deadlineLabel && <span className="text-xs text-[var(--text-muted)]">{deadlineLabel}</span>}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8">⋮</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>{t('edit', { ns: 'Common' })}</DropdownMenuItem>
                {!isCompleted && <DropdownMenuItem onClick={onAddFunds}>Пополнить</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-500">{t('delete', { ns: 'Common' })}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <div><p className="text-xs text-[var(--text-muted)]">Накоплено</p><p className={`text-xl font-bold ${isCompleted ? 'text-green-500' : 'text-[var(--text)]'}`}>{formatCurrency(goal.currentAmount)}</p></div>
              <div className="text-right"><p className="text-xs text-[var(--text-muted)]">Цель</p><p className="text-sm font-medium">{formatCurrency(goal.targetAmount)}</p></div>
            </div>
            <Progress value={progress} className={`h-3 ${isCompleted ? 'bg-green-500/20' : ''}`} />
            <p className="text-xs text-right">{progress.toFixed(0)}% • Осталось: <span className={isCompleted ? 'text-green-500' : 'text-[var(--text-muted)]'}>{formatCurrency(remaining)}</span></p>
          </div>
          {goal.description && <p className="text-sm text-[var(--text-muted)]">{goal.description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}