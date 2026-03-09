'use client'

import { useEffect } from 'react'
import { seedDefaultData } from '@/lib/seed-data'

let seeded = false

export function useSeedData() {
  useEffect(() => {
    if (typeof window === 'undefined' || seeded) return
    
    seeded = true
    seedDefaultData().catch(console.error)
  }, [])
}
