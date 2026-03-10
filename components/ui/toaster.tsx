'use client'

import { Toaster } from 'sonner'

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-[var(--card)] border-[var(--border)] text-[var(--text)]',
          success: 'border-green-500',
          error: 'border-red-500',
          warning: 'border-yellow-500',
          info: 'border-blue-500',
        },
      }}
      richColors
    />
  )
}