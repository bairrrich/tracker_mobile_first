'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { ItemDetail as ItemDetailComponent } from '@/components/shared/item-detail'
import { Button } from '@/components/ui/button'
import { useItemsStore } from '@/store/items-store'
import { ArrowLeft, Edit, Trash2, MoreVertical } from 'lucide-react'
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

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedItem, selectItem, deleteItem } = useItemsStore()
  const t = useTranslations('ItemDetail')
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const itemId = params.itemId as string

  React.useEffect(() => {
    // Load item data (in real app, fetch from store/API)
    // For demo, we'll use mock data
    console.log('Loading item:', itemId)

    return () => {
      selectItem(null)
    }
  }, [itemId, selectItem])

  const handleDelete = async () => {
    if (!selectedItem) return

    setIsDeleting(true)
    try {
      await deleteItem(selectedItem.id)  // Already UUID string
      router.push('/collections')
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!selectedItem) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

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
            {t('back')}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              {t('edit')}
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
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Item Detail */}
        <ItemDetailComponent
          title="Atomic Habits"
          subtitle="James Clear"
          description="An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results."
          icon="📚"
          tags={['Productivity', 'Self-Help', 'Psychology']}
          metrics={[
            { label: 'Pages Read', value: '142 / 320' },
            { label: 'Rating', value: '⭐ 4.8' },
          ]}
          progress={[{ label: 'Reading Progress', value: 44 }]}
          notes="Key insight: Focus on systems, not goals. Small improvements compound over time."
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deleteItem')}</DialogTitle>
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
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t('deleting') : t('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
