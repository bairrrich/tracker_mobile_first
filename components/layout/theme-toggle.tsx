'use client'

import * as React from 'react'
import { useTheme } from './theme-provider'
import { Moon, Sun, Smartphone } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { value: 'amoled', icon: <Smartphone className="w-4 h-4" />, label: 'AMOLED' },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Theme:</span>
      <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors
              ${theme === t.value
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--card)] hover:bg-[var(--card)]/80'
              }
            `}
            aria-label={`Switch to ${t.label} theme`}
            aria-pressed={theme === t.value}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

type Theme = 'light' | 'dark' | 'amoled'
