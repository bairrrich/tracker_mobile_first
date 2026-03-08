import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { FormField } from './form-field'
import { cn } from '@/lib/utils'

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string | null
  description?: string
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, name, error, description, className, ...props }, ref) => {
    return (
      <FormField
        label={label}
        error={error}
        description={description}
        id={name}
      >
        <Input
          ref={ref}
          id={name}
          className={cn(error && 'border-error focus-visible:ring-error', className)}
          {...props}
        />
      </FormField>
    )
  }
)

FormInput.displayName = 'FormInput'

// Hook-based version that integrates with react-hook-form
export interface RHFInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string
  name: string
  description?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'color' | 'date' | 'time'
}

export function RHFInput({ label, name, description, type = 'text', ...props }: RHFInputProps) {
  const { register, formState: { errors } } = useFormContext()
  
  const error = errors[name]?.message as string | undefined
  
  return (
    <FormField
      label={label}
      error={error || null}
      description={description}
      id={name}
    >
      <Input
        {...register(name)}
        id={name}
        type={type}
        className={cn(error && 'border-error focus-visible:ring-error')}
        {...props}
      />
    </FormField>
  )
}
