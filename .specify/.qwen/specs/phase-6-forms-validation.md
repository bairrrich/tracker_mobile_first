# Phase 6: Forms & Validation Specification

**Status:** Draft  
**Priority:** P1 (High)  
**Phase:** 6  
**Estimated Time:** 2-3 days

---

## Overview

Phase 6 implements comprehensive form validation using Zod schemas, reusable form components, and proper error handling across the application.

---

## Objectives

1. Create Zod schemas for all data models
2. Implement reusable form components
3. Add client-side validation
4. Implement error handling and display
5. Add input masks and formatting

---

## Tasks

### 6.1 Zod Schemas

**File:** `lib/validations/*.ts`

Create schemas for all entities:

```typescript
// lib/validations/collection.schema.ts
import { z } from 'zod'

export const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['finances', 'exercises', 'books', 'supplements', 'food', 'herbs', 'notes', 'custom']),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().optional(),
})

export type CollectionFormData = z.infer<typeof collectionSchema>
```

**Schemas to create:**
- [ ] `collection.schema.ts`
- [ ] `item.schema.ts`
- [ ] `metric.schema.ts`
- [ ] `tag.schema.ts`
- [ ] `note.schema.ts`

### 6.2 Form Components

**File:** `components/forms/*.tsx`

Create reusable form components:

```typescript
// components/forms/form-field.tsx
interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  description?: string
}
```

**Components:**
- [ ] `FormField` - Wrapper with label and error
- [ ] `FormInput` - Input with validation
- [ ] `FormTextarea` - Textarea with validation
- [ ] `FormSelect` - Select with validation
- [ ] `FormCheckbox` - Checkbox with validation
- [ ] `FormSlider` - Slider with validation

### 6.3 useForm Hook

**File:** `hooks/use-form.ts`

```typescript
interface UseFormOptions<T> {
  schema: z.ZodSchema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void>
}

function useForm<T>({ schema, defaultValues, onSubmit }: UseFormOptions<T>) {
  // Form state management
  // Validation logic
  // Error handling
}
```

### 6.4 Updated Forms

**Files:** `components/forms/*.tsx`

Update existing forms with validation:

- [ ] `collection-form.tsx` - Add Zod validation
- [ ] `item-form.tsx` - Create with validation
- [ ] `metric-form.tsx` - Create with validation

### 6.5 Error Handling

**File:** `components/ui/form-error.tsx`

```typescript
interface FormErrorProps {
  message?: string | null
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null
  
  return (
    <div className={cn('text-sm text-error', className)}>
      {message}
    </div>
  )
}
```

### 6.6 Input Masks & Formatting

**File:** `lib/formatting.ts`

```typescript
// Number formatting
export function formatCurrency(value: number, currency: string): string

// Date formatting
export function formatDate(date: Date): string

// Input masks
export function createNumberMask(options: { prefix?: string; decimalPlaces?: number })
```

---

## Technical Design

### Schema Validation Flow

```
User Input
    ↓
Zod Schema Validation
    ↓
Valid? → Submit to Store
    ↓
Invalid → Show Errors
```

### Form Component Structure

```typescript
<FormField label="Name" error={errors.name}>
  <Input
    value={values.name}
    onChange={(e) => setValues({ ...values, name: e.target.value })}
  />
</FormField>
```

---

## Acceptance Criteria

- [ ] All forms use Zod validation
- [ ] Error messages display correctly
- [ ] Form components are reusable
- [ ] Input masks work correctly
- [ ] All tests pass
- [ ] Accessibility maintained

---

## Testing

### Unit Tests

- [ ] Schema validation tests
- [ ] Form component tests
- [ ] Error display tests
- [ ] Input mask tests

### Integration Tests

- [ ] Form submission flow
- [ ] Validation error flow
- [ ] Success state flow

---

## Performance Considerations

- Debounce validation (300ms)
- Lazy load Zod schemas
- Memoize form components

---

## Accessibility

- Error messages linked to inputs (aria-describedby)
- Live regions for dynamic errors
- Keyboard navigation support
- Screen reader tested

---

## Related Documents

- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
- [constitution.md](./.specify/.qwen/memory/constitution.md)
- [system.md](./.specify/.qwen/memory/system.md)

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-08 | AI Assistant | Initial specification |
