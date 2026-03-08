'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Home, Search, Plus, Folder, Settings } from 'lucide-react'

export function BottomNav() {
  const t = useTranslations('Navigation')
  const [active, setActive] = React.useState('home')

  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'search', icon: Search, label: t('search') },
    { id: 'add', icon: Plus, label: t('add'), isPrimary: true },
    { id: 'collections', icon: Folder, label: t('collections') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ] as const

  type NavItem = typeof navItems[number]

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        const isPrimary = (item as NavItem & { isPrimary?: boolean }).isPrimary

        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`
              flex flex-col items-center justify-center gap-1 p-2 min-w-[64px]
              transition-colors
              ${isPrimary
                ? 'text-primary -mt-8'
                : isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-theme-text'
              }
            `}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isPrimary
                  ? 'bg-primary text-primary-foreground shadow-lg'
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
