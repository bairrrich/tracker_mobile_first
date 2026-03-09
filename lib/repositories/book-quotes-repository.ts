import { withDB, type BookQuote } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'

export interface CreateQuoteData {
  bookId: string  // UUID
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
  async getByBook(bookId: string): Promise<BookQuote[]> {
    return withDB((db) =>
      db.bookQuotes.where('bookId').equals(bookId).reverse().toArray()
    ) ?? []
  }

  /**
   * Get quote by ID
   */
  async getById(id: string): Promise<BookQuote | undefined> {
    return withDB((db) => db.bookQuotes.get(id)) ?? undefined
  }

  /**
   * Create a new quote
   */
  async create(data: CreateQuoteData): Promise<string> {
    const now = new Date()
    const id = generateUUID()  // Generate UUID client-side
    
    const result = await withDB((db) =>
      db.bookQuotes.add({
        id,  // Use generated UUID
        bookId: data.bookId,
        text: data.text,
        page: data.page,
        createdAt: now,
        synced: false,
      })
    )

    if (result === null) return ''

    // Mark for sync
    await this.markForSync(id, 'insert', { ...data, id })

    return id
  }

  /**
   * Update a quote
   */
  async update(id: string, data: UpdateQuoteData): Promise<void> {
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
  async delete(id: string): Promise<void> {
    await withDB((db) => db.bookQuotes.delete(id))

    // Mark for sync
    await this.markForSync(id, 'delete')
  }

  /**
   * Mark quote for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: generateUUID(),  // Use UUID for sync queue id
        table: 'bookQuotes',
        recordId: id,  // Now string UUID
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
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.bookQuotes.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('table')
        .equals('bookQuotes')
        .and((record) => record.recordId === id && !record.synced)
        .toArray()
    )) ?? []

    for (const record of syncRecords) {
      await withDB((db) => db.syncQueue.update(record.id, { synced: true }))
    }
  }
}

export const bookQuotesRepository = new BookQuotesRepository()
