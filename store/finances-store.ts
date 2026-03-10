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
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
  FinanceBudget,
  FinanceRecurringTransaction,
  FinanceSavingsGoal,
} from '@/lib/db'

interface FinancesState {
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
  transactions: FinanceTransaction[]
  budgets: FinanceBudget[]
  recurringTransactions: FinanceRecurringTransaction[]
  savingsGoals: FinanceSavingsGoal[]
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