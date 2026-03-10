import { withDB, type FinanceBudget, type BudgetPeriod } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import { financeTransactionsRepository } from './finance-transactions-repository'

export interface CreateBudgetData { categoryId: string; period: BudgetPeriod; amount: number; month?: number; year?: number }
export interface UpdateBudgetData { categoryId?: string; period?: BudgetPeriod; amount?: number; month?: number; year?: number }

export class FinanceBudgetsRepository {
  async getById(id: string): Promise<FinanceBudget | undefined> { return withDB((db) => db.financeBudgets.get(id)) ?? undefined }
  async getAll(): Promise<FinanceBudget[]> { return withDB((db) => db.financeBudgets.orderBy('createdAt').toArray()) ?? [] }
  async getActive(): Promise<FinanceBudget[]> { return filterActive(await this.getAll()) }
  async getByCategory(categoryId: string): Promise<FinanceBudget[]> {
    const budgets = await withDB((db) => db.financeBudgets.where('categoryId').equals(categoryId).toArray()) || []
    return budgets.filter(b => !b.deleted)
  }
  async getBudgetForMonth(categoryId: string, month: number, year: number): Promise<FinanceBudget | undefined> {
    const budgets = await this.getByCategory(categoryId)
    return budgets.find(b => b.month === month && b.year === year && !b.deleted)
  }
  async getCurrentMonthBudget(categoryId: string): Promise<FinanceBudget | undefined> {
    const now = new Date()
    return this.getBudgetForMonth(categoryId, now.getMonth() + 1, now.getFullYear())
  }
  async updateSpent(id: string, spent: number): Promise<void> { await withDB((db) => db.financeBudgets.update(id, { spent })) }

  async recalculateAllSpent(): Promise<void> {
    const budgets = await this.getActive()
    const now = new Date()
    for (const budget of budgets) {
      const startDate = new Date(now.getFullYear(), budget.month ? budget.month - 1 : 0, 1)
      const endDate = new Date(now.getFullYear(), budget.month ? budget.month : 11, 0)
      const spent = await financeTransactionsRepository.getTotalByCategory(budget.categoryId, startDate, endDate)
      await this.updateSpent(budget.id, spent)
    }
  }

  async create(data: CreateBudgetData): Promise<string> {
    if (data.amount <= 0) throw new Error('Budget amount must be greater than 0')
    const now = new Date()
    const id = generateUUID()
    await withDB((db) => db.financeBudgets.add({ id, categoryId: data.categoryId, period: data.period, amount: data.amount, spent: 0, month: data.month, year: data.year, createdAt: now, updatedAt: now, synced: false }))
    await this.markForSync(id, 'insert', { ...data, id, spent: 0 })
    return id
  }

  async update(id: string, data: UpdateBudgetData): Promise<void> {
    const budget = await this.getById(id)
    if (!budget) throw new Error('Budget not found')
    await withDB((db) => db.financeBudgets.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const budget = await this.getById(id)
    if (!budget) throw new Error('Budget not found')
    const tombstone = createTombstone()
    await withDB((db) => db.financeBudgets.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.financeBudgets.delete(id)) }

  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> {
    await withDB((db) => db.syncQueue.add({ id: generateUUID(), table: 'finance_budgets', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() }))
  }

  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.financeBudgets.update(id, { synced: true }))
    const syncRecords = (await withDB((db) => db.syncQueue.where('[table+recordId]').equals(['finance_budgets', id]).and((record) => !record.synced).primaryKeys())) ?? []
    for (const key of syncRecords) await withDB((db) => db.syncQueue.update(key, { synced: true }))
  }
}

export const financeBudgetsRepository = new FinanceBudgetsRepository()