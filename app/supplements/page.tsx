'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useFinancesStore } from '@/store/finances-store'
import { SupplementForm } from '@/components/supplements/supplement-form'
import { SupplementInventoryForm } from '@/components/supplements/supplement-inventory-form'
import { SupplementScheduleForm } from '@/components/supplements/supplement-schedule-form'
import { SupplementInventoryCard } from '@/components/supplements/supplement-inventory-card'
import { SupplementScheduleCard } from '@/components/supplements/supplement-schedule-card'
import { SupplementLogDialog } from '@/components/supplements/supplement-log-dialog'
import type { Supplement } from '@/lib/db'

export default function SupplementsPage() {
  const t = useTranslations('Supplements')
  const tc = useTranslations('Common')
  const { supplements, supplementInventory, supplementSchedules, fetchSupplements, deleteSupplement, toggleSupplement, fetchInventory, fetchSchedules, deleteInventory, toggleSchedule, deleteSchedule, fetchLogs } = useFinancesStore()
  const [isLoading, setIsLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [inventoryOpen, setInventoryOpen] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [selectedSupplement, setSelectedSupplement] = React.useState<Supplement | null>(null)
  const [activeTab, setActiveTab] = React.useState<'supplements' | 'inventory' | 'schedule'>('supplements')
  const [editInventoryId, setEditInventoryId] = React.useState<string | null>(null)
  const [editScheduleId, setEditScheduleId] = React.useState<string | null>(null)
  const [logOpen, setLogOpen] = React.useState(false)
  const [logSupplement, setLogSupplement] = React.useState<Supplement | undefined>(undefined)
  const [logScheduleId, setLogScheduleId] = React.useState<string | undefined>(undefined)

  const inventory = supplementInventory
  const schedules = supplementSchedules

  React.useEffect(() => {
    const loadData = async () => {
      await fetchSupplements()
      await fetchInventory()
      await fetchSchedules()
      await fetchLogs()
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleEdit = (supplement: Supplement) => {
    setSelectedSupplement(supplement)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedSupplement(null)
    setFormOpen(true)
  }

  const handleAddInventory = (supplement: Supplement) => {
    setSelectedSupplement(supplement)
    setInventoryOpen(true)
  }

  const handleAddSchedule = (supplement: Supplement) => {
    setSelectedSupplement(supplement)
    setScheduleOpen(true)
  }

  const handleEditInventory = (id: string) => {
    setEditInventoryId(id)
    setInventoryOpen(true)
  }

  const handleEditSchedule = (id: string) => {
    setEditScheduleId(id)
    setScheduleOpen(true)
  }

  const handleDeleteInventory = async (id: string) => {
    if (confirm('Удалить запасы?')) {
      await deleteInventory(id)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Удалить расписание?')) {
      await deleteSchedule(id)
    }
  }

  const handleToggleSchedule = async (id: string) => {
    await toggleSchedule(id)
  }

  const handleLogIntake = (supplement: Supplement, scheduleId?: string) => {
    setLogSupplement(supplement)
    setLogScheduleId(scheduleId)
    setLogOpen(true)
  }

  const getTypeLabel = (type: string) => t(`types.${type}`) || type
  const getFormLabel = (form: string) => t(`forms.${form}`) || form
  const getCategoryLabel = (category: string) => t(`categories.${category}`) || category

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      vitamin: '💊',
      mineral: '🧂',
      supplement: '🌿',
      protein: '🥤',
      herb: '🌱',
      other: '📦',
    }
    return icons[type] || '💊'
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[var(--text-muted)]">{tc('loading')}</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-[var(--text-muted)]">{t('description')}</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add')}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total')}</CardTitle>
              <Pill className="h-4 w-4 text-[var(--text-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplements.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('active')}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {supplements.filter(s => s.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('lowStock')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="supplements">{t('supplements_list')}</TabsTrigger>
            <TabsTrigger value="inventory">{t('inventory')}</TabsTrigger>
            <TabsTrigger value="schedule">{t('schedule')}</TabsTrigger>
          </TabsList>

          <TabsContent value="supplements" className="space-y-4">

        {/* Supplements List */}
        {supplements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-lg font-semibold mb-2">{t('noSupplements')}</h3>
            <p className="text-[var(--text-muted)] mb-4">{t('createFirst')}</p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {t('add')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {supplements.map((supplement: Supplement) => (
              <Card key={supplement.id} className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(supplement.type)}</span>
                      <div>
                        <CardTitle className="text-base">{supplement.name}</CardTitle>
                        <p className="text-xs text-[var(--text-muted)]">{supplement.brand}</p>
                      </div>
                    </div>
                    <Badge variant={supplement.isActive ? 'default' : 'secondary'} className="text-xs">
                      {supplement.isActive ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{getTypeLabel(supplement.type)}</Badge>
                    <Badge variant="outline">{getFormLabel(supplement.form)}</Badge>
                  </div>
                  {supplement.dosage && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {supplement.dosage} {supplement.dosageUnit}
                    </p>
                  )}
                  {supplement.category && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {getCategoryLabel(supplement.category)}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddInventory(supplement)}
                      title={t('addInventory')}
                    >
                      📦
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSchedule(supplement)}
                      title={t('addSchedule')}
                    >
                      📅
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleSupplement(supplement.id)}
                    >
                      {supplement.isActive ? t('deactivate') : t('activate')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(supplement)}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => deleteSupplement(supplement.id)}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('inventory')}</h3>
              <Button size="sm" onClick={() => { setEditInventoryId(null); setInventoryOpen(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addInventory')}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inventory.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold mb-2">{t('noInventory')}</h3>
                  <p className="text-[var(--text-muted)]">{t('createFirstInventory')}</p>
                </div>
              ) : (
                inventory.map((inv) => (
                  <SupplementInventoryCard
                    key={inv.id}
                    inventory={inv}
                    supplement={supplements.find(s => s.id === inv.supplementId)}
                    onEdit={() => handleEditInventory(inv.id)}
                    onDelete={() => handleDeleteInventory(inv.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('schedule')}</h3>
              <Button size="sm" onClick={() => { setEditScheduleId(null); setScheduleOpen(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addSchedule')}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedules.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold mb-2">{t('noSchedule')}</h3>
                  <p className="text-[var(--text-muted)]">{t('createFirstSchedule')}</p>
                </div>
              ) : (
                schedules.map((sched) => (
                  <SupplementScheduleCard
                    key={sched.id}
                    schedule={sched}
                    supplement={supplements.find(s => s.id === sched.supplementId)}
                    onEdit={() => handleEditSchedule(sched.id)}
                    onDelete={() => handleDeleteSchedule(sched.id)}
                    onToggle={() => handleToggleSchedule(sched.id)}
                    onLog={() => handleLogIntake(supplements.find(s => s.id === sched.supplementId)!, sched.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SupplementForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setSelectedSupplement(null)
        }}
        editId={selectedSupplement?.id}
      />

      <SupplementInventoryForm
        open={inventoryOpen}
        onOpenChange={(open) => {
          setInventoryOpen(open)
          if (!open) {
            setSelectedSupplement(null)
            setEditInventoryId(null)
          }
        }}
        supplementId={selectedSupplement?.id}
        editId={editInventoryId}
      />

      <SupplementScheduleForm
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open)
          if (!open) {
            setSelectedSupplement(null)
            setEditScheduleId(null)
          }
        }}
        supplementId={selectedSupplement?.id}
        editId={editScheduleId}
      />

      <SupplementLogDialog
        open={logOpen}
        onOpenChange={(open) => {
          setLogOpen(open)
          if (!open) {
            setLogSupplement(undefined)
            setLogScheduleId(undefined)
          }
        }}
        supplement={logSupplement}
        scheduleId={logScheduleId}
      />
    </MainLayout>
  )
}
