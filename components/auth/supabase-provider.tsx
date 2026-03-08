'use client'

import * as React from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getSession, signOut as supabaseSignOut } from '@/lib/supabase'

interface SupabaseContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const SupabaseContext = React.createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Get initial session
    getSession().then((session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }).catch((err) => {
      console.error('Failed to get session:', err)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabaseSignOut()
    setUser(null)
    setSession(null)
  }

  return (
    <SupabaseContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = React.useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
