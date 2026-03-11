import { withDB, type Supplement, type SupplementType, type SupplementForm, type SupplementCategory } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export interface CreateSupplementData {
  name: string
  type: SupplementType
  form: SupplementForm
  dosage?: number
  dosageUnit?: string
  category?: SupplementCategory
  brand?: string
  description?: string
  imageUrl?: string
}

export interface UpdateSupplementData {
  name?: string
  type?: SupplementType
  form?: SupplementForm
  dosage?: number
  dosageUnit?: string
  category?: SupplementCategory
  brand?: string
  description?: string
  imageUrl?: string
  isActive?: boolean
}

export class SupplementsRepository {
  async getById(id: string): Promise<Supplement | undefined> { return withDB((db) => db.supplements.get(id)) ?? undefined }
  async getAll(): Promise<Supplement[]> { return withDB((db) => db.supplements.orderBy('createdAt').reverse().toArray()) ?? [] }
  async getActive(): Promise<Supplement[]> { return filterActive(await this.getAll()) }
  async getByType(type: SupplementType): Promise<Supplement[]> { const s = await withDB((db) => db.supplements.where('type').equals(type).reverse().toArray()) || []; return s.filter(s => !s.deleted && s.isActive) }
  async getByCategory(category: SupplementCategory): Promise<Supplement[]> { const s = await withDB((db) => db.supplements.where('category').equals(category).reverse().toArray()) || []; return s.filter(s => !s.deleted && s.isActive) }
  async search(query: string): Promise<Supplement[]> { const q = query.toLowerCase(); const s = await this.getActive(); return s.filter(s => s.name.toLowerCase().includes(q) || (s.brand && s.brand.toLowerCase().includes(q))) }

  async create(data: CreateSupplementData): Promise<string> {
    const now = new Date(), id = generateUUID()
    await withDB((db) => db.supplements.add({ id, name: data.name, type: data.type, form: data.form, dosage: data.dosage, dosageUnit: data.dosageUnit, category: data.category, brand: data.brand, description: data.description, imageUrl: data.imageUrl, isActive: true, createdAt: now, updatedAt: now, synced: false }))
    await this.markForSync(id, 'insert', { ...data, id, isActive: true })
    return id
  }

  async update(id: string, data: UpdateSupplementData): Promise<void> {
    const s = await this.getById(id); if (!s) throw new Error('Supplement not found')
    await withDB((db) => db.supplements.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async toggleActive(id: string): Promise<void> {
    const s = await this.getById(id); if (!s) throw new Error('Supplement not found')
    await withDB((db) => db.supplements.update(id, { isActive: !s.isActive, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { isActive: !s.isActive, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const s = await this.getById(id); if (!s) throw new Error('Supplement not found')
    const tombstone = createTombstone()
    await withDB((db) => db.supplements.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.supplements.delete(id)) }
  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> { await withDB((db) => db.syncQueue.add({ id: generateUUID(), table: 'supplements', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() })) }
  async markAsSynced(id: string): Promise<void> { await withDB((db) => db.supplements.update(id, { synced: true })); const r = (await withDB((db) => db.syncQueue.where('[table+recordId]').equals(['supplements', id]).and((r) => !r.synced).primaryKeys())) ?? []; for (const k of r) await withDB((db) => db.syncQueue.update(k, { synced: true })) }
}

export const supplementsRepository = new SupplementsRepository()