'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { BookForm } from '@/components/forms/book-form'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useBooksStore } from '@/store/books-store'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  Calendar,
  Book,
  Tag,
  FileText,
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
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editData, setEditData] = React.useState<BookFormData & { id?: number } | null>(null)

  const bookId = params.id as string
  const bookIdNum = Number(bookId)

  // Find current book from books array
  const selectedBook = React.useMemo(
    () => books.find((b) => b.id === bookIdNum) || null,
    [books, bookIdNum]
  )

  React.useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleDelete = async () => {
    if (!selectedBook) return

    setIsDeleting(true)
    try {
      await deleteBook(selectedBook.id)
      router.push('/books')
    } catch (error) {
      console.error('Failed to delete book:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEdit = () => {
    if (!selectedBook) return

    setEditData({
      id: selectedBook.id,
      title: selectedBook.title,
      author: selectedBook.author,
      description: selectedBook.description || '',
      coverImage: selectedBook.coverImage || '',
      status: selectedBook.status,
      rating: selectedBook.rating,
      pagesTotal: selectedBook.pagesTotal,
      pagesRead: selectedBook.pagesRead || 0,
      startDate: selectedBook.startDate ? selectedBook.startDate.toISOString().split('T')[0] : '',
      endDate: selectedBook.endDate ? selectedBook.endDate.toISOString().split('T')[0] : '',
      genre: selectedBook.genre || '',
      isbn: selectedBook.isbn || '',
      publisher: selectedBook.publisher || '',
      publishYear: selectedBook.publishYear,
      language: selectedBook.language || '',
      format: selectedBook.format,
      notes: selectedBook.notes || '',
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

  if (!selectedBook) {
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

  const progress = selectedBook.pagesTotal && selectedBook.pagesTotal > 0
    ? Math.round(((selectedBook.pagesRead || 0) / selectedBook.pagesTotal) * 100)
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
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[2/3] relative bg-[var(--card)]">
                {selectedBook.coverImage ? (
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
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
            <div>
              <h1 className="text-2xl font-bold">{selectedBook.title}</h1>
              <p className="text-lg text-muted-foreground">{selectedBook.author}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={statusColors[selectedBook.status]}>
                {t(selectedBook.status)}
              </Badge>
              {selectedBook.genre && (
                <Badge variant="outline">{selectedBook.genre}</Badge>
              )}
              {selectedBook.format && (
                <Badge variant="outline" className="capitalize">
                  {t(selectedBook.format)}
                </Badge>
              )}
              {selectedBook.rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {selectedBook.rating}
                </Badge>
              )}
            </div>

            {selectedBook.description && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    {t('description')}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedBook.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            {selectedBook.pagesTotal && selectedBook.pagesTotal > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Book className="w-4 h-4" />
                    {t('progress')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {selectedBook.pagesRead} / {selectedBook.pagesTotal} {t('pages')}
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  {t('bookDetails')}
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {selectedBook.isbn && (
                    <div>
                      <dt className="text-muted-foreground">{t('isbn')}</dt>
                      <dd className="font-medium">{selectedBook.isbn}</dd>
                    </div>
                  )}
                  {selectedBook.publisher && (
                    <div>
                      <dt className="text-muted-foreground">{t('publisher')}</dt>
                      <dd className="font-medium">{selectedBook.publisher}</dd>
                    </div>
                  )}
                  {selectedBook.publishYear && (
                    <div>
                      <dt className="text-muted-foreground">{t('publishYear')}</dt>
                      <dd className="font-medium">{selectedBook.publishYear}</dd>
                    </div>
                  )}
                  {selectedBook.language && (
                    <div>
                      <dt className="text-muted-foreground">{t('language')}</dt>
                      <dd className="font-medium capitalize">{selectedBook.language}</dd>
                    </div>
                  )}
                  {selectedBook.startDate && (
                    <div>
                      <dt className="text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t('startDate')}
                      </dt>
                      <dd className="font-medium">
                        {new Date(selectedBook.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {selectedBook.endDate && (
                    <div>
                      <dt className="text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t('endDate')}
                      </dt>
                      <dd className="font-medium">
                        {new Date(selectedBook.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Notes */}
            {selectedBook.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    {t('notes')}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedBook.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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
      </div>
    </MainLayout>
  )
}
