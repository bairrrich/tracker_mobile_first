import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { performSync, getUnsyncedCount } from '@/lib/sync-engine'

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

interface SyncState {
  // State
  syncStatus: SyncStatus
  lastSync: Date | null
  unsyncedCount: number
  errorMessage: string | null

  // Actions
  startSync: () => Promise<void>
  completeSync: () => void
  setSyncError: (error: string) => void
  updateLastSync: () => void
  checkUnsyncedCount: () => Promise<void>
  setOffline: () => void
  setIdle: () => void
}

export const useSyncStore = create<SyncState>()(
  subscribeWithSelector((set) => ({
    // Initial state
    syncStatus: 'idle',
    lastSync: null,
    unsyncedCount: 0,
    errorMessage: null,

    // Start sync process
    startSync: async () => {
      set({ syncStatus: 'syncing', errorMessage: null })

      // Check if online
      if (!navigator.onLine) {
        set({ syncStatus: 'offline' })
        return
      }

      try {
        // Perform sync using sync engine
        const result = await performSync()

        if (result.success) {
          set({
            syncStatus: 'idle',
            lastSync: result.lastSync,
            unsyncedCount: 0,
          })
        } else {
          set({
            syncStatus: 'error',
            errorMessage: result.errors.join(', '),
          })
        }
      } catch (error) {
        set({
          syncStatus: 'error',
          errorMessage: 'Sync failed',
        })
      }
    },

    // Complete sync
    completeSync: () => {
      set({
        syncStatus: 'idle',
        lastSync: new Date(),
      })
    },

    // Set sync error
    setSyncError: (error) => {
      set({
        syncStatus: 'error',
        errorMessage: error,
      })
    },

    // Update last sync time
    updateLastSync: () => {
      set({ lastSync: new Date() })
    },

    // Check unsynced count
    checkUnsyncedCount: async () => {
      const count = await getUnsyncedCount()
      set({ unsyncedCount: count })
    },

    // Set offline status
    setOffline: () => {
      set({ syncStatus: 'offline' })
    },

    // Set idle status
    setIdle: () => {
      set({ syncStatus: 'idle' })
    },
  }))
)

// Auto-check unsynced count on store initialization
useSyncStore.getState().checkUnsyncedCount()

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const { syncStatus, startSync } = useSyncStore.getState()
    if (syncStatus === 'offline') {
      startSync()
    }
  })

  window.addEventListener('offline', () => {
    useSyncStore.getState().setOffline()
  })
}
