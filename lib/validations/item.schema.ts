import { z } from 'zod'

// Item status enum
export const itemStatusEnum = z.enum(['active', 'archived', 'completed'])

// Item schema
export const itemSchema = z.object({
  collectionId: z.number().int().positive('Invalid collection ID'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  image: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  status: itemStatusEnum.default('active'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
})

export type ItemFormData = z.infer<typeof itemSchema>

// Item update schema (all fields optional)
export const itemUpdateSchema = itemSchema.partial()

export type ItemUpdateData = z.infer<typeof itemUpdateSchema>

// Metric schema
export const metricSchema = z.object({
  itemId: z.number().int().positive('Invalid item ID'),
  type: z
    .string()
    .min(1, 'Type is required')
    .max(50, 'Type must be less than 50 characters'),
  value: z.number(),
  unit: z
    .string()
    .max(20, 'Unit must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  date: z.date().optional().default(() => new Date()),
})

export type MetricFormData = z.infer<typeof metricSchema>

// History schema
export const historySchema = z.object({
  itemId: z.number().int().positive('Invalid item ID'),
  action: z
    .string()
    .min(1, 'Action is required')
    .max(100, 'Action must be less than 100 characters'),
  value: z.number().optional(),
  note: z
    .string()
    .max(500, 'Note must be less than 500 characters')
    .optional()
    .or(z.literal('')),
})

export type HistoryFormData = z.infer<typeof historySchema>
