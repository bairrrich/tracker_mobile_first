'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Home,
  Wallet,
  Dumbbell,
  Book,
  Pill,
  Utensils,
  Folder,
  BarChart3,
  Settings
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('Navigation')

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard'), href: '/' },
    { id: 'finances', icon: Wallet, label: t('finances'), href: '/finances' },
    { id: 'exercises', icon: Dumbbell, label: t('exercises'), href: '/exercises' },
    { id: 'books', icon: Book, label: t('books'), href: '/books' },
    { id: 'supplements', icon: Pill, label: t('supplements'), href: '/supplements' },
    { id: 'food', icon: Utensils, label: t('food'), href: '/food' },
    { id: 'collections', icon: Folder, label: t('collections'), href: '/collections' },
    { id: 'analytics', icon: BarChart3, label: t('analytics'), href: '/analytics' },
  ] as const

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      {/* Logo */}
      <div className="h-[55px] flex items-center px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--primary-foreground)] font-bold text-sm">T</span>
          </div>
          <span className="font-semibold truncate">{t('tracker')}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                    ${isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--text)]/70 hover:bg-[var(--card)] hover:text-[var(--text)]'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-[var(--border)]">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
            pathname === '/settings'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'text-[var(--text)]/70 hover:bg-[var(--card)] hover:text-[var(--text)]'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">{t('settings')}</span>
        </Link>
      </div>
    </aside>
  )
}
