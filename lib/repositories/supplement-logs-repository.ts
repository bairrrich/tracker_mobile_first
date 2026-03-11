import { withDB, type SupplementLog, type SupplementLogStatus } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export interface CreateLogData {
  supplementId: string
  scheduleId?: string
  date: Date
  time?: Date
  status: SupplementLogStatus
  dosage?: number
  quantity?: number
  notes?: string
  rating?: number
  sideEffects?: string
}

export interface UpdateLogData {
  status?: SupplementLogStatus
  dosage?: number
  quantity?: number
  notes?: string
  rating?: number
  sideEffects?: string
}

export class SupplementLogsRepository {
  async getById(id: string): Promise<SupplementLog | undefined> { return withDB((db) => db.supplement_logs.get(id)) ?? undefined }
  async getBySupplementId(supplementId: string): Promise<SupplementLog[]> { const l = await withDB((db) => db.supplement_logs.where('supplementId').equals(supplementId).reverse().toArray()) || []; return l.filter(l => !l.deleted) }
  async getByDate(date: Date): Promise<SupplementLog[]> {
    const logs = await this.getAll()
    const dateStr = date.toISOString().split('T')[0]
    return logs.filter(l => l.date.toISOString().split('T')[0] === dateStr && !l.deleted)
  }
  async getAll(): Promise<SupplementLog[]> { return withDB((db) => db.supplement_logs.orderBy('date').reverse().toArray()) ?? [] }
  async getActive(): Promise<SupplementLog[]> { return filterActive(await this.getAll()) }
  async getStats(supplementId: string, days: number = 30): Promise<{ total: number, taken: number, skipped: number, missed: number, compliance: number }> {
    const logs = await this.getBySupplementId(supplementId)
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const filtered = logs.filter(l => new Date(l.date) >= cutoff)
    const total = filtered.length
    const taken = filtered.filter(l => l.status === 'taken').length
    const skipped = filtered.filter(l => l.status === 'skipped').length
    const missed = filtered.filter(l => l.status === 'missed').length
    const compliance = total > 0 ? (taken / total) * 100 : 0
    return { total, taken, skipped, missed, compliance }
  }

  async create(data: CreateLogData): Promise<string> {
    const now = new Date(), id = generateUUID()
    await withDB((db) => db.supplement_logs.add({
      id, supplementId: data.supplementId, scheduleId: data.scheduleId, date: data.date,
      time: data.time, status: data.status, dosage: data.dosage, quantity: data.quantity,
      notes: data.notes, rating: data.rating, sideEffects: data.sideEffects,
      createdAt: now, updatedAt: now, synced: false,
    }))
    await this.markForSync(id, 'insert', { ...data, id })
    return id
  }

  async update(id: string, data: UpdateLogData): Promise<void> {
    const l = await this.getById(id); if (!l) throw new Error('Log not found')
    await withDB((db) => db.supplement_logs.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const l = await this.getById(id); if (!l) throw new Error('Log not found')
    const tombstone = createTombstone()
    await withDB((db) => db.supplement_logs.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.supplement_logs.delete(id)) }
  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> { await withDB((db) => db.sync_queue.add({ id: generateUUID(), table: 'supplement_logs', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() })) }
  async markAsSynced(id: string): Promise<void> { await withDB((db) => db.supplement_logs.update(id, { synced: true })); const r = (await withDB((db) => db.sync_queue.where('[table+recordId]').equals(['supplement_logs', id]).and((r) => !r.synced).primaryKeys())) ?? []; for (const k of r) await withDB((db) => db.sync_queue.update(k, { synced: true })) }
}

export const supplementLogsRepository = new SupplementLogsRepository()