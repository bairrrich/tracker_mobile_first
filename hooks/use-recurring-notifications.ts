import { useEffect } from 'react'
import { useFinancesStore } from '@/store/finances-store'
import { useToast } from '@/hooks/use-toast'

export function useRecurringTransactionNotifications() {
  const toast = useToast()
  const { recurringTransactions, processRecurringTransactions } = useFinancesStore()

  useEffect(() => {
    const checkAndProcessRecurring = async () => {
      try {
        const dueToday = recurringTransactions.filter(t => {
          if (!t.startDate || !t.isActive || t.deleted) return false
          const start = new Date(t.startDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          start.setHours(0, 0, 0, 0)
          if (today < start) return false
          if (t.endDate && today > new Date(t.endDate)) return false
          const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          if (t.lastProcessed) {
            const lastProcessed = new Date(t.lastProcessed)
            lastProcessed.setHours(0, 0, 0, 0)
            if (lastProcessed.getTime() === today.getTime()) return false
          }
          switch (t.frequency) {
            case 'daily': return true
            case 'weekly': return daysDiff % 7 === 0
            case 'monthly': return start.getDate() === today.getDate()
            case 'yearly': return start.getDate() === today.getDate() && start.getMonth() === today.getMonth()
            default: return false
          }
        })

        if (dueToday.length > 0) {
          toast.info({ title: 'Повторяющиеся транзакции', description: `Сегодня должно исполниться ${dueToday.length} транзакция(ий)` })
          await processRecurringTransactions()
          toast.success({ title: 'Готово', description: `Обработано ${dueToday.length} повторяющихся транзакций` })
        }
      } catch (error) {
        toast.error({ title: 'Ошибка', description: 'Не удалось обработать повторяющиеся транзакции' })
      }
    }

    checkAndProcessRecurring()
    const interval = setInterval(checkAndProcessRecurring, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [recurringTransactions, processRecurringTransactions, toast])

  return null
}