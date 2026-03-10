'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, TrendingUp, TrendingDown, Wallet, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useFinancesStore } from '@/store/finances-store'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns'
import { analyzeTransactionHistory, type ForecastSummary } from '@/lib/budget-forecast'
import { BudgetForecastPanel } from '@/components/finances/budget-forecast-panel'
import type { FinanceTransaction, FinanceCategory } from '@/lib/db'

export default function FinanceReportsPage() {
  const t = useTranslations('Finances')
  const { transactions, categories, accounts, fetchTransactions, fetchCategories, fetchAccounts } = useFinancesStore()
  const [period, setPeriod] = React.useState<'month' | 'week' | 'year' | 'custom'>('month')
  const [customDateRange, setCustomDateRange] = React.useState({ start: '', end: '' })
  const [forecast, setForecast] = React.useState<ForecastSummary | null>(null)

  React.useEffect(() => {
    const initData = async () => {
      await fetchAccounts()
      await fetchCategories()
      await fetchTransactions()
    }
    initData()
  }, [])

  React.useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      const f = analyzeTransactionHistory(transactions, categories.map(c => ({ id: c.id, name: c.name })))
      setForecast(f)
    }
  }, [transactions, categories])

  const getDateRange = () => {
    const now = new Date()
    switch (period) {
      case 'month': return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'week': return { start: startOfWeek(now), end: endOfWeek(now) }
      case 'year': return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom': return {
        start: customDateRange.start ? new Date(customDateRange.start) : startOfMonth(now),
        end: customDateRange.end ? new Date(customDateRange.end) : endOfMonth(now),
      }
    }
  }

  const getFilteredTransactions = () => {
    const { start, end } = getDateRange()
    return transactions.filter((t: FinanceTransaction) => {
      const date = new Date(t.date)
      return date >= start && date <= end && !t.deleted
    })
  }

  const calculateTotals = () => {
    const filtered = getFilteredTransactions()
    return filtered.reduce((acc, t: FinanceTransaction) => {
      if (t.type === 'income') acc.income += t.amount
      else if (t.type === 'expense') acc.expenses += t.amount
      return acc
    }, { income: 0, expenses: 0 })
  }

  const getCategoryData = () => {
    const filtered = getFilteredTransactions().filter((t: FinanceTransaction) => t.type === 'expense' && t.categoryId)
    const categoryTotals: { [key: string]: number } = {}
    filtered.forEach((t: FinanceTransaction) => {
      if (t.categoryId) categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount
    })
    return Object.entries(categoryTotals).map(([categoryId, value]) => {
      const category = categories.find((c: FinanceCategory) => c.id === categoryId)
      return { name: category?.name || 'Без категории', value, color: category?.color || '#64748b' }
    }).sort((a, b) => b.value - a.value)
  }

  const getDailyData = () => {
    const { start, end } = getDateRange()
    const days = eachDayOfInterval({ start, end })
    const filtered = getFilteredTransactions()
    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTransactions = filtered.filter((t: FinanceTransaction) => format(new Date(t.date), 'yyyy-MM-dd') === dayStr)
      const income = dayTransactions.filter((t: FinanceTransaction) => t.type === 'income').reduce((sum: number, t: FinanceTransaction) => sum + t.amount, 0)
      const expenses = dayTransactions.filter((t: FinanceTransaction) => t.type === 'expense').reduce((sum: number, t: FinanceTransaction) => sum + t.amount, 0)
      return { date: format(day, 'dd.MM'), income, expenses }
    })
  }

  const totals = calculateTotals()
  const categoryData = getCategoryData()
  const dailyData = getDailyData()
  const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4', '#84cc16']

  const exportToCSV = () => {
    const filtered = getFilteredTransactions()
    const headers = ['Дата', 'Тип', 'Категория', 'Счёт', 'Сумма', 'Описание']
    const rows = filtered.map((t: FinanceTransaction) => {
      const category = categories.find((c: FinanceCategory) => c.id === t.categoryId)
      const account = accounts.find((a: any) => a.id === t.accountId)
      const typeLabel = t.type === 'income' ? 'Доход' : t.type === 'expense' ? 'Расход' : 'Перевод'
      return [format(new Date(t.date), 'dd.MM.yyyy'), typeLabel, category?.name || '', account?.name || '', t.amount.toString(), t.description || ''].map(v => `"${v}"`).join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value)

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/finances">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('reports')}</h1>
              <p className="text-[var(--text-muted)]">{t('description')}</p>
            </div>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            {t('exportCSV')}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('monthly')}</SelectItem>
              <SelectItem value="week">{t('weekly')}</SelectItem>
              <SelectItem value="year">{t('yearly')}</SelectItem>
              <SelectItem value="custom">{t('filterByDate')}</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
            <div className="flex gap-2">
              <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} className="border rounded px-3 py-2 bg-[var(--card)] text-[var(--text)]" />
              <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} className="border rounded px-3 py-2 bg-[var(--card)] text-[var(--text)]" />
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('income')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">+{formatCurrency(totals.income)}</div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('expense')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">-{formatCurrency(totals.expenses)}</div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Баланс</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.income - totals.expenses)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
            <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
            <TabsTrigger value="balance">Динамика</TabsTrigger>
            <TabsTrigger value="forecast">Прогноз</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader><CardTitle>{t('expenseCategories')}</CardTitle></CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">{t('noTransactionsFound')}</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {categoryData.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-[var(--border)]">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }} />
                            <span>{category.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily">
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader><CardTitle>Доходы и расходы по дням</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" name={t('income')} />
                    <Bar dataKey="expenses" fill="#ef4444" name={t('expense')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance">
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader><CardTitle>Динамика баланса</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name={t('income')} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name={t('expense')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            {forecast ? (
              <BudgetForecastPanel forecast={forecast} />
            ) : (
              <Card className="bg-[var(--card)] border-[var(--border)]">
                <CardContent className="text-center py-12">
                  <p className="text-[var(--text-muted)]">Недостаточно данных для прогноза</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}