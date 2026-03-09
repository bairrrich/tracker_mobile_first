import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(200, 'Author is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['reading', 'completed', 'planned', 'abandoned']).optional().default('planned'),
  rating: z.number().min(1).max(5).optional(),
  pagesTotal: z.number().min(1).max(10000).optional(),
  pagesRead: z.number().min(0).optional(),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  genre: z.string().max(100).optional().or(z.literal('')),
  isbn: z.string().max(20).optional().or(z.literal('')),
  publisher: z.string().max(200).optional().or(z.literal('')),
  publishYear: z.number().min(1000).max(new Date().getFullYear() + 1).optional(),
  language: z.string().max(50).optional().or(z.literal('')),
  format: z.enum(['hardcover', 'paperback', 'ebook', 'audiobook']).optional(),
  notes: z.string().max(5000).optional().or(z.literal('')),
  collectionId: z.number().optional(),
})

export type BookFormData = z.infer<typeof bookSchema>
