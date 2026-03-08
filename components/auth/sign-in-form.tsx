'use client'

import * as React from 'react'
import { signInWithEmail } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/form-field'
import { Alert } from '@/components/ui/alert'

interface SignInFormProps {
  onSuccess?: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error } = await signInWithEmail(email, password)

      if (error) {
        setError(error.message)
      } else if (data.user) {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Email" error={error} id="email">
        <Input
          id="email"
          type="email"
          placeholder="demo@demo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Password" id="password">
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Demo: demo@demo.com / demo
      </p>
    </form>
  )
}
