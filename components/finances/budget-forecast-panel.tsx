'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ForecastSummary } from '@/lib/budget-forecast'

interface BudgetForecastPanelProps { forecast: ForecastSummary }

export function BudgetForecastPanel({ forecast }: BudgetForecastPanelProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount)
  const trendIcon = (trend: string) => trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'
  const confidenceColor = (conf: string) => conf === 'high' ? 'text-green-500' : conf === 'medium' ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прогноз на месяц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(forecast.totalPredicted)}</div>
            <p className="text-xs text-[var(--text-muted)]">{forecast.change >= 0 ? '+' : ''}{formatCurrency(forecast.change)} ({forecast.changePercentage >= 0 ? '+' : ''}{forecast.changePercentage.toFixed(0)}%)</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прошлый месяц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(forecast.totalLastMonth)}</div>
            <p className="text-xs text-[var(--text-muted)]">Фактические расходы</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Тренд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${forecast.changePercentage >= 0 ? 'text-red-500' : 'text-green-500'}`}>↕️ {Math.abs(forecast.changePercentage).toFixed(0)}%</div>
            <p className="text-xs text-[var(--text-muted)]">{forecast.changePercentage >= 0 ? 'Рост расходов' : 'Снижение расходов'}</p>
          </CardContent>
        </Card>
      </div>
      {forecast.recommendations.length > 0 && (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader><CardTitle className="text-base">💡 Рекомендации</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2">{forecast.recommendations.map((rec, i) => (<li key={i} className="text-sm text-[var(--text)]">{rec}</li>))}</ul></CardContent>
        </Card>
      )}
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader><CardTitle>📊 Топ категорий расходов</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecast.topCategories.map((cat, i) => (
              <div key={cat.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{trendIcon(cat.trend)}</span>
                    <span className="font-medium">{i + 1}. {cat.category}</span>
                    <Badge variant="outline" className={confidenceColor(cat.confidence)}>{cat.confidence === 'high' ? 'Точно' : cat.confidence === 'medium' ? 'Средне' : 'Низко'}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(cat.predictedNextMonth)}</div>
                    <div className="text-xs text-[var(--text-muted)]">{cat.trendPercentage >= 0 ? '+' : ''}{cat.trendPercentage.toFixed(0)}%</div>
                  </div>
                </div>
                <Progress value={(cat.predictedNextMonth / forecast.totalPredicted) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader><CardTitle>Все категории</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {forecast.byCategory.map(cat => (
              <div key={cat.categoryId} className="p-3 rounded-lg bg-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{cat.category}</span>
                  <span className={`text-xs ${confidenceColor(cat.confidence)}`}>{cat.confidence === 'high' ? '●' : cat.confidence === 'medium' ? '◐' : '○'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-[var(--text-muted)]">Среднее</div><div className="font-medium">{formatCurrency(cat.averageMonthly)}</div></div>
                  <div><div className="text-[var(--text-muted)]">Прогноз</div><div className="font-medium">{formatCurrency(cat.predictedNextMonth)}</div></div>
                  <div><div className="text-[var(--text-muted)]">Тренд</div><div className={cat.trendPercentage >= 0 ? 'text-red-500' : 'text-green-500'}>{cat.trendPercentage >= 0 ? '+' : ''}{cat.trendPercentage.toFixed(0)}%</div></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}