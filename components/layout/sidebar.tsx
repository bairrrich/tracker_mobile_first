'use client'

import { usePathname } from 'next/navigation'
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

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/' },
  { id: 'finances', icon: Wallet, label: 'Finances', href: '/finances' },
  { id: 'exercises', icon: Dumbbell, label: 'Exercises', href: '/exercises' },
  { id: 'books', icon: Book, label: 'Books', href: '/books' },
  { id: 'supplements', icon: Pill, label: 'Supplements', href: '/supplements' },
  { id: 'food', icon: Utensils, label: 'Food', href: '/food' },
  { id: 'collections', icon: Folder, label: 'Collections', href: '/collections' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/analytics' },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      {/* Logo */}
      <div className="p-4 border-b border-theme-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="font-semibold">Tracker</span>
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
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-theme-text-muted hover:bg-theme-card hover:text-theme-text'
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
      <div className="p-4 border-t border-theme-border">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
            pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-theme-text-muted hover:bg-theme-card hover:text-theme-text'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  )
}
