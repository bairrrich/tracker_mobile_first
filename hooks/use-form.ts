import * as React from 'react'
import { ZodSchema, ZodError } from 'zod'

interface UseFormOptions<T> {
  schema: ZodSchema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void> | void
  onError?: (error: ZodError) => void
}

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
  touched: Partial<Record<keyof T, boolean>>
  
  setValue: <K extends keyof T>(key: K, value: T[K]) => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
  validate: () => Promise<boolean>
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
}

export function useForm<T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
  onError,
}: UseFormOptions<T>): UseFormReturn<T> {
  const defaultValuesRef = React.useRef(defaultValues)
  const [values, setValues] = React.useState<T>({
    ...(defaultValues || {}),
  } as T)

  const [errors, setErrorsState] = React.useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))

    // Clear error when value changes
    setErrorsState((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const setErrors = React.useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(newErrors)
  }, [])

  const validate = React.useCallback(async (): Promise<boolean> => {
    try {
      await schema.parseAsync(values)
      setErrorsState({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {}

        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof T
          if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.message
          }
        })

        setErrorsState(fieldErrors)
        onError?.(error as unknown as ZodError)
        return false
      }
      return false
    }
  }, [values, schema, onError])

  const handleSubmit = React.useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {}
    Object.keys(values).forEach((key) => {
      allTouched[key as keyof T] = true
    })
    setTouched(allTouched)

    // Validate
    const isValid = await validate()
    if (!isValid) return

    // Submit
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  const reset = React.useCallback(() => {
    setValues({ ...(defaultValuesRef.current || {}) } as T)
    setErrorsState({})
    setTouched({})
    setIsSubmitting(false)
  }, [])

  // Check if form is valid
  const isValid = React.useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    touched,
    
    setValue,
    setErrors,
    validate,
    handleSubmit,
    reset,
  }
}
