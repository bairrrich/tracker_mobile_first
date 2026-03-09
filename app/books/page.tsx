'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { BookCard } from '@/components/shared/book-card'
import { BookForm } from '@/components/forms/book-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBooksStore } from '@/store/books-store'
import { Search, Plus, Grid, List, Star } from 'lucide-react'

export default function BooksPage() {
  const t = useTranslations('Books')
  const { fetchBooks, books } = useBooksStore()
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [filterGenre, setFilterGenre] = React.useState<string>('all')
  const [isFormOpen, setIsFormOpen] = React.useState(false)

  React.useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  // Filter and search books
  const filteredBooks = React.useMemo(() => {
    return books.filter((book) => {
      // Status filter
      if (filterStatus !== 'all' && book.status !== filterStatus) {
        return false
      }

      // Genre filter
      if (filterGenre !== 'all' && book.genre !== filterGenre) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.description && book.description.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [books, filterStatus, filterGenre, searchQuery])

  // Get unique genres from books
  const availableGenres = React.useMemo(() => {
    const uniqueGenres = new Set(books.map((b) => b.genre).filter((g): g is string => !!g))
    return Array.from(uniqueGenres).sort()
  }, [books])

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

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addBook')}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchBooks')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="reading">{t('reading')}</SelectItem>
                <SelectItem value="completed">{t('completed')}</SelectItem>
                <SelectItem value="planned">{t('planned')}</SelectItem>
                <SelectItem value="abandoned">{t('abandoned')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Genre Filter */}
            {availableGenres.length > 0 && (
              <Select value={filterGenre} onValueChange={setFilterGenre}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={t('genre')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  {availableGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* View Mode Toggle */}
            <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-[var(--card)] hover:bg-[var(--card)]/80'
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
                    : 'bg-[var(--card)] hover:bg-[var(--card)]/80'
                }`}
                aria-label={t('listView')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Books Content */}
        {filteredBooks.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="empty-state-icon text-6xl mb-4">📚</div>
            <h3 className="empty-state-title text-xl font-semibold mb-2">
              {t('noBooksFound')}
            </h3>
            <p className="empty-state-description text-muted-foreground max-w-md mx-auto mb-4">
              {searchQuery || filterStatus !== 'all' || filterGenre !== 'all'
                ? t('adjustFilters')
                : t('createFirstBook')}
            </p>
            {!searchQuery && filterStatus === 'all' && filterGenre === 'all' && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addBook')}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => {
                      window.location.href = `/books/${book.id}`
                    }}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="list-item cursor-pointer flex items-center gap-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 transition-colors"
                    onClick={() => {
                      window.location.href = `/books/${book.id}`
                    }}
                  >
                    {/* Cover */}
                    <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-[var(--card)]">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📚
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{book.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {book.author}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <BadgeStatus status={book.status} t={t} />
                        {book.genre && (
                          <span className="text-xs text-muted-foreground">
                            • {book.genre}
                          </span>
                        )}
                        {book.rating && (
                          <span className="text-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {book.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    {book.pagesTotal && book.pagesTotal > 0 && (
                      <div className="w-32 flex-shrink-0">
                        <div className="text-xs text-muted-foreground mb-1">
                          {book.pagesRead || 0} / {book.pagesTotal}
                        </div>
                        <Progress
                          value={((book.pagesRead || 0) / book.pagesTotal) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Book Form */}
      <BookForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </MainLayout>
  )
}

// Helper component for status badge
function BadgeStatus({ status, t }: { status: string; t: any }) {
  const colors: Record<string, string> = {
    reading: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
    planned: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    abandoned: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[status]}`}>
      {t(status)}
    </span>
  )
}
