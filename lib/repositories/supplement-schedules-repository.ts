import { withDB, type SupplementSchedule, type SupplementTiming, type SupplementFrequency } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'

export interface CreateScheduleData {
  supplementId: string
  frequency: SupplementFrequency
  timing: SupplementTiming
  daysOfWeek?: number[]
  dosage?: number
  quantity?: number
  notes?: string
  isActive?: boolean
  startDate?: Date
  endDate?: Date
}

export interface UpdateScheduleData {
  frequency?: SupplementFrequency
  timing?: SupplementTiming
  daysOfWeek?: number[]
  dosage?: number
  quantity?: number
  notes?: string
  isActive?: boolean
  startDate?: Date
  endDate?: Date
}

export class SupplementSchedulesRepository {
  async getById(id: string): Promise<SupplementSchedule | undefined> { return withDB((db) => db.supplement_schedules.get(id)) ?? undefined }
  async getBySupplementId(supplementId: string): Promise<SupplementSchedule[]> { const s = await withDB((db) => db.supplement_schedules.where('supplementId').equals(supplementId).reverse().toArray()) || []; return s.filter(s => !s.deleted) }
  async getAll(): Promise<SupplementSchedule[]> { return withDB((db) => db.supplement_schedules.orderBy('createdAt').reverse().toArray()) ?? [] }
  async getActive(): Promise<SupplementSchedule[]> { return filterActive(await this.getAll()) }
  async getByTiming(timing: SupplementTiming): Promise<SupplementSchedule[]> { const s = await withDB((db) => db.supplement_schedules.where('timing').equals(timing).reverse().toArray()) || []; return s.filter(s => !s.deleted && s.isActive) }
  async getDueToday(): Promise<SupplementSchedule[]> {
    const schedules = await this.getActive()
    const today = new Date()
    const dayOfWeek = today.getDay()
    return schedules.filter(s => {
      if (!s.isActive || s.deleted) return false
      if (s.startDate && today < new Date(s.startDate)) return false
      if (s.endDate && today > new Date(s.endDate)) return false
      if (s.daysOfWeek) {
        try {
          const days = JSON.parse(s.daysOfWeek) as number[]
          if (days.length > 0 && !days.includes(dayOfWeek)) return false
        } catch { /* ignore invalid JSON */ }
      }
      return true
    })
  }

  async create(data: CreateScheduleData): Promise<string> {
    const now = new Date(), id = generateUUID()
    await withDB((db) => db.supplement_schedules.add({
      id, supplementId: data.supplementId, frequency: data.frequency, timing: data.timing,
      daysOfWeek: data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : undefined as any,
      dosage: data.dosage, quantity: data.quantity, notes: data.notes,
      isActive: data.isActive ?? true, startDate: data.startDate, endDate: data.endDate,
      createdAt: now, updatedAt: now, synced: false,
    }))
    await this.markForSync(id, 'insert', { ...data, id })
    return id
  }

  async update(id: string, data: UpdateScheduleData): Promise<void> {
    const s = await this.getById(id); if (!s) throw new Error('Schedule not found')
    const updateData: any = { ...data, updatedAt: new Date() }
    if (data.daysOfWeek) updateData.daysOfWeek = JSON.stringify(data.daysOfWeek)
    await withDB((db) => db.supplement_schedules.update(id, updateData))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async toggleActive(id: string): Promise<void> {
    const s = await this.getById(id); if (!s) throw new Error('Schedule not found')
    await withDB((db) => db.supplement_schedules.update(id, { isActive: !s.isActive, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { isActive: !s.isActive, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const s = await this.getById(id); if (!s) throw new Error('Schedule not found')
    const tombstone = createTombstone()
    await withDB((db) => db.supplement_schedules.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> { await withDB((db) => db.supplement_schedules.delete(id)) }
  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> { await withDB((db) => db.sync_queue.add({ id: generateUUID(), table: 'supplement_schedules', recordId: id, operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date() })) }
  async markAsSynced(id: string): Promise<void> { await withDB((db) => db.supplement_schedules.update(id, { synced: true })); const r = (await withDB((db) => db.sync_queue.where('[table+recordId]').equals(['supplement_schedules', id]).and((r) => !r.synced).primaryKeys())) ?? []; for (const k of r) await withDB((db) => db.sync_queue.update(k, { synced: true })) }
}

export const supplementSchedulesRepository = new SupplementSchedulesRepository()