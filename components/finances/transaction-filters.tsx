'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import type { TransactionFilters } from '@/lib/repositories/finance-transactions-repository'
import type { FinanceAccount, FinanceCategory } from '@/lib/db'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
}

export function TransactionFilters({ filters, onFiltersChange, accounts, categories }: TransactionFiltersProps) {
  const t = useTranslations('Finances')
  const [dateOpen, setDateOpen] = React.useState(false)

  const hasActiveFilters = filters.type || filters.accountId || filters.categoryId || filters.startDate || filters.endDate || filters.searchQuery

  const clearFilters = () => {
    onFiltersChange({})
  }

  const removeFilter = (key: keyof TransactionFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const formatDate = (date: Date) => format(date, 'dd.MM.yyyy', { locale: ru })

  return (
    <div className="space-y-4">
      {/* Search and Type Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder={t('searchTransactions')}
            value={filters.searchQuery || ''}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value || undefined })}
          />
        </div>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, type: value === 'all' ? undefined : value as any })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value="income">{t('income')}</SelectItem>
            <SelectItem value="expense">{t('expense')}</SelectItem>
            <SelectItem value="transfer">{t('transfer')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Account, Category, Date Filters */}
      <div className="grid gap-2 md:grid-cols-3">
        <Select
          value={filters.accountId || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, accountId: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('allAccounts')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allAccounts')}</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, categoryId: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate || filters.endDate ? (
                filters.startDate && filters.endDate ? (
                  `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
                ) : filters.startDate ? (
                  `От ${formatDate(filters.startDate)}`
                ) : (
                  `До ${formatDate(filters.endDate!)}`
                )
              ) : (
                <span>{t('filterByDate')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Дата от</p>
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => onFiltersChange({ ...filters, startDate: date || undefined })}
                  initialFocus
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Дата до</p>
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => onFiltersChange({ ...filters, endDate: date || undefined })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--text-muted)]">Активные фильтры:</span>
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              {t(filters.type)}
              <button onClick={() => removeFilter('type')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.accountId && (
            <Badge variant="secondary" className="gap-1">
              {accounts.find(a => a.id === filters.accountId)?.name}
              <button onClick={() => removeFilter('accountId')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.id === filters.categoryId)?.name}
              <button onClick={() => removeFilter('categoryId')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              От {formatDate(filters.startDate)}
              <button onClick={() => removeFilter('startDate')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="gap-1">
              До {formatDate(filters.endDate)}
              <button onClick={() => removeFilter('endDate')} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-5 text-xs">
            Очистить все
          </Button>
        </div>
      )}
    </div>
  )
}