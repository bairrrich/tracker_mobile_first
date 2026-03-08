'use client'

import * as React from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InstallPromptProps {
  className?: string
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (dismissed) {
      const dismissedAt = new Date(dismissed)
      const daysSinceDismissal =
        (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissal < 7) {
        setIsDismissed(true)
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('install-prompt-dismissed', new Date().toISOString())
  }

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed || !deferredPrompt) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96',
        'z-50 animate-in slide-in-from-bottom-4 fade-in duration-300',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-xl border border-theme-border bg-theme-card shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 p-1 rounded-md hover:bg-theme-bg transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
              <Download className="h-6 w-6 text-primary-foreground" />
            </div>

            {/* Text */}
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-base">Install App</h3>
              <p className="text-sm text-muted-foreground">
                Install All Tracker Mobile for quick access and offline support.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Not Now
            </Button>
          </div>

          {/* Features */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>⚡ Fast access</span>
            <span>📴 Works offline</span>
            <span>🔔 Notifications</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Type definition for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
