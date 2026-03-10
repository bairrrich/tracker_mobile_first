'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFinancesStore } from '@/store/finances-store'
import { useToast } from '@/hooks/use-toast'
import type { FinanceAccount } from '@/lib/db'

interface CSVImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ParsedRow {
  date?: string
  description?: string
  amount: number
  category?: string
}

export function CSVImport({ open, onOpenChange }: CSVImportProps) {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')
  const toast = useToast()
  const { addTransaction, accounts } = useFinancesStore()
  const [file, setFile] = React.useState<File | null>(null)
  const [accountId, setAccountId] = React.useState<string>('')
  const [preview, setPreview] = React.useState<ParsedRow[]>([])
  const [isImporting, setIsImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const parseCSV = (content: string): ParsedRow[] => {
    const lines = content.split('\n').filter(line => line.trim())
    const rows: ParsedRow[] = []
    const startIndex = lines[0]?.toLowerCase().includes('date') || lines[0]?.toLowerCase().includes('дата') ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]?.trim()
      if (!line) continue
      const columns = line.split(/[,;\t]/).map(col => col.trim().replace(/"/g, ''))
      if (columns.length >= 3) {
        try {
          const date = columns[0]
          const description = columns[1]
          const amountStr = columns[2]?.replace(/[^\d.-]/g, '') || ''
          const amount = parseFloat(amountStr)
          if (!isNaN(amount) && date) {
            rows.push({ date, description, amount })
          }
        } catch (e) {
          console.error('Error parsing row:', line, e)
        }
      }
    }
    return rows
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error({ title: tc('error'), description: t('selectCSVFile') })
      return
    }
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const parsed = parseCSV(content)
      setPreview(parsed.slice(0, 5))
    }
    reader.readAsText(selectedFile, 'utf-8')
  }

  const handleImport = async () => {
    if (!file || !accountId) return
    setIsImporting(true)
    const toastId = toast.loading({ title: 'Импорт транзакций...' })
    try {
      const content = await file.text()
      const rows = parseCSV(content)
      let successCount = 0
      let errorCount = 0
      for (const row of rows) {
        try {
          let dateObj: Date
          if (row.date?.includes('.')) {
            const [day, month, year] = row.date.split('.')
            dateObj = new Date(`${year}-${month}-${day}`)
          } else if (row.date) {
            dateObj = new Date(row.date)
          } else {
            errorCount++
            continue
          }
          if (isNaN(dateObj.getTime())) { errorCount++; continue }
          await addTransaction({
            accountId,
            amount: Math.abs(row.amount),
            type: row.amount >= 0 ? 'income' : 'expense',
            date: dateObj,
            description: row.description || undefined,
          })
          successCount++
        } catch (e) { errorCount++ }
      }
      toast.dismiss(toastId)
      toast.success({ title: 'Импорт завершён', description: `Успешно: ${successCount}, Ошибок: ${errorCount}` })
      onOpenChange(false)
      setFile(null)
      setPreview([])
      setAccountId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      toast.dismiss(toastId)
      toast.error({ title: 'Ошибка импорта', description: error instanceof Error ? error.message : 'Не удалось импортировать файл' })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('importCSV')}</DialogTitle>
          <DialogDescription>Импортируйте транзакции из CSV файла (банковская выписка)</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="account">{t('selectAccount')}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder={t('selectAccount')} /></SelectTrigger>
              <SelectContent>
                {accounts.map((account: FinanceAccount) => (
                  <SelectItem key={account.id} value={account.id}>{account.name} ({account.currency})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">{t('csvFile')}</Label>
            <Input id="file" type="file" accept=".csv" ref={fileInputRef} onChange={handleFileSelect} disabled={isImporting} />
            <p className="text-xs text-[var(--text-muted)]">{t('csvFormat')}</p>
          </div>
          {preview.length > 0 && (
            <div className="border rounded-md p-3 bg-[var(--card)]">
              <p className="text-sm font-medium mb-2">{t('preview')} (5 {t('rows')})</p>
              <div className="text-xs space-y-1 max-h-40 overflow-auto">
                {preview.map((row, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-[var(--text-muted)]">{row.date || ''}</span>
                    <span className="flex-1 truncate">{row.description || ''}</span>
                    <span className={row.amount >= 0 ? 'text-green-500' : 'text-red-500'}>{row.amount >= 0 ? '+' : ''}{row.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { onOpenChange(false); setFile(null); setPreview([]); setAccountId(''); if (fileInputRef.current) fileInputRef.current.value = '' }} disabled={isImporting}>{tc('cancel')}</Button>
          <Button onClick={handleImport} disabled={!file || !accountId || isImporting}>{isImporting ? tc('loading') : t('importCSV')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}