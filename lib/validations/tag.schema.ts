import { z } from 'zod'

// Tag schema
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
    .optional()
    .or(z.literal('')),
})

export type TagFormData = z.infer<typeof tagSchema>

// Tag update schema
export const tagUpdateSchema = tagSchema.partial()

export type TagUpdateData = z.infer<typeof tagUpdateSchema>

// Note schema
export const noteSchema = z.object({
  itemId: z.number().int().positive('Invalid item ID'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters'),
})

export type NoteFormData = z.infer<typeof noteSchema>

// Note update schema
export const noteUpdateSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters'),
})

export type NoteUpdateData = z.infer<typeof noteUpdateSchema>
