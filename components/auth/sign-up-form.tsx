'use client'

import * as React from 'react'
import { signUpWithEmail } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/form-field'
import { Alert } from '@/components/ui/alert'

interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await signUpWithEmail(email, password)

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
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
      <FormField label="Email" error={error} id="signup-email">
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Password" id="signup-password">
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Confirm Password" id="confirm-password">
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          Check your email for the confirmation link!
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
