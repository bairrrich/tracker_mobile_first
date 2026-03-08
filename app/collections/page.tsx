'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { CollectionCard } from '@/components/shared/collection-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCollectionsStore } from '@/store/collections-store'
import { Search, Plus, Grid, List } from 'lucide-react'

export default function CollectionsPage() {
  const { fetchCollections, collections } = useCollectionsStore()
  const t = useTranslations('Collections')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<string>('all')

  React.useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  // Collection types for filter
  const collectionTypes = React.useMemo(() => {
    const types = new Set(collections.map((c) => c.type))
    return ['all', ...Array.from(types)]
  }, [collections])

  // Filter and search collections
  const filteredCollections = React.useMemo(() => {
    return collections.filter((collection) => {
      // Type filter
      if (filterType !== 'all' && collection.type !== filterType) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          collection.name.toLowerCase().includes(query) ||
          (collection.description &&
            collection.description.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [collections, filterType, searchQuery])

  const getCollectionIcon = (type: string) => {
    const icons: Record<string, string> = {
      finances: '💰',
      exercises: '💪',
      books: '📚',
      supplements: '💊',
      food: '🍎',
      herbs: '🌿',
      notes: '📝',
    }
    return icons[type] || '📦'
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('newCollection')}
          </Button>
        </div>

        {/* Search and Filters */}
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

          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                {collectionTypes
                  .filter((t) => t !== 'all')
                  .map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex rounded-md border border-theme-border overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-theme-card hover:bg-theme-card/80'
                }`}
                aria-label={t('gridView')}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-theme-card hover:bg-theme-card/80'
                }`}
                aria-label={t('listView')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collections Content */}
        {filteredCollections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">{t('noCollectionsFound')}</h3>
            <p className="empty-state-description">
              {searchQuery || filterType !== 'all'
                ? t('adjustFilters')
                : t('createFirstCollection')}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                {t('createCollection')}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="collection-grid">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    title={collection.name}
                    subtitle={collection.description}
                    icon={getCollectionIcon(collection.type)}
                    count={0}
                    tags={[collection.type]}
                    onClick={() => {
                      console.log('Navigate to collection:', collection.id)
                    }}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="list-item cursor-pointer"
                    onClick={() => {
                      console.log('Navigate to collection:', collection.id)
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">
                        {getCollectionIcon(collection.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {collection.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {collection.description || 'No description'}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm text-muted-foreground capitalize">
                        {collection.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
