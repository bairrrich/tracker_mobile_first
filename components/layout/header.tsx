'use client'

import { useTranslations } from 'next-intl'
import { ThemeToggle } from './theme-toggle'
import { Search, LogOut } from 'lucide-react'
import { useSupabase } from '@/components/auth/supabase-provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function Header() {
  const t = useTranslations('Navigation')
  const { user, signOut } = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm md:ml-64">
      <div className="h-[55px] flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="font-semibold hidden sm:inline">{t('tracker')}</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title={t('signOut')}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
