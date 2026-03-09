'use client'

import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FoodPage() {
  const t = useTranslations('Placeholders')
  const tCommon = useTranslations('Common')

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        {/* Icon */}
        <div className="text-6xl">🍎</div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('food.title')}</h1>
          <p className="text-muted-foreground max-w-md">
            {t('food.description')}
          </p>
        </div>

        {/* Action Button */}
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {tCommon('add')}
        </Button>
      </div>
    </MainLayout>
  )
}
