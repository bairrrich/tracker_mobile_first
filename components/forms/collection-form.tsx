'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCollectionsStore } from '@/store/collections-store'
import type { CollectionType } from '@/lib/db'

interface CollectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editId?: number | null
}

const collectionTypes: { value: CollectionType; label: string; icon: string }[] =
  [
    { value: 'finances', label: 'Finances', icon: '💰' },
    { value: 'exercises', label: 'Exercises', icon: '💪' },
    { value: 'books', label: 'Books', icon: '📚' },
    { value: 'supplements', label: 'Supplements', icon: '💊' },
    { value: 'food', label: 'Food', icon: '🍎' },
    { value: 'herbs', label: 'Herbs', icon: '🌿' },
    { value: 'notes', label: 'Notes', icon: '📝' },
    { value: 'custom', label: 'Custom', icon: '📦' },
  ]

export function CollectionForm({
  open,
  onOpenChange,
  editId,
}: CollectionFormProps) {
  const { addCollection, updateCollection } = useCollectionsStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form state
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState<CollectionType>('custom')
  const [description, setDescription] = React.useState('')
  const [color, setColor] = React.useState('')

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setName('')
      setType('custom')
      setDescription('')
      setColor('')
      setIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (editId) {
        await updateCollection(editId, {
          name: name.trim(),
          description: description.trim() || undefined,
          color: color || undefined,
        })
      } else {
        await addCollection({
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          color: color || undefined,
          icon: collectionTypes.find((t) => t.value === type)?.icon,
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save collection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEdit = !!editId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Collection' : 'Create Collection'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update your collection details'
                : 'Add a new collection to track your activities'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none"
              >
                Name
              </label>
              <Input
                id="name"
                placeholder="My Collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Type */}
            {!isEdit && (
              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="text-sm font-medium leading-none"
                >
                  Type
                </label>
                <Select value={type} onValueChange={(v) => setType(v as CollectionType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="mr-2">{t.icon}</span>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none"
              >
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe your collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label
                htmlFor="color"
                className="text-sm font-medium leading-none"
              >
                Color (optional)
              </label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <div className="flex-1 flex items-center text-sm text-muted-foreground">
                  Choose a color for this collection
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
