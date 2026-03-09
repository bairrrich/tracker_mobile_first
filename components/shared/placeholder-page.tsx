'use client'

import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: string
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  const t = useTranslations('Common')

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        {/* Icon */}
        <div className="text-6xl">{icon}</div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground max-w-md">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('add')}
        </Button>
      </div>
    </MainLayout>
  )
}
