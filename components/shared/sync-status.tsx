'use client'

import { useSync } from '@/hooks/use-sync'
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function SyncStatus() {
  const {
    syncStatus,
    isOnline,
    unsyncedCount,
    formatLastSync,
    triggerSync,
  } = useSync()

  const getStatusIcon = () => {
    if (!isOnline) {
      return <CloudOff className="h-4 w-4 text-muted-foreground" />
    }

    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin text-[var(--primary)]" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />
      case 'idle':
        if (unsyncedCount > 0) {
          return <Cloud className="h-4 w-4 text-warning" />
        }
        return <CheckCircle className="h-4 w-4 text-success" />
      default:
        return <Cloud className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline'
    }

    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...'
      case 'error':
        return 'Sync error'
      case 'idle':
        if (unsyncedCount > 0) {
          return `${unsyncedCount} pending`
        }
        return 'Synced'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    if (!isOnline) {
      return 'text-muted-foreground'
    }

    switch (syncStatus) {
      case 'syncing':
        return 'text-[var(--primary)]'
      case 'error':
        return 'text-error'
      case 'idle':
        return unsyncedCount > 0 ? 'text-warning' : 'text-success'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9 px-3"
          aria-label="Sync status"
        >
          {getStatusIcon()}
          <span className="hidden sm:inline text-sm">{getStatusText()}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="font-medium">Sync Status</span>
            {getStatusIcon()}
          </div>
          <div className={`text-xs mt-1 ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        <div className="p-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last sync</span>
            <span>{formatLastSync()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending changes</span>
            <span>{unsyncedCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Connection</span>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="p-2 border-t border-[var(--border)]">
          <Button
            onClick={triggerSync}
            disabled={!isOnline || syncStatus === 'syncing'}
            size="sm"
            className="w-full"
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
