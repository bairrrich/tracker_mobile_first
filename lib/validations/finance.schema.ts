import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Сумма должна быть больше 0'),
  accountId: z.string().nonempty('Выберите счёт'),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().nonempty('Выберите дату'),
  description: z.string().optional(),
  tags: z.string().optional(),
  fee: z.number().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

export const accountSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  type: z.enum(['cash', 'card', 'deposit']),
  currency: z.enum(['RUB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY']),
  initialBalance: z.number().min(0, 'Баланс не может быть отрицательным'),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type AccountFormData = z.infer<typeof accountSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export const budgetSchema = z.object({
  categoryId: z.string().nonempty('Выберите категорию'),
  period: z.enum(['monthly', 'weekly', 'yearly']),
  amount: z.number().positive('Бюджет должен быть больше 0'),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
})

export type BudgetFormData = z.infer<typeof budgetSchema>

export const recurringTransactionSchema = z.object({
  accountId: z.string().nonempty('Выберите счёт'),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  amount: z.number().positive('Сумма должна быть больше 0'),
  type: z.enum(['income', 'expense', 'transfer']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.string().nonempty('Выберите дату начала'),
  endDate: z.string().optional(),
  description: z.string().optional(),
})

export type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>