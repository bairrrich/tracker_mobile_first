import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  financeAccountsRepository,
  type CreateAccountData,
  type UpdateAccountData,
} from '@/lib/repositories/finance-accounts-repository'
import {
  financeCategoriesRepository,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '@/lib/repositories/finance-categories-repository'
import {
  financeTransactionsRepository,
  type CreateTransactionData,
  type UpdateTransactionData,
  type TransactionFilters,
} from '@/lib/repositories/finance-transactions-repository'
import {
  financeBudgetsRepository,
  type CreateBudgetData,
  type UpdateBudgetData,
} from '@/lib/repositories/finance-budgets-repository'
import {
  financeRecurringTransactionsRepository,
  type CreateRecurringTransactionData,
  type UpdateRecurringTransactionData,
} from '@/lib/repositories/finance-recurring-transactions-repository'
import {
  financeSavingsGoalsRepository,
  type CreateSavingsGoalData,
  type UpdateSavingsGoalData,
} from '@/lib/repositories/finance-savings-goals-repository'
import {
  supplementsRepository,
  type CreateSupplementData,
  type UpdateSupplementData,
} from '@/lib/repositories/supplements-repository'
import {
  supplementInventoryRepository,
  type CreateInventoryData,
  type UpdateInventoryData,
} from '@/lib/repositories/supplement-inventory-repository'
import {
  supplementSchedulesRepository,
  type CreateScheduleData,
  type UpdateScheduleData,
} from '@/lib/repositories/supplement-schedules-repository'
import {
  supplementLogsRepository,
  type CreateLogData,
  type UpdateLogData,
} from '@/lib/repositories/supplement-logs-repository'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
  FinanceBudget,
  FinanceRecurringTransaction,
  FinanceSavingsGoal,
  Supplement,
  SupplementInventory,
  SupplementSchedule,
  SupplementLog,
} from '@/lib/db'

interface FinancesState {
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
  transactions: FinanceTransaction[]
  budgets: FinanceBudget[]
  recurringTransactions: FinanceRecurringTransaction[]
  savingsGoals: FinanceSavingsGoal[]
  supplements: Supplement[]
  supplementInventory: SupplementInventory[]
  supplementSchedules: SupplementSchedule[]
  supplementLogs: SupplementLog[]
  filters: TransactionFilters
  selectedAccount: FinanceAccount | null
  selectedTransaction: FinanceTransaction | null
  isLoading: boolean
  error: string | null
  totalBalance: number
  totalBalanceByCurrency: Record<string, number>
  monthlyIncome: number
  monthlyExpenses: number
  fetchAccounts: () => Promise<void>
  addAccount: (data: CreateAccountData) => Promise<string>
  updateAccount: (id: string, data: UpdateAccountData) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  selectAccount: (account: FinanceAccount | null) => void
  fetchCategories: () => Promise<void>
  addCategory: (data: CreateCategoryData) => Promise<string>
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  initializePredefinedCategories: () => Promise<void>
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>
  addTransaction: (data: CreateTransactionData) => Promise<string>
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  selectTransaction: (transaction: FinanceTransaction | null) => void
  setFilters: (filters: TransactionFilters) => void
  fetchBudgets: () => Promise<void>
  addBudget: (data: CreateBudgetData) => Promise<string>
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  recalculateBudgets: () => Promise<void>
  fetchRecurringTransactions: () => Promise<void>
  addRecurringTransaction: (data: CreateRecurringTransactionData) => Promise<string>
  updateRecurringTransaction: (id: string, data: UpdateRecurringTransactionData) => Promise<void>
  deleteRecurringTransaction: (id: string) => Promise<void>
  toggleRecurringTransaction: (id: string) => Promise<void>
  processRecurringTransactions: () => Promise<void>
  fetchSavingsGoals: () => Promise<void>
  addSavingsGoal: (data: CreateSavingsGoalData) => Promise<string>
  updateSavingsGoal: (id: string, data: UpdateSavingsGoalData) => Promise<void>
  deleteSavingsGoal: (id: string) => Promise<void>
  fetchSupplements: () => Promise<void>
  addSupplement: (data: CreateSupplementData) => Promise<string>
  updateSupplement: (id: string, data: UpdateSupplementData) => Promise<void>
  deleteSupplement: (id: string) => Promise<void>
  toggleSupplement: (id: string) => Promise<void>
  fetchInventory: () => Promise<void>
  addInventory: (data: CreateInventoryData) => Promise<string>
  updateInventory: (id: string, data: UpdateInventoryData) => Promise<void>
  deleteInventory: (id: string) => Promise<void>
  fetchSchedules: () => Promise<void>
  addSchedule: (data: CreateScheduleData) => Promise<string>
  updateSchedule: (id: string, data: UpdateScheduleData) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  toggleSchedule: (id: string) => Promise<void>
  fetchLogs: () => Promise<void>
  addLog: (data: CreateLogData) => Promise<string>
  updateLog: (id: string, data: UpdateLogData) => Promise<void>
  deleteLog: (id: string) => Promise<void>
  getLogStats: (supplementId: string, days?: number) => Promise<{ total: number, taken: number, skipped: number, missed: number, compliance: number }>
  calculateSummary: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const INITIAL_FILTERS: TransactionFilters = {}

export const useFinancesStore = create<FinancesState>()(
  subscribeWithSelector((set, get) => ({
    accounts: [],
    categories: [],
    transactions: [],
    budgets: [],
    recurringTransactions: [],
    savingsGoals: [],
    supplements: [],
    supplementInventory: [],
    supplementSchedules: [],
    supplementLogs: [],
    filters: INITIAL_FILTERS,
    selectedAccount: null,
    selectedTransaction: null,
    isLoading: false,
    error: null,
    totalBalance: 0,
    totalBalanceByCurrency: {},
    monthlyIncome: 0,
    monthlyExpenses: 0,

    fetchAccounts: async () => {
      set({ isLoading: true, error: null })
      try {
        const accounts = await financeAccountsRepository.getActive()
        set({ accounts, isLoading: false })
        await get().calculateSummary()
      } catch (error) {
        set({ error: 'Failed to fetch accounts', isLoading: false })
      }
    },

    addAccount: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await financeAccountsRepository.create(data)
        await get().fetchAccounts()
        return id
      } catch (error) {
        set({ error: 'Failed to add account', isLoading: false })
        throw error
      }
    },

    updateAccount: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await financeAccountsRepository.update(id, data)
        await get().fetchAccounts()
      } catch (error) {
        set({ error: 'Failed to update account', isLoading: false })
        throw error
      }
    },

