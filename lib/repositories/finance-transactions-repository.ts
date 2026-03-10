import { withDB, type FinanceTransaction, type TransactionType } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import { financeAccountsRepository } from './finance-accounts-repository'

export interface CreateTransactionData {
  accountId: string
  toAccountId?: string
  categoryId?: string
  amount: number
  type: TransactionType
  date: Date
  description?: string
  tags?: string[]
  fee?: number
}

export interface UpdateTransactionData {
  accountId?: string
  toAccountId?: string
  categoryId?: string
  amount?: number
  date?: Date
  description?: string
  tags?: string[]
  fee?: number
}

export interface TransactionFilters {
  type?: TransactionType
  accountId?: string
  categoryId?: string
  startDate?: Date
  endDate?: Date
  searchQuery?: string
}

export class FinanceTransactionsRepository {
  async getById(id: string): Promise<FinanceTransaction | undefined> { return withDB((db) => db.financeTransactions.get(id)) ?? undefined }
  async getAll(): Promise<FinanceTransaction[]> { return withDB((db) => db.financeTransactions.orderBy('date').reverse().toArray()) ?? [] }
  async getActive(): Promise<FinanceTransaction[]> { return filterActive(await this.getAll()) }

  async getFiltered(filters: TransactionFilters): Promise<FinanceTransaction[]> {
    let transactions = await this.getActive()
    if (filters.type) transactions = transactions.filter(t => t.type === filters.type)
    if (filters.accountId) transactions = transactions.filter(t => t.accountId === filters.accountId || (filters.type === 'transfer' && t.toAccountId === filters.accountId))
    if (filters.categoryId) transactions = transactions.filter(t => t.categoryId === filters.categoryId)
    if (filters.startDate) transactions = transactions.filter(t => t.date >= filters.startDate!)
    if (filters.endDate) transactions = transactions.filter(t => t.date <= filters.endDate!)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      transactions = transactions.filter(t => t.description?.toLowerCase().includes(query))
    }
    return transactions
  }

  async getByAccount(accountId: string): Promise<FinanceTransaction[]> {
    const transactions = await withDB((db) => db.financeTransactions.where('accountId').equals(accountId).reverse().toArray()) || []
    return transactions.filter(t => !t.deleted)
  }

  async getRecent(limit: number = 10): Promise<FinanceTransaction[]> {
    const transactions = await this.getActive()
    return transactions.slice(0, limit)
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<FinanceTransaction[]> {
    const transactions = await this.getActive()
    return transactions.filter(t => t.date >= startDate && t.date <= endDate)
  }

  async getTotalsByPeriod(startDate: Date, endDate: Date): Promise<{ income: number; expenses: number; transfers: number }> {
    const transactions = await this.getByDateRange(startDate, endDate)
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount
      else if (t.type === 'expense') acc.expenses += t.amount
      else if (t.type === 'transfer') acc.transfers += t.amount
      return acc
    }, { income: 0, expenses: 0, transfers: 0 })
  }

  async getTotalByCategory(categoryId: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await this.getByDateRange(startDate, endDate)
    return transactions.filter(t => t.categoryId === categoryId && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  }

  async create(data: CreateTransactionData): Promise<string> {
    const now = new Date()
    const id = generateUUID()
    if (data.amount <= 0) throw new Error('Amount must be greater than 0')
    if (data.date > now) throw new Error('Date cannot be in the future')
    const account = await financeAccountsRepository.getById(data.accountId)
    if (!account) throw new Error('Account not found')

    await withDB((db) => db.financeTransactions.add({
      id, accountId: data.accountId, toAccountId: data.toAccountId, categoryId: data.categoryId,
      amount: data.amount, type: data.type, date: data.date, description: data.description,
      tags: data.tags, fee: data.fee, isRecurring: false, createdAt: now, updatedAt: now, synced: false,
    }))

    await this.updateAccountBalance(id, data)
    await this.markForSync(id, 'insert', { ...data, id, isRecurring: false })
    return id
  }

  async update(id: string, data: UpdateTransactionData): Promise<void> {
    const transaction = await this.getById(id)
    if (!transaction) throw new Error('Transaction not found')
    await withDB((db) => db.financeTransactions.update(id, { ...data, updatedAt: new Date() }))
    await this.recalculateAccountBalance(transaction.accountId)
    if (transaction.toAccountId) await this.recalculateAccountBalance(transaction.toAccountId)
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const transaction = await this.getById(id)
    if (!transaction) throw new Error('Transaction not found')
    const tombstone = createTombstone()
    await withDB((db) => db.financeTransactions.update(id, { ...tombstone, synced: false }))
    await this.recalculateAccountBalance(transaction.accountId)
    if (transaction.toAccountId) await this.recalculateAccountBalance(transaction.toAccountId)
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.financeTransactions.delete(id)) }

  private async updateAccountBalance(_transactionId: string, data: CreateTransactionData): Promise<void> {
    const account = await financeAccountsRepository.getById(data.accountId)
    if (!account) return
    let newBalance = account.currentBalance

    if (data.type === 'income') newBalance += data.amount
    else if (data.type === 'expense') newBalance -= data.amount
    else if (data.type === 'transfer') {
      await financeAccountsRepository.updateBalance(data.accountId, newBalance - data.amount)
      if (data.toAccountId) {
        const toAccount = await financeAccountsRepository.getById(data.toAccountId)
        if (toAccount) await financeAccountsRepository.updateBalance(data.toAccountId, toAccount.currentBalance + data.amount)
      }
      if (data.fee && data.fee > 0) newBalance -= data.fee
    }
    await financeAccountsRepository.updateBalance(data.accountId, newBalance)
  }

  private async recalculateAccountBalance(accountId: string): Promise<void> {
    const account = await financeAccountsRepository.getById(accountId)
    if (!account) return
    const transactions = await this.getActive()
    const balance = transactions.reduce((sum, t) => {
      if (t.accountId === accountId) {
        if (t.type === 'income') return sum + t.amount
        if (t.type === 'expense') return sum - t.amount
        if (t.type === 'transfer') return sum - t.amount
      }
      if (t.toAccountId === accountId && t.type === 'transfer') return sum + t.amount
      return sum
    }, account.initialBalance || 0)
    await financeAccountsRepository.updateBalance(accountId, balance)
  }

  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> {
    await withDB((db) => db.syncQueue.add({ id: generateUUID(), table: 'finance_transactions', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() }))
  }

  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.financeTransactions.update(id, { synced: true }))
    const syncRecords = (await withDB((db) => db.syncQueue.where('[table+recordId]').equals(['finance_transactions', id]).and((record) => !record.synced).primaryKeys())) ?? []
    for (const key of syncRecords) await withDB((db) => db.syncQueue.update(key, { synced: true }))
  }
}

export const financeTransactionsRepository = new FinanceTransactionsRepository()