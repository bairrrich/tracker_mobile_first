import { db, type Metric, type History } from '@/lib/db'

export interface CreateMetricData {
  itemId: number
  type: string
  value: number
  unit?: string
  date?: Date
}

export interface CreateHistoryData {
  itemId: number
  action: string
  value?: number
  note?: string
}

export class MetricsRepository {
  /**
   * Get metrics by item ID
   */
  async getByItem(itemId: number): Promise<Metric[]> {
    return await db.metrics.where('itemId').equals(itemId).toArray()
  }

  /**
   * Get metrics by item ID and type
   */
  async getByItemAndType(
    itemId: number,
    type: string
  ): Promise<Metric[]> {
    return await db.metrics
      .where('[itemId+type]')
      .equals([itemId, type])
      .toArray()
  }

  /**
   * Get metrics by date range
   */
  async getByDateRange(
    itemId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Metric[]> {
    return await db.metrics
      .filter(
        (metric) =>
          metric.itemId === itemId &&
          metric.date >= startDate &&
          metric.date <= endDate
      )
      .toArray()
  }

  /**
   * Get latest metric by type
   */
  async getLatestByType(itemId: number, type: string): Promise<Metric | undefined> {
    return await db.metrics
      .where('[itemId+type]')
      .equals([itemId, type])
      .reverse()
      .first()
  }

  /**
   * Create a metric
   */
  async create(data: CreateMetricData): Promise<number> {
    const id = await db.metrics.add({
      id: Date.now() + Math.floor(Math.random() * 1000),
      itemId: data.itemId,
      type: data.type,
      value: data.value,
      unit: data.unit,
      date: data.date || new Date(),
      createdAt: new Date(),
    })

    return id as number
  }

  /**
   * Delete a metric
   */
  async delete(id: number): Promise<void> {
    await db.metrics.delete(id)
  }

  /**
   * Get metrics statistics
   */
  async getStatistics(itemId: number, type: string): Promise<{
    count: number
    sum: number
    average: number
    min: number
    max: number
  } | null> {
    const metrics = await this.getByItemAndType(itemId, type)

    if (metrics.length === 0) {
      return null
    }

    const values = metrics.map((m) => m.value)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: metrics.length,
      sum,
      average: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }
}

export class HistoryRepository {
  /**
   * Get history by item ID
   */
  async getByItem(itemId: number): Promise<History[]> {
    return await db.history.where('itemId').equals(itemId).reverse().toArray()
  }

  /**
   * Get history by item ID and action
   */
  async getByItemAndAction(
    itemId: number,
    action: string
  ): Promise<History[]> {
    return await db.history
      .where('[itemId+action]')
      .equals([itemId, action])
      .reverse()
      .toArray()
  }

  /**
   * Get recent history
   */
  async getRecent(limit: number = 20): Promise<History[]> {
    return await db.history.orderBy('createdAt').reverse().limit(limit).toArray()
  }

  /**
   * Get history by date range
   */
  async getByDateRange(
    itemId: number,
    startDate: Date,
    endDate: Date
  ): Promise<History[]> {
    return await db.history
      .filter(
        (history) =>
          history.itemId === itemId &&
          history.createdAt >= startDate &&
          history.createdAt <= endDate
      )
      .toArray()
  }

  /**
   * Create a history entry
   */
  async create(data: CreateHistoryData): Promise<number> {
    const id = await db.history.add({
      id: Date.now() + Math.floor(Math.random() * 1000),
      itemId: data.itemId,
      action: data.action,
      value: data.value,
      note: data.note,
      createdAt: new Date(),
    })

    return id as number
  }

  /**
   * Delete a history entry
   */
  async delete(id: number): Promise<void> {
    await db.history.delete(id)
  }

  /**
   * Get activity count by action
   */
  async getCountByAction(action: string): Promise<number> {
    return await db.history
      .where('action')
      .equals(action)
      .count()
  }

  /**
   * Get activity streak
   */
  async getStreak(itemId: number, action: string): Promise<number> {
    const history = await this.getByItemAndAction(itemId, action)

    if (history.length === 0) return 0

    let streak = 0
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    for (const record of history) {
      const recordDate = new Date(record.createdAt)
      const recordDay = new Date(
        recordDate.getFullYear(),
        recordDate.getMonth(),
        recordDate.getDate()
      )

      const diffDays = Math.floor(
        (today.getTime() - recordDay.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }

    return streak
  }
}

export const metricsRepository = new MetricsRepository()
export const historyRepository = new HistoryRepository()