    deleteAccount: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await financeAccountsRepository.delete(id)
        await get().fetchAccounts()
        if (get().selectedAccount?.id === id) set({ selectedAccount: null })
      } catch (error) {
        set({ error: 'Failed to delete account', isLoading: false })
        throw error
      }
    },

    selectAccount: (account) => set({ selectedAccount: account }),

    fetchCategories: async () => {
      set({ isLoading: true, error: null })
      try {
        const categories = await financeCategoriesRepository.getActive()
        set({ categories, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch categories', isLoading: false })
      }
    },

    addCategory: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await financeCategoriesRepository.create(data)
        await get().fetchCategories()
        return id
      } catch (error) {
        set({ error: 'Failed to add category', isLoading: false })
        throw error
      }
    },

    updateCategory: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await financeCategoriesRepository.update(id, data)
        await get().fetchCategories()
      } catch (error) {
        set({ error: 'Failed to update category', isLoading: false })
        throw error
      }
    },

    deleteCategory: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await financeCategoriesRepository.delete(id)
        await get().fetchCategories()
      } catch (error) {
        set({ error: 'Failed to delete category', isLoading: false })
        throw error
      }
    },

    initializePredefinedCategories: async () => {
      await financeCategoriesRepository.initializePredefinedCategories()
      await get().fetchCategories()
    },

    fetchTransactions: async (filters) => {
      set({ isLoading: true, error: null })
      try {
        const currentFilters = filters || get().filters
        const transactions = await financeTransactionsRepository.getFiltered(currentFilters)
        set({ transactions, isLoading: false, filters: currentFilters })
        await get().calculateSummary()
      } catch (error) {
        set({ error: 'Failed to fetch transactions', isLoading: false })
      }
    },

    addTransaction: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await financeTransactionsRepository.create(data)
        await get().fetchTransactions()
        await get().recalculateBudgets()
        return id
      } catch (error) {
        set({ error: 'Failed to add transaction', isLoading: false })
        throw error
      }
    },

    updateTransaction: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await financeTransactionsRepository.update(id, data)
        await get().fetchTransactions()
        await get().recalculateBudgets()
      } catch (error) {
        set({ error: 'Failed to update transaction', isLoading: false })
        throw error
      }
    },

    deleteTransaction: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await financeTransactionsRepository.delete(id)
        await get().fetchTransactions()
        await get().recalculateBudgets()
        if (get().selectedTransaction?.id === id) set({ selectedTransaction: null })
      } catch (error) {
        set({ error: 'Failed to delete transaction', isLoading: false })
        throw error
      }
    },

    selectTransaction: (transaction) => set({ selectedTransaction: transaction }),
    setFilters: (filters) => { set({ filters }); get().fetchTransactions(filters) },

    fetchBudgets: async () => {
      set({ isLoading: true, error: null })
      try {
        const budgets = await financeBudgetsRepository.getActive()
        set({ budgets, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch budgets', isLoading: false })
      }
    },

    addBudget: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await financeBudgetsRepository.create(data)
        await get().fetchBudgets()
        return id
      } catch (error) {
        set({ error: 'Failed to add budget', isLoading: false })
        throw error
      }
    },

    updateBudget: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await financeBudgetsRepository.update(id, data)
        await get().fetchBudgets()
      } catch (error) {
        set({ error: 'Failed to update budget', isLoading: false })
        throw error
      }
    },

    deleteBudget: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await financeBudgetsRepository.delete(id)
        await get().fetchBudgets()
      } catch (error) {
        set({ error: 'Failed to delete budget', isLoading: false })
        throw error
      }
    },

    recalculateBudgets: async () => {
      await financeBudgetsRepository.recalculateAllSpent()
      await get().fetchBudgets()
    },

    fetchRecurringTransactions: async () => {
      set({ isLoading: true, error: null })
      try {
        const recurring = await financeRecurringTransactionsRepository.getActive()
        set({ recurringTransactions: recurring, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch recurring transactions', isLoading: false })
      }
    },

    addRecurringTransaction: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await financeRecurringTransactionsRepository.create(data)
        await get().fetchRecurringTransactions()
        return id
      } catch (error) {
        set({ error: 'Failed to add recurring transaction', isLoading: false })
        throw error
      }
    },

    updateRecurringTransaction: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await financeRecurringTransactionsRepository.update(id, data)
        await get().fetchRecurringTransactions()
      } catch (error) {
        set({ error: 'Failed to update recurring transaction', isLoading: false })
        throw error
      }
    },

    deleteRecurringTransaction: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await financeRecurringTransactionsRepository.delete(id)
        await get().fetchRecurringTransactions()
      } catch (error) {
        set({ error: 'Failed to delete recurring transaction', isLoading: false })
        throw error
      }
    },

    toggleRecurringTransaction: async (id) => {
      try {
        await financeRecurringTransactionsRepository.toggleActive(id)
        await get().fetchRecurringTransactions()
      } catch (error) {
        set({ error: 'Failed to toggle recurring transaction' })
      }
    },

    processRecurringTransactions: async () => {
      try {
        await financeRecurringTransactionsRepository.processAllDue()
        await get().fetchTransactions()
        await get().calculateSummary()
      } catch (error) {
        set({ error: 'Failed to process recurring transactions' })
      }
    },

    fetchSavingsGoals: async () => {
      set({ isLoading: true, error: null })
      try {
        const savingsGoals = await financeSavingsGoalsRepository.getActive()
        set({ savingsGoals, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch savings goals', isLoading: false })
      }
    },

    addSavingsGoal: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await financeSavingsGoalsRepository.create(data)
        await get().fetchSavingsGoals()
        return id
      } catch (error) {
        set({ error: 'Failed to add savings goal', isLoading: false })
        throw error
      }
    },

    updateSavingsGoal: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await financeSavingsGoalsRepository.update(id, data)
        await get().fetchSavingsGoals()
      } catch (error) {
        set({ error: 'Failed to update savings goal', isLoading: false })
        throw error
      }
    },

    deleteSavingsGoal: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await financeSavingsGoalsRepository.delete(id)
        await get().fetchSavingsGoals()
      } catch (error) {
        set({ error: 'Failed to delete savings goal', isLoading: false })
        throw error
      }
    },

    fetchSupplements: async () => {
      set({ isLoading: true, error: null })
      try {
        const supplements = await supplementsRepository.getActive()
        set({ supplements, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch supplements', isLoading: false })
      }
    },

    addSupplement: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await supplementsRepository.create(data)
        await get().fetchSupplements()
        return id
      } catch (error) {
        set({ error: 'Failed to add supplement', isLoading: false })
        throw error
      }
    },

    updateSupplement: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await supplementsRepository.update(id, data)
        await get().fetchSupplements()
      } catch (error) {
        set({ error: 'Failed to update supplement', isLoading: false })
        throw error
      }
    },

    deleteSupplement: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await supplementsRepository.delete(id)
        await get().fetchSupplements()
      } catch (error) {
        set({ error: 'Failed to delete supplement', isLoading: false })
        throw error
      }
    },

    toggleSupplement: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await supplementsRepository.toggleActive(id)
        await get().fetchSupplements()
      } catch (error) {
        set({ error: 'Failed to toggle supplement', isLoading: false })
        throw error
      }
    },

    fetchInventory: async () => {
      set({ isLoading: true, error: null })
      try {
        const inventory = await supplementInventoryRepository.getActive()
        set({ supplementInventory: inventory, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch inventory', isLoading: false })
      }
    },

    addInventory: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await supplementInventoryRepository.create(data)
        await get().fetchInventory()
        return id
      } catch (error) {
        set({ error: 'Failed to add inventory', isLoading: false })
        throw error
      }
    },

    updateInventory: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await supplementInventoryRepository.update(id, data)
        await get().fetchInventory()
      } catch (error) {
        set({ error: 'Failed to update inventory', isLoading: false })
        throw error
      }
    },

    deleteInventory: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await supplementInventoryRepository.delete(id)
        await get().fetchInventory()
      } catch (error) {
        set({ error: 'Failed to delete inventory', isLoading: false })
        throw error
      }
    },

    fetchSchedules: async () => {
      set({ isLoading: true, error: null })
      try {
        const schedules = await supplementSchedulesRepository.getActive()
        set({ supplementSchedules: schedules, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch schedules', isLoading: false })
      }
    },

    addSchedule: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await supplementSchedulesRepository.create(data)
        await get().fetchSchedules()
        return id
      } catch (error) {
        set({ error: 'Failed to add schedule', isLoading: false })
        throw error
      }
    },

    updateSchedule: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await supplementSchedulesRepository.update(id, data)
        await get().fetchSchedules()
      } catch (error) {
        set({ error: 'Failed to update schedule', isLoading: false })
        throw error
      }
    },

    deleteSchedule: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await supplementSchedulesRepository.delete(id)
        await get().fetchSchedules()
      } catch (error) {
        set({ error: 'Failed to delete schedule', isLoading: false })
        throw error
      }
    },

    toggleSchedule: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await supplementSchedulesRepository.toggleActive(id)
        await get().fetchSchedules()
      } catch (error) {
        set({ error: 'Failed to toggle schedule', isLoading: false })
        throw error
      }
    },

    fetchLogs: async () => {
      set({ isLoading: true, error: null })
      try {
        const logs = await supplementLogsRepository.getActive()
        set({ supplementLogs: logs, isLoading: false })
      } catch (error) {
        set({ error: 'Failed to fetch logs', isLoading: false })
      }
    },

    addLog: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await supplementLogsRepository.create(data)
        await get().fetchLogs()
        return id
      } catch (error) {
        set({ error: 'Failed to add log', isLoading: false })
        throw error
      }
    },

    updateLog: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await supplementLogsRepository.update(id, data)
        await get().fetchLogs()
      } catch (error) {
        set({ error: 'Failed to update log', isLoading: false })
        throw error
      }
    },

    deleteLog: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await supplementLogsRepository.delete(id)
        await get().fetchLogs()
      } catch (error) {
        set({ error: 'Failed to delete log', isLoading: false })
        throw error
      }
    },

    getLogStats: async (supplementId, days = 30) => {
      return await supplementLogsRepository.getStats(supplementId, days)
    },

    calculateSummary: async () => {
      try {
        const [totalBalance, totalBalanceByCurrency] = await Promise.all([
          financeAccountsRepository.getTotalBalance(),
          financeAccountsRepository.getTotalBalanceByCurrency(),
        ])
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const totals = await financeTransactionsRepository.getTotalsByPeriod(startDate, endDate)
        set({ totalBalance, totalBalanceByCurrency, monthlyIncome: totals.income, monthlyExpenses: totals.expenses })
      } catch (error) { console.error('Failed to calculate summary:', error) }
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }))
)