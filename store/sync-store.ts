import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { getUnsyncedRecords, markAsSynced } from '@/lib/db'

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
        // Get unsynced records
        const unsynced = await getUnsyncedRecords()

        if (unsynced.length === 0) {
          set({ syncStatus: 'idle' })
          return
        }

        // Send to server (placeholder - implement actual sync logic)
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes: unsynced }),
        })

        // Mark as synced
        const ids = unsynced.map((record) => record.id)
        await markAsSynced(ids)

        // Update state
        set({
          syncStatus: 'idle',
          lastSync: new Date(),
          unsyncedCount: 0,
        })
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
      const unsynced = await getUnsyncedRecords()
      set({ unsyncedCount: unsynced.length })
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
