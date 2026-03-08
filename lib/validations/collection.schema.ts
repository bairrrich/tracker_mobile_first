import { z } from 'zod'

// Collection type enum
export const collectionTypeEnum = z.enum([
  'finances',
  'exercises',
  'books',
  'supplements',
  'food',
  'herbs',
  'notes',
  'custom',
])

// Collection schema
export const collectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  type: collectionTypeEnum,
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
    .optional()
    .or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
})

export type CollectionFormData = z.infer<typeof collectionSchema>

// Collection update schema (all fields optional)
export const collectionUpdateSchema = collectionSchema.partial()

export type CollectionUpdateData = z.infer<typeof collectionUpdateSchema>
