import { withDB, type SupplementInventory } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export interface CreateInventoryData {
  supplementId: string
  quantity: number
  minQuantity?: number
  unit?: string
  purchaseDate?: Date
  expirationDate?: Date
  price?: number
  notes?: string
}

export interface UpdateInventoryData {
  quantity?: number
  minQuantity?: number
  unit?: string
  purchaseDate?: Date
  expirationDate?: Date
  price?: number
  notes?: string
}

export class SupplementInventoryRepository {
  async getById(id: string): Promise<SupplementInventory | undefined> { return withDB((db) => db.supplement_inventory.get(id)) ?? undefined }
  async getBySupplementId(supplementId: string): Promise<SupplementInventory[]> { const i = await withDB((db) => db.supplement_inventory.where('supplementId').equals(supplementId).reverse().toArray()) || []; return i.filter(i => !i.deleted) }
  async getAll(): Promise<SupplementInventory[]> { return withDB((db) => db.supplement_inventory.orderBy('createdAt').reverse().toArray()) ?? [] }
  async getActive(): Promise<SupplementInventory[]> { return filterActive(await this.getAll()) }
  async getExpiringSoon(days: number = 30): Promise<SupplementInventory[]> { const i = await this.getActive(); const now = new Date(); const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); return i.filter(i => i.expirationDate && new Date(i.expirationDate) <= threshold) }
  async getLowStock(): Promise<SupplementInventory[]> { const i = await this.getActive(); return i.filter(i => i.minQuantity && i.quantity <= i.minQuantity) }

  async create(data: CreateInventoryData): Promise<string> {
    const now = new Date(), id = generateUUID()
    await withDB((db) => db.supplement_inventory.add({ id, supplementId: data.supplementId, quantity: data.quantity, minQuantity: data.minQuantity, unit: data.unit, purchaseDate: data.purchaseDate, expirationDate: data.expirationDate, price: data.price, notes: data.notes, createdAt: now, updatedAt: now, synced: false }))
    await this.markForSync(id, 'insert', { ...data, id })
    return id
  }

  async update(id: string, data: UpdateInventoryData): Promise<void> {
    const i = await this.getById(id); if (!i) throw new Error('Inventory not found')
    await withDB((db) => db.supplement_inventory.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const i = await this.getById(id); if (!i) throw new Error('Inventory not found')
    await withDB((db) => db.supplement_inventory.update(id, { quantity, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { quantity, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const i = await this.getById(id); if (!i) throw new Error('Inventory not found')
    const tombstone = createTombstone()
    await withDB((db) => db.supplement_inventory.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.supplement_inventory.delete(id)) }
  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> { await withDB((db) => db.sync_queue.add({ id: generateUUID(), table: 'supplement_inventory', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() })) }
  async markAsSynced(id: string): Promise<void> { await withDB((db) => db.supplement_inventory.update(id, { synced: true })); const r = (await withDB((db) => db.sync_queue.where('[table+recordId]').equals(['supplement_inventory', id]).and((r) => !r.synced).primaryKeys())) ?? []; for (const k of r) await withDB((db) => db.sync_queue.update(k, { synced: true })) }
}

export const supplementInventoryRepository = new SupplementInventoryRepository()