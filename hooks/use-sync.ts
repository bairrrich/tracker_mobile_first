'use client'

import * as React from 'react'
import { useSyncStore } from '@/store/sync-store'

export function useSync() {
  const {
    syncStatus,
    lastSync,
    unsyncedCount,
    errorMessage,
    startSync,
    completeSync,
    setSyncError,
    checkUnsyncedCount,
  } = useSyncStore()

  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    // Check online status
    const checkOnline = () => {
      setIsOnline(navigator.onLine)
    }

    checkOnline()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming back online
      if (syncStatus === 'offline' || syncStatus === 'error') {
        startSync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncStatus, startSync])

  // Auto-sync on mount (only on client side)
  React.useEffect(() => {
    // Wait a bit for IndexedDB to initialize
    const timer = setTimeout(() => {
      if (isOnline && syncStatus === 'idle') {
        console.log('[useSync] Auto-sync on mount')
        startSync()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    // Periodically check unsynced count
    const interval = setInterval(() => {
      checkUnsyncedCount()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [checkUnsyncedCount])

  const triggerSync = React.useCallback(async () => {
    if (!isOnline) {
      return
    }
    await startSync()
  }, [isOnline, startSync])

  const formatLastSync = React.useCallback(() => {
    if (!lastSync) return 'Never'

    const now = new Date()
    const diff = now.getTime() - lastSync.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }, [lastSync])

  return {
    // State
    syncStatus,
    lastSync,
    unsyncedCount,
    errorMessage,
    isOnline,

    // Actions
    triggerSync,
    completeSync,
    setSyncError,

    // Helpers
    formatLastSync,
  }
}
