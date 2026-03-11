import { withDB, type FinanceCategory, type CategoryType } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import { PREDEFINED_INCOME_CATEGORIES, PREDEFINED_EXPENSE_CATEGORIES } from '@/lib/finance-categories'

export interface CreateCategoryData { name: string; type: CategoryType; icon?: string; color?: string }
export interface UpdateCategoryData { name?: string; icon?: string; color?: string }

export class FinanceCategoriesRepository {
  async getById(id: string): Promise<FinanceCategory | undefined> { return withDB((db) => db.finance_categories.get(id)) ?? undefined }
  async getAll(): Promise<FinanceCategory[]> { return withDB((db) => db.finance_categories.orderBy('createdAt').toArray()) ?? [] }
  async getActive(): Promise<FinanceCategory[]> { return filterActive(await this.getAll()) }
  async getByType(type: CategoryType): Promise<FinanceCategory[]> {
    const categories = await withDB((db) => db.finance_categories.where('type').equals(type).toArray()) || []
    return categories.filter(cat => !cat.deleted)
  }
  async getIncomeCategories(): Promise<FinanceCategory[]> { return this.getByType('income') }
  async getExpenseCategories(): Promise<FinanceCategory[]> { return this.getByType('expense') }
  async getPredefinedCategories(): Promise<FinanceCategory[]> { return (await this.getAll()).filter(cat => cat.isPredefined && !cat.deleted) }
  async getUserCategories(): Promise<FinanceCategory[]> { return (await this.getAll()).filter(cat => !cat.isPredefined && !cat.deleted) }

  async initializePredefinedCategories(): Promise<void> {
    if ((await this.getPredefinedCategories()).length > 0) return
    const now = new Date()
    for (const cat of PREDEFINED_INCOME_CATEGORIES) {
      const id = generateUUID()
      await withDB((db) => db.finance_categories.add({ id, name: cat.nameKey, type: 'income', isPredefined: true, icon: cat.icon, color: cat.color, createdAt: now, updatedAt: now, synced: false }))
      await this.markForSync(id, 'insert', { id, name: cat.nameKey, type: 'income', isPredefined: true, icon: cat.icon, color: cat.color })
    }
    for (const cat of PREDEFINED_EXPENSE_CATEGORIES) {
      const id = generateUUID()
      await withDB((db) => db.finance_categories.add({ id, name: cat.nameKey, type: 'expense', isPredefined: true, icon: cat.icon, color: cat.color, createdAt: now, updatedAt: now, synced: false }))
      await this.markForSync(id, 'insert', { id, name: cat.nameKey, type: 'expense', isPredefined: true, icon: cat.icon, color: cat.color })
    }
  }

  async create(data: CreateCategoryData): Promise<string> {
    const now = new Date()
    const id = generateUUID()
    await withDB((db) => db.finance_categories.add({ id, name: data.name, type: data.type, isPredefined: false, icon: data.icon, color: data.color, createdAt: now, updatedAt: now, synced: false }))
    await this.markForSync(id, 'insert', { ...data, id, isPredefined: false })
    return id
  }

  async update(id: string, data: UpdateCategoryData): Promise<void> {
    const category = await this.getById(id)
    if (!category || category.isPredefined) throw new Error('Cannot update predefined category')
    await withDB((db) => db.finance_categories.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const category = await this.getById(id)
    if (!category || category.isPredefined) throw new Error('Cannot delete predefined category')
    const tombstone = createTombstone()
    await withDB((db) => db.finance_categories.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.finance_categories.delete(id)) }

  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> {
    await withDB((db) => db.sync_queue.add({ id: generateUUID(), table: 'finance_categories', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() }))
  }

  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.finance_categories.update(id, { synced: true }))
    const syncRecords = (await withDB((db) => db.sync_queue.where('[table+recordId]').equals(['finance_categories', id]).and((record) => !record.synced).primaryKeys())) ?? []
    for (const key of syncRecords) await withDB((db) => db.sync_queue.update(key, { synced: true }))
  }
}

export const financeCategoriesRepository = new FinanceCategoriesRepository()