import { withDB, type FinanceAccount, type AccountType, type Currency } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'
import { createTombstone, filterActive } from '@/lib/utils/sync-utils'
import { getExchangeRates, type CurrencyCode } from '@/lib/exchange-rates'

export interface CreateAccountData {
  name: string
  type: AccountType
  currency: Currency
  initialBalance: number
  icon?: string
  color?: string
}

export interface UpdateAccountData {
  name?: string
  type?: AccountType
  currency?: Currency
  icon?: string
  color?: string
}

export class FinanceAccountsRepository {
  async getById(id: string): Promise<FinanceAccount | undefined> {
    return withDB((db) => db.finance_accounts.get(id)) ?? undefined
  }

  async getAll(): Promise<FinanceAccount[]> {
    return withDB((db) => db.finance_accounts.orderBy('createdAt').reverse().toArray()) ?? []
  }

  async getActive(): Promise<FinanceAccount[]> {
    const all = await this.getAll()
    return filterActive(all)
  }

  async getByType(type: AccountType): Promise<FinanceAccount[]> {
    const accounts = await withDB((db) => db.finance_accounts.where('type').equals(type).reverse().toArray()) || []
    return accounts.filter(account => !account.deleted)
  }

  async search(query: string): Promise<FinanceAccount[]> {
    const lowerQuery = query.toLowerCase()
    const accounts = await this.getActive()
    return accounts.filter(account => account.name.toLowerCase().includes(lowerQuery))
  }

  async getTotalBalance(exchangeRates?: { [key: string]: number }, baseCurrency: CurrencyCode = 'RUB'): Promise<number> {
    const accounts = await this.getActive()
    let rates = exchangeRates
    if (!rates) {
      const apiRates = await getExchangeRates(baseCurrency)
      rates = apiRates?.rates || { RUB: 1, USD: 90, EUR: 98, GBP: 115, JPY: 0.6, CNY: 12.5 }
    }
    return accounts.reduce((total, account) => {
      const rate = rates[account.currency] || 1
      return total + (account.currentBalance * rate)
    }, 0)
  }

  async getTotalBalanceByCurrency(): Promise<Record<string, number>> {
    const accounts = await this.getActive()
    const balances: Record<string, number> = {}
    accounts.forEach(account => {
      const key = account.currency || 'RUB'
      if (!balances[key]) balances[key] = 0
      balances[key] += account.currentBalance || 0
    })
    return balances
  }

  async create(data: CreateAccountData): Promise<string> {
    const now = new Date()
    const id = generateUUID()
    await withDB((db) => db.finance_accounts.add({
      id, name: data.name, type: data.type, currency: data.currency,
      initialBalance: data.initialBalance, currentBalance: data.initialBalance,
      icon: data.icon, color: data.color, createdAt: now, updatedAt: now, synced: false,
    }))
    await this.markForSync(id, 'insert', { ...data, id, currentBalance: data.initialBalance })
    return id
  }

  async update(id: string, data: UpdateAccountData): Promise<void> {
    await withDB((db) => db.finance_accounts.update(id, { ...data, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { ...data, updatedAt: new Date() })
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await withDB((db) => db.finance_accounts.update(id, { currentBalance: newBalance, updatedAt: new Date() }))
    await this.markForSync(id, 'update', { currentBalance: newBalance, updatedAt: new Date() })
  }

  async delete(id: string): Promise<void> {
    const tombstone = createTombstone()
    await withDB((db) => db.finance_accounts.update(id, { ...tombstone, synced: false }))
    await this.markForSync(id, 'delete', { id, deleted: true })
  }

  async hardDelete(id: string): Promise<void> {
    await withDB((db) => db.finance_accounts.delete(id))
  }

  private async markForSync(id: string, operation: 'insert' | 'update' | 'delete', data?: object): Promise<void> {
    await withDB((db) => db.sync_queue.add({
      id: generateUUID(), table: 'finance_accounts', recordId: id,
      operation, data: data ? JSON.stringify(data) : '', synced: false, createdAt: new Date(),
    }))
  }

  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.finance_accounts.update(id, { synced: true }))
    const syncRecords = (await withDB((db) => db.sync_queue.where('[table+recordId]').equals(['finance_accounts', id]).and((record) => !record.synced).primaryKeys())) ?? []
    for (const key of syncRecords) await withDB((db) => db.sync_queue.update(key, { synced: true }))
  }
}

export const financeAccountsRepository = new FinanceAccountsRepository()