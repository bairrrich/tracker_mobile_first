import { z } from 'zod'

export const quoteSchema = z.object({
  text: z.string().min(1, 'Quote text is required').max(2000, 'Quote is too long'),
  page: z.number().min(1).max(10000).optional(),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
