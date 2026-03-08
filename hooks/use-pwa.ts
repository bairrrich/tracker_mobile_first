'use client'

import * as React from 'react'

interface UsePWAOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
}

export function usePWA({ onUpdate, onSuccess }: UsePWAOptions = {}) {
  const [isOnline, setIsOnline] = React.useState(true)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [registration, setRegistration] =
    React.useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)

  React.useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  React.useEffect(() => {
    // Check if app is installed (running as PWA)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isWindowControlsOverlay = window.matchMedia(
        '(display-mode: window-controls-overlay)'
      ).matches
      
      setIsInstalled(isStandalone || isWindowControlsOverlay)
    }

    checkInstalled()
  }, [])

  React.useEffect(() => {
    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })

          setRegistration(reg)

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                setUpdateAvailable(true)
                onUpdate?.(reg)
              }
            })
          })

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'BACKGROUND_SYNC') {
              console.log('[PWA] Background sync:', event.data.status)
            }
          })

          onSuccess?.(reg)
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error)
        }
      }
    }

    registerSW()
  }, [onUpdate, onSuccess])

  const updateServiceWorker = React.useCallback(() => {
    if (registration?.waiting && updateAvailable) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration, updateAvailable])

  const requestNotificationPermission = React.useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  const sendNotification = React.useCallback(
    (title: string, options?: NotificationOptions) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          ...options,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
        })
      }
    },
    []
  )

  const cacheUrls = React.useCallback(async (urls: string[]) => {
    if (registration?.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls,
      })
    }
  }, [registration])

  const triggerBackgroundSync = React.useCallback(async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }
      try {
        await registration.sync?.register('sync-data')
      } catch (error) {
        console.error('[PWA] Background sync failed:', error)
      }
    }
  }, [])

  return {
    // State
    isOnline,
    isInstalled,
    registration,
    updateAvailable,

    // Actions
    updateServiceWorker,
    requestNotificationPermission,
    sendNotification,
    cacheUrls,
    triggerBackgroundSync,
  }
}
