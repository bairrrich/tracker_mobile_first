import { withDB, type FinanceRecurringTransaction, type RecurringFrequency, type TransactionType } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import { financeTransactionsRepository } from './finance-transactions-repository'

export interface CreateRecurringTransactionData {
  accountId: string; toAccountId?: string; categoryId?: string; amount: number;
  type: TransactionType; frequency: RecurringFrequency; startDate: Date; endDate?: Date; description?: string
}
export interface UpdateRecurringTransactionData {
  accountId?: string; toAccountId?: string; categoryId?: string; amount?: number;
  type?: TransactionType; frequency?: RecurringFrequency; startDate?: Date; endDate?: Date; description?: string; isActive?: boolean
}

export class FinanceRecurringTransactionsRepository {
  async getById(id: string): Promise<FinanceRecurringTransaction | undefined> { return withDB((db) => db.financeRecurringTransactions.get(id)) ?? undefined }
  async getAll(): Promise<FinanceRecurringTransaction[]> { return withDB((db) => db.financeRecurringTransactions.orderBy('createdAt').toArray()) ?? [] }
  async getActive(): Promise<FinanceRecurringTransaction[]> { return filterActive(await this.getAll()).filter(t => t.isActive) }

  async getDueToday(): Promise<FinanceRecurringTransaction[]> {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const transactions = await this.getActive()
    return transactions.filter(t => {
      if (!t.startDate) return false
      const startDate = new Date(t.startDate); startDate.setHours(0, 0, 0, 0)
      if (today < startDate) return false
      if (t.endDate && today > new Date(t.endDate)) return false
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      switch (t.frequency) {
        case 'daily': return true
        case 'weekly': return daysDiff % 7 === 0
        case 'monthly': return startDate.getDate() === today.getDate()
        case 'yearly': return startDate.getDate() === today.getDate() && startDate.getMonth() === today.getMonth()
        default: return false
      }
    })
  }

  async processRecurringTransaction(id: string): Promise<string | null> {
    const recurring = await this.getById(id)
    if (!recurring || !recurring.isActive || recurring.deleted) return null
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const transactionId = await financeTransactionsRepository.create({
      accountId: recurring.accountId, toAccountId: recurring.toAccountId, categoryId: recurring.categoryId,
      amount: recurring.amount, type: recurring.type, date: today, description: recurring.description,
    })
    await withDB((db) => db.financeRecurringTransactions.update(id, { lastProcessed: today, updatedAt: today }))
    return transactionId
  }

  async processAllDue(): Promise<string[]> {
    const dueTransactions = await this.getDueToday()
    const processedIds: string[] = []
    for (const t of dueTransactions) {
      const transactionId = await this.processRecurringTransaction(t.id)
      if (transactionId) processedIds.push(transactionId)
    }
    return processedIds
  }

  async create(data: CreateRecurringTransactionData): Promise<string> {
    if (data.amount <= 0) throw new Error('Amount must be greater than 0')
    const now = new Date()
    const id = generateUUID()
    await withDB((db) => db.financeRecurringTransactions.add({
      id, accountId: data.accountId, toAccountId: data.toAccountId, categoryId: data.categoryId,
      amount: data.amount, type: data.type, frequency: data.frequency, startDate: data.startDate,
      endDate: data.endDate, description: data.description, isActive: true, createdAt: now, updatedAt: now, synced: false,
    }))
    await this.markForSync(id, 'insert', { ...data, id, isActive: true })
    return id
  }

  async update(id: string, data: UpdateRecurringTransactionData): Promise<void> {
    const recurring = await this.getById(id)
    if (!recurring) throw new Error('Recurring transaction not found')
    await withDB((db) => db.financeRecurringTransactions.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async toggleActive(id: string): Promise<void> {
    const recurring = await this.getById(id)
    if (!recurring) throw new Error('Recurring transaction not found')
    await withDB((db) => db.financeRecurringTransactions.update(id, { isActive: !recurring.isActive, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { isActive: !recurring.isActive })
  }

  async delete(id: string): Promise<void> {
    const recurring = await this.getById(id)
    if (!recurring) throw new Error('Recurring transaction not found')
    const tombstone = createTombstone()
    await withDB((db) => db.financeRecurringTransactions.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.financeRecurringTransactions.delete(id)) }

  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> {
    await withDB((db) => db.syncQueue.add({ id: generateUUID(), table: 'finance_recurring_transactions', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() }))
  }

  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.financeRecurringTransactions.update(id, { synced: true }))
    const syncRecords = (await withDB((db) => db.syncQueue.where('[table+recordId]').equals(['finance_recurring_transactions', id]).and((record) => !record.synced).primaryKeys())) ?? []
    for (const key of syncRecords) await withDB((db) => db.syncQueue.update(key, { synced: true }))
  }
}

export const financeRecurringTransactionsRepository = new FinanceRecurringTransactionsRepository()