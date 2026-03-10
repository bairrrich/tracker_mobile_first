import { useEffect } from 'react'
import { useFinancesStore } from '@/store/finances-store'
import { useToast } from '@/hooks/use-toast'

export function useBudgetAlerts() {
  const toast = useToast()
  const { budgets, categories } = useFinancesStore()

  useEffect(() => {
    const checkBudgets = () => {
      budgets.forEach(budget => {
        if (budget.amount <= 0) return
        const percentage = (budget.spent / budget.amount) * 100
        const category = categories.find(c => c.id === budget.categoryId)
        const categoryName = category?.name || 'Категория'
        if (percentage >= 100 && percentage < 101) { toast.warning({ title: 'Бюджет превышен!', description: `Превышен бюджет для "${categoryName}"` }) }
        else if (percentage >= 90 && percentage < 91) { toast.warning({ title: 'Внимание! Бюджет', description: `Использовано 90% бюджета для "${categoryName}"` }) }
        else if (percentage >= 80 && percentage < 81) { toast.info({ title: 'Бюджет', description: `Использовано 80% бюджета для "${categoryName}"` }) }
      })
    }
    checkBudgets()
    const interval = setInterval(checkBudgets, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [budgets, categories, toast])

  return null
}