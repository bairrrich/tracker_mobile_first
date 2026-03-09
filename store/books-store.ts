import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { booksRepository } from '@/lib/repositories/books-repository'
import type { Book, BookStatus, BookFormat } from '@/lib/db'

interface BooksState {
  // State
  books: Book[]
  selectedBook: Book | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchBooks: () => Promise<void>
  selectBook: (book: Book | null) => void
  addBook: (data: {
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
    collectionId?: string
  }) => Promise<string>
  updateBook: (
    id: string,
    data: {
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
      collectionId?: string
    }
  ) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  updateProgress: (id: string, pagesRead: number) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useBooksStore = create<BooksState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    books: [],
    selectedBook: null,
    isLoading: false,
    error: null,

    // Fetch all books
    fetchBooks: async () => {
      set({ isLoading: true, error: null })
      try {
        const books = await booksRepository.getActive()
        set({ books, isLoading: false })
      } catch (error) {
        set({
          error: 'Failed to fetch books',
          isLoading: false,
        })
      }
    },

    // Select a book
    selectBook: (book) => {
      set({ selectedBook: book })
    },

    // Add a new book
    addBook: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await booksRepository.create(data)
        const books = await booksRepository.getActive()
        set({ books, isLoading: false })
        return id
      } catch (error) {
        set({
          error: 'Failed to add book',
          isLoading: false,
        })
        throw error
      }
    },

    // Update a book
    updateBook: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await booksRepository.update(id, data)
        const books = await booksRepository.getActive()
        set({ books, isLoading: false })

        // Update selected book if it's the one being updated
        const selected = get().selectedBook
        if (selected && selected.id === id) {
          const updated = books.find((b) => b.id === id)
          if (updated) {
            set({ selectedBook: updated })
          }
        }
      } catch (error) {
        set({
          error: 'Failed to update book',
          isLoading: false,
        })
        throw error
      }
    },

    // Delete a book
    deleteBook: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await booksRepository.delete(id)
        const books = await booksRepository.getActive()
        set({ books, isLoading: false })

        // Clear selected book if it's the one being deleted
        const selected = get().selectedBook
        if (selected && selected.id === id) {
          set({ selectedBook: null })
        }
      } catch (error) {
        set({
          error: 'Failed to delete book',
          isLoading: false,
        })
        throw error
      }
    },

    // Update reading progress
    updateProgress: async (id: string, pagesRead: number) => {
      try {
        await booksRepository.updateProgress(id, pagesRead)
        const books = await booksRepository.getActive()
        set({ books })

        // Update selected book if it's the one being updated
        const selected = get().selectedBook
        if (selected && selected.id === id) {
          const updated = books.find((b) => b.id === id)
          if (updated) {
            set({ selectedBook: updated })
          }
        }
      } catch (error) {
        console.error('Failed to update progress:', error)
      }
    },

    // Set loading state
    setLoading: (loading) => {
      set({ isLoading: loading })
    },

    // Set error state
    setError: (error) => {
      set({ error })
    },
  }))
)
