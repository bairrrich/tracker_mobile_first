import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { itemsRepository } from '@/lib/repositories/items-repository'
import { metricsRepository, historyRepository } from '@/lib/repositories/metrics-repository'
import { tagsRepository, notesRepository } from '@/lib/repositories/tags-repository'
import type { Item, Metric, History, Tag, Note } from '@/lib/db'

type ItemStatus = 'active' | 'archived' | 'completed'
type ViewMode = 'grid' | 'list'

interface Filters {
  status?: ItemStatus
  tags?: string[]  // UUID strings
  minRating?: number
  search?: string
}

interface ItemsState {
  // State
  items: Item[]
  selectedItem: Item | null
  itemMetrics: Metric[]
  itemHistory: History[]
  itemTags: Tag[]
  itemNotes: Note[]
  filters: Filters
  sortBy: string
  viewMode: ViewMode
  isLoading: boolean
  error: string | null

  // Actions
  fetchItems: (collectionId: string) => Promise<void>  // UUID string
  selectItem: (item: Item | null) => Promise<void>
  addItem: (data: {
    collectionId: string  // UUID string
    name: string
    description?: string
    image?: string
    status?: ItemStatus
    rating?: number
  }) => Promise<string>  // Returns UUID string
  updateItem: (
    id: string,  // UUID string
    data: {
      name?: string
      description?: string
      image?: string
      status?: ItemStatus
      rating?: number
    }
  ) => Promise<void>
  deleteItem: (id: string) => Promise<void>  // UUID string
  addMetric: (data: {
    itemId: string  // UUID string
    type: string
    value: number
    unit?: string
  }) => Promise<void>
  addHistory: (data: {
    itemId: string  // UUID string
    action: string
    value?: number
    note?: string
  }) => Promise<void>
  setFilters: (filters: Filters) => void
  setSortBy: (sortBy: string) => void
  setViewMode: (viewMode: ViewMode) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useItemsStore = create<ItemsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    items: [],
    selectedItem: null,
    itemMetrics: [],
    itemHistory: [],
    itemTags: [],
    itemNotes: [],
    filters: {},
    sortBy: 'updatedAt',
    viewMode: 'grid',
    isLoading: false,
    error: null,

    // Fetch items by collection
    fetchItems: async (collectionId: string) => {  // UUID string
      set({ isLoading: true, error: null })
      try {
        const items = await itemsRepository.getByCollection(collectionId)
        set({ items, isLoading: false })
      } catch (error) {
        set({
          error: 'Failed to fetch items',
          isLoading: false,
        })
      }
    },

    // Select an item and load its details
    selectItem: async (item: Item | null) => {
      set({ selectedItem: item })

      if (item) {
        // Load related data
        const [metrics, history, tags, notes] = await Promise.all([
          metricsRepository.getByItem(item.id),
          historyRepository.getByItem(item.id),
          tagsRepository.getByItem(item.id),
          notesRepository.getByItem(item.id),
        ])

        set({
          itemMetrics: metrics,
          itemHistory: history,
          itemTags: tags,
          itemNotes: notes,
        })
      } else {
        set({
          itemMetrics: [],
          itemHistory: [],
          itemTags: [],
          itemNotes: [],
        })
      }
    },

    // Add a new item
    addItem: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const id = await itemsRepository.create(data)
        const items = await itemsRepository.getByCollection(data.collectionId)
        set({ items, isLoading: false })
        return id
      } catch (error) {
        set({
          error: 'Failed to add item',
          isLoading: false,
        })
        throw error
      }
    },

    // Update an item
    updateItem: async (id, data) => {
      set({ isLoading: true, error: null })
      try {
        await itemsRepository.update(id, data)
        const items = get().items.map((item) =>
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        )
        set({ items, isLoading: false })

        // Update selected item if it's the one being updated
        const selected = get().selectedItem
        if (selected && selected.id === id) {
          set({
            selectedItem: { ...selected, ...data, updatedAt: new Date() },
          })
        }
      } catch (error) {
        set({
          error: 'Failed to update item',
          isLoading: false,
        })
        throw error
      }
    },

    // Delete an item
    deleteItem: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await itemsRepository.delete(id)
        const items = get().items.filter((item) => item.id !== id)
        set({ items, isLoading: false })

        // Clear selected item if it's the one being deleted
        const selected = get().selectedItem
        if (selected && selected.id === id) {
          set({
            selectedItem: null,
            itemMetrics: [],
            itemHistory: [],
            itemTags: [],
            itemNotes: [],
          })
        }
      } catch (error) {
        set({
          error: 'Failed to delete item',
          isLoading: false,
        })
        throw error
      }
    },

    // Add a metric
    addMetric: async (data) => {
      try {
        await metricsRepository.create(data)
        const metrics = await metricsRepository.getByItem(data.itemId)
        set({ itemMetrics: metrics })
      } catch (error) {
        set({ error: 'Failed to add metric' })
        throw error
      }
    },

    // Add history entry
    addHistory: async (data) => {
      try {
        await historyRepository.create(data)
        const history = await historyRepository.getByItem(data.itemId)
        set({ itemHistory: history })
      } catch (error) {
        set({ error: 'Failed to add history' })
        throw error
      }
    },

    // Set filters
    setFilters: (filters) => {
      set({ filters })
    },

    // Set sort by
    setSortBy: (sortBy) => {
      set({ sortBy })
    },

    // Set view mode
    setViewMode: (viewMode) => {
      set({ viewMode })
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
