'use client'

import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Plus, Pill } from 'lucide-react'
import Link from 'next/link'

export default function SupplementsPage() {
  const t = useTranslations('Placeholders')
  const tNav = useTranslations('Navigation')

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-6xl">💊</div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('supplements.title')}</h1>
          <p className="text-muted-foreground max-w-md">{t('supplements.description')}</p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/finances">
              <Pill className="w-4 h-4 mr-2" />
              {tNav('finances')}
            </Link>
          </Button>
          <Button variant="outline" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Скоро
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
