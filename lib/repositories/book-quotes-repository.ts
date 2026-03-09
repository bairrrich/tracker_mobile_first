import { withDB, type BookQuote } from '@/lib/db'

export interface CreateQuoteData {
  bookId: number
  text: string
  page?: number
}

export interface UpdateQuoteData {
  text?: string
  page?: number
}

export class BookQuotesRepository {
  /**
   * Get all quotes for a book
   */
  async getByBook(bookId: number): Promise<BookQuote[]> {
    return withDB((db) =>
      db.bookQuotes.where('bookId').equals(bookId).reverse().toArray()
    ) ?? []
  }

  /**
   * Get quote by ID
   */
  async getById(id: number): Promise<BookQuote | undefined> {
    return withDB((db) => db.bookQuotes.get(id)) ?? undefined
  }

  /**
   * Create a new quote
   */
  async create(data: CreateQuoteData): Promise<number> {
    const now = new Date()
    const id = await withDB((db) =>
      db.bookQuotes.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
        bookId: data.bookId,
        text: data.text,
        page: data.page,
        createdAt: now,
        synced: false,
      })
    )

    if (id === null) return -1

    // Mark for sync
    await this.markForSync(id, 'insert', data)

    return id
  }

  /**
   * Update a quote
   */
  async update(id: number, data: UpdateQuoteData): Promise<void> {
    await withDB((db) =>
      db.bookQuotes.update(id, {
        ...data,
      })
    )

    // Mark for sync
    await this.markForSync(id, 'update', data)
  }

  /**
   * Delete a quote
   */
  async delete(id: number): Promise<void> {
    await withDB((db) => db.bookQuotes.delete(id))

    // Mark for sync
    await this.markForSync(id, 'delete')
  }

  /**
   * Mark quote for sync
   */
  private async markForSync(
    id: number,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
        table: 'bookQuotes',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Mark quote as synced
   */
  async markAsSynced(id: number): Promise<void> {
    await withDB((db) => db.bookQuotes.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('[table+recordId]')
        .equals(['bookQuotes', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.syncQueue.update(key, { synced: true }))
    }
  }
}

export const bookQuotesRepository = new BookQuotesRepository()
