'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { SupplementInventory, Supplement } from '@/lib/db'
import { format } from 'date-fns'

interface SupplementInventoryCardProps {
  inventory: SupplementInventory
  supplement?: Supplement
  onEdit: () => void
  onDelete: () => void
}

export function SupplementInventoryCard({ inventory, supplement, onEdit, onDelete }: SupplementInventoryCardProps) {
  const t = useTranslations('Supplements')
  
  const formatCurrency = (amount?: number) => {
    if (!amount) return ''
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return format(new Date(date), 'dd.MM.yyyy')
  }

  const isExpired = inventory.expirationDate && new Date(inventory.expirationDate) < new Date()
  const isLowStock = inventory.minQuantity && inventory.quantity <= inventory.minQuantity

  return (
    <Card className={`bg-[var(--card)] border-[var(--border)] ${isExpired ? 'border-red-500' : ''} ${isLowStock ? 'border-yellow-500' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{supplement?.name || t('supplement')}</h3>
              {supplement?.brand && <p className="text-xs text-[var(--text-muted)]">{supplement.brand}</p>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">⋮</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>{t('edit')}</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-500">{t('delete')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('quantity')}</p>
              <p className={`text-lg font-bold ${isLowStock ? 'text-yellow-500' : 'text-[var(--text)]'}`}>
                {inventory.quantity} {inventory.unit || 'шт'}
              </p>
              {isLowStock && <Badge variant="secondary" className="text-xs mt-1">{t('lowStock')}</Badge>}
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('expirationDate')}</p>
              <p className={`text-sm ${isExpired ? 'text-red-500 font-bold' : 'text-[var(--text)]'}`}>
                {formatDate(inventory.expirationDate) || '—'}
              </p>
              {isExpired && <Badge variant="destructive" className="text-xs mt-1">{t('expired')}</Badge>}
            </div>
          </div>

          {(inventory.purchaseDate || inventory.price) && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
              {inventory.purchaseDate && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t('purchaseDate')}</p>
                  <p className="text-sm">{formatDate(inventory.purchaseDate)}</p>
                </div>
              )}
              {inventory.price && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t('price')}</p>
                  <p className="text-sm">{formatCurrency(inventory.price)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}