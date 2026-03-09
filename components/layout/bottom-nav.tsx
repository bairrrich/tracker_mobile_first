'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Home, Dumbbell, Plus, Folder, Settings } from 'lucide-react'

export function BottomNav() {
  const t = useTranslations('Navigation')
  const router = useRouter()

  const navItems = [
    { id: 'home', icon: Home, label: t('home'), href: '/' },
    { id: 'exercises', icon: Dumbbell, label: t('exercises'), href: '/exercises' },
    { id: 'add', icon: Plus, label: t('add'), href: '/collections', isPrimary: true },
    { id: 'collections', icon: Folder, label: t('collections'), href: '/collections' },
    { id: 'settings', icon: Settings, label: t('settings'), href: '/settings' },
  ] as const

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        const isPrimary = (item as typeof navItems[number] & { isPrimary?: boolean }).isPrimary

        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={`
              flex flex-col items-center justify-center gap-1 p-2 min-w-[64px]
              transition-colors
              ${isPrimary
                ? 'text-[var(--primary)] -mt-8'
                : 'text-muted-foreground hover:text-[var(--text)]'
              }
            `}
            aria-label={item.label}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isPrimary
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg'
                  : ''
                }
              `}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
