import { withDB, type Book, type BookStatus, type BookFormat } from '@/lib/db'
import { generateUUID } from '@/lib/utils/uuid'

export interface CreateBookData {
  title: string
  author: string
  description?: string
  coverImage?: string
  status?: BookStatus
  rating?: number
  pagesTotal?: number
  pagesRead?: number
  startDate?: Date
  endDate?: Date
  genre?: string
  isbn?: string
  publisher?: string
  publishYear?: number
  language?: string
  format?: BookFormat
  notes?: string
  collectionId?: string  // UUID
}

export interface UpdateBookData {
  title?: string
  author?: string
  description?: string
  coverImage?: string
  status?: BookStatus
  rating?: number
  pagesTotal?: number
  pagesRead?: number
  startDate?: Date
  endDate?: Date
  genre?: string
  isbn?: string
  publisher?: string
  publishYear?: number
  language?: string
  format?: BookFormat
  notes?: string
  collectionId?: string  // UUID
}

export class BooksRepository {
  /**
   * Get all books
   */
  async getAll(): Promise<Book[]> {
    return withDB((db) => db.books.orderBy('updatedAt').reverse().toArray()) ?? []
  }

  /**
   * Get book by ID
   */
  async getById(id: string): Promise<Book | undefined> {
    return withDB((db) => db.books.get(id)) ?? undefined
  }

  /**
   * Get books by status
   */
  async getByStatus(status: BookStatus): Promise<Book[]> {
    return withDB((db) => db.books.where('status').equals(status).reverse().toArray()) ?? []
  }

  /**
   * Get books by genre
   */
  async getByGenre(genre: string): Promise<Book[]> {
    return withDB((db) => db.books.where('genre').equals(genre).reverse().toArray()) ?? []
  }

  /**
   * Get books by author
   */
  async getByAuthor(author: string): Promise<Book[]> {
    const lowerAuthor = author.toLowerCase()
    return withDB((db) =>
      db.books
        .filter((book) => book.author.toLowerCase().includes(lowerAuthor))
        .toArray()
    ) ?? []
  }

