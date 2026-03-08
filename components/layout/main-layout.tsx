'use client'

import { Header } from './header'
import { BottomNav } from './bottom-nav'
import { Sidebar } from './sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-theme-bg">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-4">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - hidden on desktop */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
