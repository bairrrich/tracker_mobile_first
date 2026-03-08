'use client'

import * as React from 'react'
import { Plus, Wallet, Dumbbell, Book, Pill, Utensils, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAddAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = React.useState(false)

  const actions: QuickAddAction[] = [
    {
      id: 'transaction',
      label: 'Transaction',
      icon: <Wallet className="w-5 h-5" />,
      color: 'bg-emerald-500',
      onClick: () => {
        console.log('Add transaction')
        setIsOpen(false)
      },
    },
    {
      id: 'workout',
      label: 'Workout',
      icon: <Dumbbell className="w-5 h-5" />,
      color: 'bg-blue-500',
      onClick: () => {
        console.log('Add workout')
        setIsOpen(false)
      },
    },
    {
      id: 'book',
      label: 'Book',
      icon: <Book className="w-5 h-5" />,
      color: 'bg-violet-500',
      onClick: () => {
        console.log('Add book')
        setIsOpen(false)
      },
    },
    {
      id: 'supplement',
      label: 'Supplement',
      icon: <Pill className="w-5 h-5" />,
      color: 'bg-amber-500',
      onClick: () => {
        console.log('Add supplement')
        setIsOpen(false)
      },
    },
    {
      id: 'food',
      label: 'Food',
      icon: <Utensils className="w-5 h-5" />,
      color: 'bg-rose-500',
      onClick: () => {
        console.log('Add food')
        setIsOpen(false)
      },
    },
  ]

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-2 md:bottom-8 md:right-8">
        {isOpen && (
          <div className="flex flex-col gap-2 w-full">
            {actions.map((action, index) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg',
                  'bg-theme-card border border-theme-border',
                  'text-theme-text hover:bg-theme-card/80',
                  'transition-all animate-in slide-in-from-bottom-2',
                  'max-w-[200px] self-end'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white', action.color)}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={toggleOpen}
          className={cn(
            'fab relative w-14 h-14 rounded-full shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200',
            isOpen ? 'bg-error rotate-45' : 'bg-primary'
          )}
          aria-label={isOpen ? 'Close quick add' : 'Quick add'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </>
  )
}