  /**
   * Search books by title or author
   */
  async search(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase()
    return withDB((db) =>
      db.books
        .filter(
          (book) =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery)
        )
        .toArray()
    ) ?? []
  }

  /**
   * Create a new book
   */
  async create(data: CreateBookData): Promise<string> {
    const now = new Date()
    const id = generateUUID()  // Generate UUID client-side
    
    // Include id in the data that gets synced
    const bookData = {
      id,  // UUID for Supabase
      title: data.title,
      author: data.author,
      description: data.description,
      coverImage: data.coverImage,
      status: data.status || 'planned',
      rating: data.rating,
      pagesTotal: data.pagesTotal,
      pagesRead: data.pagesRead || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      genre: data.genre,
      isbn: data.isbn,
      publisher: data.publisher,
      publishYear: data.publishYear,
      language: data.language,
      format: data.format,
      notes: data.notes,
      collectionId: data.collectionId,
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
    
    const result = await withDB((db) =>
      db.books.add(bookData)
    )

    if (result === null) return ''

    // Mark for sync - include id in data
    await this.markForSync(id, 'insert', bookData)

    return id
  }

  /**
   * Update a book
   */
  async update(id: string, data: UpdateBookData): Promise<void> {
    await withDB((db) =>
      db.books.update(id, {
        ...data,
        updatedAt: new Date(),
      })
    )

    // Mark for sync
    await this.markForSync(id, 'update', data)
  }

  /**
   * Delete a book
   */
  async delete(id: string): Promise<void> {
    await withDB((db) => db.books.delete(id))

    // Mark for sync
    await this.markForSync(id, 'delete')
  }

  /**
   * Get currently reading books
   */
  async getCurrentlyReading(): Promise<Book[]> {
    return withDB((db) =>
      db.books.where('status').equals('reading').reverse().toArray()
    ) ?? []
  }

  /**
   * Get completed books
   */
  async getCompleted(): Promise<Book[]> {
    return withDB((db) =>
      db.books.where('status').equals('completed').reverse().toArray()
    ) ?? []
  }

  /**
   * Get planned books
   */
  async getPlanned(): Promise<Book[]> {
    return withDB((db) =>
      db.books.where('status').equals('planned').reverse().toArray()
    ) ?? []
  }

  /**
   * Get abandoned books
   */
  async getAbandoned(): Promise<Book[]> {
    return withDB((db) =>
      db.books.where('status').equals('abandoned').reverse().toArray()
    ) ?? []
  }

  /**
   * Get books with rating
   */
  async getByRating(minRating: number): Promise<Book[]> {
    return withDB((db) =>
      db.books
        .filter((book) => (book.rating || 0) >= minRating)
        .toArray()
    ) ?? []
  }

  /**
   * Get recent books
   */
  async getRecent(limit: number = 10): Promise<Book[]> {
    return withDB((db) => db.books.orderBy('updatedAt').reverse().limit(limit).toArray()) ?? []
  }

  /**
   * Get books by collection
   */
  async getByCollection(collectionId: number): Promise<Book[]> {
    return withDB((db) =>
      db.books.where('collectionId').equals(collectionId).reverse().toArray()
    ) ?? []
  }

  /**
   * Update reading progress
   */
  async updateProgress(id: string, pagesRead: number): Promise<void> {
    const book = await this.getById(id)
    if (!book) return

    await this.update(id, {
      pagesRead,
      status: pagesRead > 0 && book.status === 'planned' ? 'reading' : book.status,
      endDate: book.pagesTotal && pagesRead >= book.pagesTotal ? new Date() : book.endDate,
    })
  }

  /**
   * Mark book for sync
   */
  private async markForSync(
    id: string,
    operation: 'insert' | 'update' | 'delete',
    data?: object
  ): Promise<void> {
    await withDB((db) =>
      db.syncQueue.add({
        id: Date.now() + Math.floor(Math.random() * 1000),
        table: 'books',
        recordId: id,
        operation,
        data: data ? JSON.stringify(data) : '',
        synced: false,
        createdAt: new Date(),
      })
    )
  }

  /**
   * Get unsynced books
   */
  async getUnsynced(): Promise<Book[]> {
    const syncRecords = withDB((db) =>
      db.syncQueue
        .where('table')
        .equals('books')
        .and((record) => !record.synced)
        .toArray()
    ) ?? []

    const books: Book[] = []
    for (const record of await syncRecords) {
      const book = await withDB((db) => db.books.get(record.recordId))
      if (book) {
        books.push(book)
      }
    }

    return books
  }

  /**
   * Mark book as synced
   */
  async markAsSynced(id: string): Promise<void> {
    await withDB((db) => db.books.update(id, { synced: true }))

    const syncRecords = (await withDB((db) =>
      db.syncQueue
        .where('[table+recordId]')
        .equals(['books', id])
        .and((record) => !record.synced)
        .primaryKeys()
    )) ?? []

    for (const key of syncRecords) {
      await withDB((db) => db.syncQueue.update(key, { synced: true }))
    }
  }

  /**
   * Get all genres
   */
  async getAllGenres(): Promise<string[]> {
    const books = await this.getAll()
    const genres = books
      .map((b) => b.genre)
      .filter((g): g is string => !!g)
      .filter((value, index, self) => self.indexOf(value) === index)
    return genres.sort()
  }

  /**
   * Get all authors
   */
  async getAllAuthors(): Promise<string[]> {
    const books = await this.getAll()
    const authors = books
      .map((b) => b.author)
      .filter((a): a is string => !!a)
      .filter((value, index, self) => self.indexOf(value) === index)
    return authors.sort()
  }
}

export const booksRepository = new BooksRepository()
