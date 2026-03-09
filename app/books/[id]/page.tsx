'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { BookForm } from '@/components/forms/book-form'
import { QuoteForm } from '@/components/forms/quote-form'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBooksStore } from '@/store/books-store'
import { useBookQuotesStore } from '@/store/book-quotes-store'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Calendar,
  Tag,
  FileText,
  Quote,
  Plus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BookFormData } from '@/lib/validations/book.schema'

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('Books')
  const tCommon = useTranslations('Common')
  const { books, deleteBook, fetchBooks } = useBooksStore()
  const { quotes, fetchQuotes, addQuote, updateQuote, deleteQuote } = useBookQuotesStore()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isQuoteFormOpen, setIsQuoteFormOpen] = React.useState(false)
  const [editData, setEditData] = React.useState<BookFormData & { id?: string } | null>(null)
  const [editQuoteData, setEditQuoteData] = React.useState<{ text: string; page?: number } | null>(null)
  const [selectedQuoteId, setSelectedQuoteId] = React.useState<string | null>(null)

  const bookId = params.id as string  // UUID string

  // Find current book from books array by UUID
  const selectedBookData = React.useMemo(
    () => books.find((b) => b.id === bookId) || null,
    [books, bookId]
  )

  React.useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  // Fetch quotes when book is loaded
  React.useEffect(() => {
    if (bookId) {
      fetchQuotes(bookId)
    }
  }, [bookId, fetchQuotes])

  const handleAddQuote = async (text: string, page?: number) => {
    if (!bookId) return
    await addQuote(bookId, text, page)
  }

  const handleEditQuote = async (text: string, page?: number) => {
    if (!selectedQuoteId) return
    await updateQuote(selectedQuoteId, text, page)
    setSelectedQuoteId(null)
  }

  const handleDeleteQuote = async (id: string) => {
    await deleteQuote(id)
  }

  const handleDelete = async () => {
    if (!selectedBookData) return

    setIsDeleting(true)
    try {
      await deleteBook(selectedBookData.id)
      router.push('/books')
    } catch (error) {
      console.error('Failed to delete book:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEdit = () => {
    if (!selectedBookData) return

    setEditData({
      id: selectedBookData.id,
      title: selectedBookData.title,
      author: selectedBookData.author,
      description: selectedBookData.description || '',
      coverImage: selectedBookData.coverImage || '',
      status: selectedBookData.status,
      rating: selectedBookData.rating,
      pagesTotal: selectedBookData.pagesTotal,
      pagesRead: selectedBookData.pagesRead || 0,
      startDate: selectedBookData.startDate ? selectedBookData.startDate.toISOString().split('T')[0] : '',
      endDate: selectedBookData.endDate ? selectedBookData.endDate.toISOString().split('T')[0] : '',
      genre: selectedBookData.genre || '',
      isbn: selectedBookData.isbn || '',
      publisher: selectedBookData.publisher || '',
      publishYear: selectedBookData.publishYear,
      language: selectedBookData.language || '',
      format: selectedBookData.format,
      notes: selectedBookData.notes || '',
    })
    setIsFormOpen(true)
  }

  // Status colors
  const statusColors: Record<string, string> = {
    reading: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
    planned: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    abandoned: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }

  if (!selectedBookData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">{tCommon('loading')}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const progress = selectedBookData.pagesTotal && selectedBookData.pagesTotal > 0
    ? Math.round(((selectedBookData.pagesRead || 0) / selectedBookData.pagesTotal) * 100)
    : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              {tCommon('edit')}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-error"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {tCommon('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Book Cover and Info */}
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Cover */}
          <Card className="overflow-hidden h-fit">
            <CardContent className="p-0">
              <div className="aspect-[2/3] w-full max-w-[200px] mx-auto relative bg-[var(--card)]">
                {selectedBookData.coverImage ? (
                  <img
                    src={selectedBookData.coverImage}
                    alt={selectedBookData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl">
                    📚
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{selectedBookData.title}</h1>
                <p className="text-lg text-muted-foreground truncate">{selectedBookData.author}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[selectedBookData.status]}>
                    {t(selectedBookData.status)}
                  </Badge>
                  {selectedBookData.rating && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {selectedBookData.rating}
                    </span>
                  )}
                </div>
                {/* Progress */}
                {selectedBookData.pagesTotal && selectedBookData.pagesTotal > 0 && (
                  <div className="w-36">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium">
                        {selectedBookData.pagesRead} / {selectedBookData.pagesTotal}
                      </span>
                      <span className="font-semibold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            </div>

            {/* Genre and format badges */}
            {(selectedBookData.genre || selectedBookData.format) && (
              <div className="flex flex-wrap gap-2">
                {selectedBookData.genre && (
                  <Badge variant="outline">{selectedBookData.genre}</Badge>
                )}
                {selectedBookData.format && (
                  <Badge variant="outline" className="capitalize">
                    {t(selectedBookData.format)}
                  </Badge>
                )}
              </div>
            )}

            {selectedBookData.description && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    {t('description')}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedBookData.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs for Book Details and Notes - full width row below columns */}
        <div className="w-full">
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notes">{t('notes')}</TabsTrigger>
              <TabsTrigger value="quotes">{t('quotes')}</TabsTrigger>
              <TabsTrigger value="details">{t('bookDetails')}</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    {t('notes')}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedBookData.notes ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedBookData.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('noNotes')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quotes">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Quote className="w-4 h-4" />
                      {t('quotes')}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditQuoteData(null)
                      setSelectedQuoteId(null)
                      setIsQuoteFormOpen(true)
                    }}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('addQuote')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {quotes.length > 0 ? (
                    <div className="space-y-3">
                      {quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="group relative border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r hover:bg-primary/10 transition-colors"
                        >
                          <p className="text-sm text-muted-foreground italic pr-16">
                            {quote.text}
                          </p>
                          {quote.page && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {t('page')} {quote.page}
                            </p>
                          )}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditQuoteData({ text: quote.text, page: quote.page })
                                setSelectedQuoteId(quote.id)
                                setIsQuoteFormOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-error hover:text-error"
                              onClick={() => handleDeleteQuote(quote.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Quote className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        {t('noQuotes')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="w-4 h-4" />
                    {t('bookDetails')}
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {selectedBookData.isbn && (
                      <div>
                        <dt className="text-muted-foreground">{t('isbn')}</dt>
                        <dd className="font-medium">{selectedBookData.isbn}</dd>
                      </div>
                    )}
                    {selectedBookData.publisher && (
                      <div>
                        <dt className="text-muted-foreground">{t('publisher')}</dt>
                        <dd className="font-medium">{selectedBookData.publisher}</dd>
                      </div>
                    )}
                    {selectedBookData.publishYear && (
                      <div>
                        <dt className="text-muted-foreground">{t('publishYear')}</dt>
                        <dd className="font-medium">{selectedBookData.publishYear}</dd>
                      </div>
                    )}
                    {selectedBookData.language && (
                      <div>
                        <dt className="text-muted-foreground">{t('language')}</dt>
                        <dd className="font-medium capitalize">{selectedBookData.language}</dd>
                      </div>
                    )}
                    {selectedBookData.startDate && (
                      <div>
                        <dt className="text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('startDate')}
                        </dt>
                        <dd className="font-medium">
                          {new Date(selectedBookData.startDate).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                    {selectedBookData.endDate && (
                      <div>
                        <dt className="text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('endDate')}
                        </dt>
                        <dd className="font-medium">
                          {new Date(selectedBookData.endDate).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deleteBook')}</DialogTitle>
              <DialogDescription>
                {t('deleteConfirmation')}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? tCommon('deleting') : tCommon('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Book Form */}
        <BookForm
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setEditData(null)
          }}
          editBook={editData}
        />

        {/* Add/Edit Quote Form */}
        <QuoteForm
          open={isQuoteFormOpen}
          onOpenChange={(open) => {
            setIsQuoteFormOpen(open)
            if (!open) {
              setEditQuoteData(null)
              setSelectedQuoteId(null)
            }
          }}
          onSubmit={editQuoteData ? handleEditQuote : handleAddQuote}
          editQuote={editQuoteData}
        />
      </div>
    </MainLayout>
  )
}
