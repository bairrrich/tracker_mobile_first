import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  label: string
  error?: string | null
  children: React.ReactNode
  description?: string
  className?: string
  id?: string
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, children, description, className, id }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {children}

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
))

FormDescription.displayName = 'FormDescription'

export const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null

  return (
    <p
      ref={ref}
      className={cn('text-sm text-error', className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  )
})

FormError.displayName = 'FormError'

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null

  return (
    <p
      ref={ref}
      className={cn('text-sm font-medium', className)}
      {...props}
    >
      {children}
    </p>
  )
})

FormMessage.displayName = 'FormMessage'
