'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { SupplementSchedule, Supplement } from '@/lib/db'

interface SupplementScheduleCardProps {
  schedule: SupplementSchedule
  supplement?: Supplement
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onLog?: () => void
}

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const TIMING_LABELS: Record<string, string> = {
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  before_workout: 'Перед тренировкой',
  after_workout: 'После тренировки',
  with_meal: 'С едой',
  before_meal: 'До еды',
  after_meal: 'После еды',
}
const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  as_needed: 'По необходимости',
}

export function SupplementScheduleCard({ schedule, supplement, onEdit, onDelete, onToggle, onLog }: SupplementScheduleCardProps) {
  const t = useTranslations('Supplements')
  
  const getDaysString = () => {
    if (!schedule.daysOfWeek) return ''
    try {
      const days = JSON.parse(schedule.daysOfWeek) as number[]
      if (days.length === 0) return ''
      if (days.length === 7) return 'Каждый день'
      return days.map(d => DAYS_OF_WEEK[d]).join(', ')
    } catch {
      return ''
    }
  }

  const daysString = getDaysString()

  return (
    <Card className={`bg-[var(--card)] border-[var(--border)] ${!schedule.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{supplement?.name || t('supplement')}</h3>
              {supplement?.brand && <p className="text-xs text-[var(--text-muted)]">{supplement.brand}</p>}
            </div>
            <div className="flex items-center gap-1">
              {onLog && (
                <Button variant="outline" size="sm" onClick={onLog} title={t('logIntake')} className="h-8 w-8 p-0">
                  💊
                </Button>
              )}
              <Switch checked={schedule.isActive} onCheckedChange={onToggle} aria-label={t('toggleActive')} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">⋮</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>{t('edit')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-500">{t('delete')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{FREQUENCY_LABELS[schedule.frequency] || schedule.frequency}</Badge>
            <Badge variant="outline">{TIMING_LABELS[schedule.timing] || schedule.timing}</Badge>
            {daysString && <Badge variant="secondary">{daysString}</Badge>}
          </div>

          {(schedule.dosage || schedule.quantity) && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
              {schedule.dosage && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t('dosage')}</p>
                  <p className="text-sm">{schedule.dosage} {supplement?.dosageUnit || ''}</p>
                </div>
              )}
              {schedule.quantity && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t('quantity')}</p>
                  <p className="text-sm">{schedule.quantity} шт</p>
                </div>
              )}
            </div>
          )}

          {(schedule.startDate || schedule.endDate) && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
              {schedule.startDate && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t('startDate')}</p>
                  <p className="text-sm">{new Date(schedule.startDate).toLocaleDateString('ru-RU')}</p>
                </div>
              )}
              {schedule.endDate && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t('endDate')}</p>
                  <p className="text-sm">{new Date(schedule.endDate).toLocaleDateString('ru-RU')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}