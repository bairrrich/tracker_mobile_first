import type { FinanceTransaction } from '@/lib/db'

export interface BudgetForecast {
  category: string
  categoryId: string
  averageMonthly: number
  predictedNextMonth: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  confidence: 'high' | 'medium' | 'low'
  history: MonthlyData[]
}

export interface MonthlyData { month: string; amount: number }
export interface ForecastSummary {
  totalPredicted: number
  totalLastMonth: number
  change: number
  changePercentage: number
  byCategory: BudgetForecast[]
  topCategories: BudgetForecast[]
  recommendations: string[]
}

export function analyzeTransactionHistory(transactions: FinanceTransaction[], categories: { id: string; name: string }[]): ForecastSummary {
  const monthsData: Record<string, Record<string, number>> = {}
  transactions.filter(t => t.type === 'expense' && t.categoryId).forEach(t => {
    const date = new Date(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthsData[monthKey]) monthsData[monthKey] = {}
    const catId = t.categoryId!
    if (!monthsData[monthKey][catId]) monthsData[monthKey][catId] = 0
    monthsData[monthKey][catId] += t.amount || 0
  })
  const sortedMonths = Object.keys(monthsData).sort().slice(-6)
  const forecasts: BudgetForecast[] = categories.map(category => {
    const history: MonthlyData[] = sortedMonths.map(month => ({ month, amount: monthsData[month]?.[category.id] || 0 }))
    const amounts = history.map(h => h.amount)
    const averageMonthly = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0
    const last3 = amounts.slice(-3)
    const prev3 = amounts.slice(0, -3)
    const avgLast3 = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0
    const avgPrev3 = prev3.length > 0 ? prev3.reduce((a, b) => a + b, 0) / prev3.length : 0
    const trendPercentage = avgPrev3 > 0 ? ((avgLast3 - avgPrev3) / avgPrev3) * 100 : 0
    const trend: 'up' | 'down' | 'stable' = trendPercentage > 10 ? 'up' : trendPercentage < -10 ? 'down' : 'stable'
    let predictedNextMonth = averageMonthly
    if (trend === 'up') predictedNextMonth = averageMonthly * 1.05
    else if (trend === 'down') predictedNextMonth = averageMonthly * 0.95
    const variance = amounts.length > 1 ? amounts.reduce((sum, val) => sum + Math.pow(val - averageMonthly, 2), 0) / amounts.length : 0
    const stdDev = Math.sqrt(variance)
    const cv = averageMonthly > 0 ? stdDev / averageMonthly : 0
    const confidence: 'high' | 'medium' | 'low' = cv < 0.3 ? 'high' : cv < 0.6 ? 'medium' : 'low'
    return { category: category.name, categoryId: category.id, averageMonthly, predictedNextMonth, trend, trendPercentage, confidence, history }
  }).filter(f => f.averageMonthly > 0)
  const totalPredicted = forecasts.reduce((sum, f) => sum + f.predictedNextMonth, 0)
  const lastMonthKey = sortedMonths[sortedMonths.length - 1]
  const lastMonthTotal = lastMonthKey ? Object.values(monthsData[lastMonthKey] || {}).reduce((a, b) => a + b, 0) : 0
  const change = totalPredicted - lastMonthTotal
  const changePercentage = lastMonthTotal > 0 ? (change / lastMonthTotal) * 100 : 0
  const topCategories = [...forecasts].sort((a, b) => b.predictedNextMonth - a.predictedNextMonth).slice(0, 5)
  const recommendations: string[] = []
  if (changePercentage > 10) recommendations.push('⚠️ Прогнозируется увеличение расходов на 10%+. Проверьте бюджеты.')
  else if (changePercentage < -10) recommendations.push('✅ Прогнозируется снижение расходов. Отличная динамика!')
  forecasts.forEach(f => {
    if (f.trend === 'up' && f.trendPercentage > 20) recommendations.push(`📈 Расходы в категории "${f.category}" растут (${f.trendPercentage.toFixed(0)}%). Рассмотрите оптимизацию.`)
    if (f.confidence === 'low') recommendations.push(`📊 Прогноз для "${f.category}" имеет низкую точность из-за нестабильных расходов.`)
  })
  if (topCategories.length > 0 && totalPredicted > 0) { const top = topCategories[0]; if (top) { const percentage = (top.predictedNextMonth / totalPredicted) * 100; recommendations.push(`💡 "${top.category}" — крупнейшая статья расходов (${percentage.toFixed(0)}% бюджета).`) } }
  return { totalPredicted, totalLastMonth: lastMonthTotal, change, changePercentage, byCategory: forecasts, topCategories, recommendations }
}

export function getBudgetHealthScore(actual: number, budget: number, forecast: number): { score: number; label: string; color: string } {
  const utilization = budget > 0 ? (actual / budget) * 100 : 0
  const forecastUtilization = budget > 0 ? (forecast / budget) * 100 : 0
  let score = 100
  if (utilization > 100) score -= (utilization - 100) * 2
  if (forecastUtilization > 100) score -= (forecastUtilization - 100)
  if (utilization >= 70 && utilization <= 90) score += 10
  score = Math.max(0, Math.min(100, score))
  const label = score >= 80 ? 'Отлично' : score >= 60 ? 'Нормально' : score >= 40 ? 'Внимание' : 'Критично'
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : score >= 40 ? 'text-orange-500' : 'text-red-500'
  return { score: Math.round(score), label, color }
}