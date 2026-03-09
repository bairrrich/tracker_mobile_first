import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { collectionsRepository } from '@/lib/repositories/collections-repository'
import type { Collection, CollectionType } from '@/lib/db'

interface CollectionsState {
  // State
  collections: Collection[]
  selectedCollection: Collection | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCollections: () => Promise<void>
  selectCollection: (collection: Collection | null) => void
  addCollection: (data: {
    name: string
    type: CollectionType
    icon?: string
    color?: string
    description?: string
  }) => Promise<string>  // Returns UUID string
  updateCollection: (
    id: string,  // UUID string
    data: {
      name?: string
      icon?: string
      color?: string
      description?: string
    }
  ) => Promise<void>
  deleteCollection: (id: string) => Promise<void>  // UUID string
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCollectionsStore = create<CollectionsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    collections: [],
    selectedCollection: null,
    isLoading: false,
    error: null,

    // Fetch all collections
    fetchCollections: async () => {
      set({ isLoading: true, error: null })
      try {
        const collections =
          await collectionsRepository.getAllWithCounts()
        set({ collections, isLoading: false })
      } catch (error) {
        set({
          error: 'Failed to fetch collections',
          isLoading: false,
        })
      }
    },

    // Select a collection
    selectCollection: (collection) => {
      set({ selectedCollection: collection })
    },

    // Add a new collection
    addCollection: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await collectionsRepository.create(data)
        const collections =
          await collectionsRepository.getAllWithCounts()
        set({ collections, isLoading: false })
        return id
      } catch (error) {
        set({
          error: 'Failed to add collection',
          isLoading: false,
        })
        throw error
      }
    },

    // Update a collection
    updateCollection: async (id: string, data) => {  // UUID string
      set({ isLoading: true, error: null })
      try {
        await collectionsRepository.update(id, data)
        const collections =
          await collectionsRepository.getAllWithCounts()
        set({ collections, isLoading: false })

        // Update selected collection if it's the one being updated
        const selected = get().selectedCollection
        if (selected && selected.id === id) {
          const updated = collections.find((c) => c.id === id)
          if (updated) {
            set({ selectedCollection: updated })
          }
        }
      } catch (error) {
        set({
          error: 'Failed to update collection',
          isLoading: false,
        })
        throw error
      }
    },

    // Delete a collection
    deleteCollection: async (id: string) => {  // UUID string
      set({ isLoading: true, error: null })
      try {
        await collectionsRepository.delete(id)
        const collections =
          await collectionsRepository.getAllWithCounts()
        set({ collections, isLoading: false })

        // Clear selected collection if it's the one being deleted
        const selected = get().selectedCollection
        if (selected && selected.id === id) {
          set({ selectedCollection: null })
        }
      } catch (error) {
        set({
          error: 'Failed to delete collection',
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
