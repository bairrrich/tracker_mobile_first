import { withDB, type FinanceSavingsGoal, type GoalStatus } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export interface CreateSavingsGoalData {
  name: string
  targetAmount: number
  currentAmount?: number
  accountId?: string
  deadline?: Date
  icon?: string
  color?: string
  description?: string
}

export interface UpdateSavingsGoalData {
  name?: string
  targetAmount?: number
  currentAmount?: number
  accountId?: string
  deadline?: Date
  icon?: string
  color?: string
  description?: string
  status?: GoalStatus
}

export class FinanceSavingsGoalsRepository {
  async getById(id: string): Promise<FinanceSavingsGoal | undefined> { return withDB((db) => db.finance_savings_goals.get(id)) ?? undefined }
  async getAll(): Promise<FinanceSavingsGoal[]> { return withDB((db) => db.finance_savings_goals.orderBy('createdAt').reverse().toArray()) ?? [] }
  async getActive(): Promise<FinanceSavingsGoal[]> { return filterActive(await this.getAll()) }
  async getByStatus(status: GoalStatus): Promise<FinanceSavingsGoal[]> { const goals = await withDB((db) => db.finance_savings_goals.where('status').equals(status).reverse().toArray()) || []; return goals.filter(g => !g.deleted) }

  async create(data: CreateSavingsGoalData): Promise<string> {
    if (data.targetAmount <= 0) throw new Error('Target amount must be greater than 0')
    const now = new Date()
    const id = generateUUID()
    await withDB((db) => db.finance_savings_goals.add({ id, name: data.name, targetAmount: data.targetAmount, currentAmount: data.currentAmount || 0, accountId: data.accountId, deadline: data.deadline, status: 'active', icon: data.icon, color: data.color, description: data.description, createdAt: now, updatedAt: now, synced: false }))
    await this.markForSync(id, 'insert', { ...data, id, status: 'active' })
    return id
  }

  async update(id: string, data: UpdateSavingsGoalData): Promise<void> {
    const goal = await this.getById(id)
    if (!goal) throw new Error('Savings goal not found')
    await withDB((db) => db.finance_savings_goals.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async updateCurrentAmount(id: string, amount: number): Promise<void> {
    const goal = await this.getById(id)
    if (!goal) throw new Error('Savings goal not found')
    await withDB((db) => db.finance_savings_goals.update(id, { currentAmount: amount, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { currentAmount: amount, updatedAt: new Date() })
  }

  async addToCurrentAmount(id: string, amount: number): Promise<void> {
    const goal = await this.getById(id)
    if (!goal) throw new Error('Savings goal not found')
    await this.updateCurrentAmount(id, goal.currentAmount + amount)
  }

  async delete(id: string): Promise<void> {
    const goal = await this.getById(id)
    if (!goal) throw new Error('Savings goal not found')
    const tombstone = createTombstone()
    await withDB((db) => db.finance_savings_goals.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.finance_savings_goals.delete(id)) }
  async toggleStatus(id: string): Promise<void> { const goal = await this.getById(id); if (!goal) throw new Error('Savings goal not found'); const newStatus: GoalStatus = goal.status === 'active' ? 'paused' : 'active'; await withDB((db) => db.finance_savings_goals.update(id, { status: newStatus, updatedAt: new Date() })); await this.markForSync(id, 'update', { status: newStatus, updatedAt: new Date() }) }
  async markAsCompleted(id: string): Promise<void> { await withDB((db) => db.finance_savings_goals.update(id, { status: 'completed', updatedAt: new Date() })); await this.markForSync(id, 'update', { status: 'completed', updatedAt: new Date() }) }

  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> { await withDB((db) => db.sync_queue.add({ id: generateUUID(), table: 'finance_savings_goals', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() })) }
  async markAsSynced(id: string): Promise<void> { await withDB((db) => db.finance_savings_goals.update(id, { synced: true })); const syncRecords = (await withDB((db) => db.sync_queue.where('[table+recordId]').equals(['finance_savings_goals', id]).and((record) => !record.synced).primaryKeys())) ?? []; for (const key of syncRecords) await withDB((db) => db.sync_queue.update(key, { synced: true })) }
}

export const financeSavingsGoalsRepository = new FinanceSavingsGoalsRepository()