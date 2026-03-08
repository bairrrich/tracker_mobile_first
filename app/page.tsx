'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { MetricCard } from '@/components/shared/metric-card'
import { ActivityItem } from '@/components/shared/activity-item'
import { CollectionCard } from '@/components/shared/collection-card'
import { SyncStatus } from '@/components/shared/sync-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCollectionsStore } from '@/store/collections-store'
import { useItemsStore } from '@/store/items-store'
import { useSync } from '@/hooks/use-sync'
import { Wallet, BookOpen, Dumbbell, Pill, Search, Plus } from 'lucide-react'

export default function DashboardPage() {
  const t = useTranslations('HomePage')
  const { fetchCollections, collections } = useCollectionsStore()
  const { items } = useItemsStore()
  const { isOnline, unsyncedCount } = useSync()
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  // Get recent items across all collections
  const recentItems = React.useMemo(() => {
    return items.slice(0, 5)
  }, [items])

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const totalCollections = collections.length
    const totalItems = items.length
    const pendingSync = unsyncedCount

    return {
      totalCollections,
      totalItems,
      pendingSync,
    }
  }, [collections, items, unsyncedCount])

  // Filter collections based on search
  const filteredCollections = React.useMemo(() => {
    if (!searchQuery) return collections
    return collections.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [collections, searchQuery])

  const getCollectionIcon = (type: string) => {
    switch (type) {
      case 'finances':
        return <Wallet className="w-6 h-6" />
      case 'books':
        return <BookOpen className="w-6 h-6" />
      case 'exercises':
        return <Dumbbell className="w-6 h-6" />
      case 'supplements':
        return <Pill className="w-6 h-6" />
      default:
        return undefined
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('trackActivities')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SyncStatus />
          </div>
        </div>

        {/* Metrics Grid */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">
            {t('keyMetrics')}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard
              value={metrics.totalItems}
              label={t('totalItems')}
              trend={
                metrics.totalItems > 0
                  ? { value: t('active'), direction: 'up' }
                  : undefined
              }
            />
            <MetricCard
              value={metrics.totalCollections}
              label={t('collections')}
              trend={
                metrics.totalCollections > 0
                  ? { value: t('active'), direction: 'up' }
                  : undefined
              }
            />
            <MetricCard
              value={metrics.pendingSync}
              label={t('pendingSync')}
              trend={
                metrics.pendingSync > 0
                  ? { value: t('unsynced'), direction: 'neutral' }
                  : { value: t('synced'), direction: 'up' }
              }
            />
            <MetricCard
              value={isOnline ? t('online') : t('offline')}
              label={t('status')}
              trend={
                isOnline
                  ? { value: t('connected'), direction: 'up' }
                  : { value: t('disconnected'), direction: 'down' }
              }
            />
          </div>
        </section>

        {/* Search and Quick Actions */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCollections')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('quickAdd')}
            </Button>
          </div>
        </section>

        {/* Collections Grid */}
        <section aria-labelledby="collections-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="collections-heading" className="text-xl font-semibold">
              {t('collections')}
            </h2>
          </div>

          {filteredCollections.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="empty-state-title">{t('noCollections')}</h3>
              <p className="empty-state-description">
                {t('createFirstCollection')}
              </p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                {t('createCollection')}
              </Button>
            </div>
          ) : (
            <div className="collection-grid">
              {filteredCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  title={collection.name}
                  subtitle={collection.description}
                  icon={getCollectionIcon(collection.type)}
                  count={0} // Will be populated from store
                  tags={[]}
                  onClick={() => {
                    // Navigate to collection
                    console.log('Navigate to collection:', collection.id)
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section aria-labelledby="activity-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="activity-heading" className="text-xl font-semibold">
              {t('recentActivity')}
            </h2>
          </div>

          {recentItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">{t('noRecentActivity')}</h3>
              <p className="empty-state-description">
                {t('startAddingItems')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item) => (
                <ActivityItem
                  key={item.id}
                  title={item.name}
                  subtitle={item.description}
                  meta={item.status}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  )
}
