import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { bookQuotesRepository } from '@/lib/repositories/book-quotes-repository'
import type { BookQuote } from '@/lib/db'

interface BookQuotesState {
  // State
  quotes: BookQuote[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchQuotes: (bookId: string) => Promise<void>
  addQuote: (bookId: string, text: string, page?: number) => Promise<number>
  updateQuote: (id: number, text: string, page?: number) => Promise<void>
  deleteQuote: (id: number) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useBookQuotesStore = create<BookQuotesState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    quotes: [],
    isLoading: false,
    error: null,

    // Fetch quotes for a book
    fetchQuotes: async (bookId) => {
      set({ isLoading: true, error: null })
      try {
        const quotes = await bookQuotesRepository.getByBook(bookId)
        set({ quotes, isLoading: false })
      } catch (error) {
        set({
          error: 'Failed to fetch quotes',
          isLoading: false,
        })
      }
    },

    // Add a new quote
    addQuote: async (bookId, text, page) => {
      set({ isLoading: true, error: null })
      try {
        const id = await bookQuotesRepository.create({ bookId, text, page })
        const quotes = await bookQuotesRepository.getByBook(bookId)
        set({ quotes, isLoading: false })
        return id
      } catch (error) {
        set({
          error: 'Failed to add quote',
          isLoading: false,
        })
        throw error
      }
    },

    // Update a quote
    updateQuote: async (id, text, page) => {
      set({ isLoading: true, error: null })
      try {
        await bookQuotesRepository.update(id, { text, page })
        // Reload quotes to get updated data
        const currentQuotes = get().quotes
        const bookId = currentQuotes[0]?.bookId
        if (bookId) {
          const quotes = await bookQuotesRepository.getByBook(bookId)
          set({ quotes, isLoading: false })
        }
      } catch (error) {
        set({
          error: 'Failed to update quote',
          isLoading: false,
        })
        throw error
      }
    },

    // Delete a quote
    deleteQuote: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await bookQuotesRepository.delete(id)
        // Reload quotes to get updated data
        const currentQuotes = get().quotes
        const bookId = currentQuotes[0]?.bookId
        if (bookId) {
          const quotes = await bookQuotesRepository.getByBook(bookId)
          set({ quotes, isLoading: false })
        }
      } catch (error) {
        set({
          error: 'Failed to delete quote',
          isLoading: false,
        })
        throw error
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
