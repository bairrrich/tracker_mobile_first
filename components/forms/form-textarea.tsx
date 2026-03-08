import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Textarea as UITextarea } from '@/components/ui/textarea'
import { FormField } from './form-field'
import { cn } from '@/lib/utils'

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string | null
  description?: string
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, name, error, description, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        error={error}
        description={description}
        id={name}
      >
        <UITextarea
          ref={ref}
          id={name}
          className={cn(error && 'border-error focus-visible:ring-error', className)}
          {...props}
        />
      </FormField>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// Hook-based version for react-hook-form
export interface RHFTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  label: string
  name: string
  description?: string
}

export function RHFTextarea({ label, name, description, ...props }: RHFTextareaProps) {
  const { register, formState: { errors } } = useFormContext()
  
  const error = errors[name]?.message as string | undefined
  
  return (
    <FormField
      label={label}
      error={error || null}
      description={description}
      id={name}
    >
      <UITextarea
        {...register(name)}
        id={name}
        className={cn(error && 'border-error focus-visible:ring-error')}
        {...props}
      />
    </FormField>
  )
}
