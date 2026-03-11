import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ============================================
// Tables
// ============================================
// All IDs are UUID strings for consistency across Supabase, IndexedDB, and client code

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
})

export const items = sqliteTable('items', {
  id: text('id').primaryKey(), // UUID
  collectionId: text('collection_id').references(() => collections.id),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: text('status').default('active'),
  rating: real('rating'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
})

export const metrics = sqliteTable('metrics', {
  id: text('id').primaryKey(), // UUID
  itemId: text('item_id').references(() => items.id),
  type: text('type').notNull(),
  value: real('value').notNull(),
  unit: text('unit'),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
})

export const history = sqliteTable('history', {
  id: text('id').primaryKey(), // UUID
  itemId: text('item_id').references(() => items.id),
  action: text('action').notNull(),
  value: real('value'),
  note: text('note'),
  createdAt: text('created_at').notNull(),
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  color: text('color'),
  createdAt: text('created_at').notNull(),
})

export const itemTags = sqliteTable('item_tags', {
  id: text('id').primaryKey(), // UUID
  itemId: text('item_id').references(() => items.id),
  tagId: text('tag_id').references(() => tags.id),
})

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(), // UUID
  itemId: text('item_id').references(() => items.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// ============================================
// Relations
// ============================================

export const collectionsRelations = relations(collections, ({ many }) => ({
  items: many(items),
}))

export const itemsRelations = relations(items, ({ one, many }) => ({
  collection: one(collections, {
    fields: [items.collectionId],
    references: [collections.id],
  }),
  metrics: many(metrics),
  history: many(history),
  tags: many(itemTags),
  notes: many(notes),
}))

export const metricsRelations = relations(metrics, ({ one }) => ({
  item: one(items, {
    fields: [metrics.itemId],
    references: [items.id],
  }),
}))

export const historyRelations = relations(history, ({ one }) => ({
  item: one(items, {
    fields: [history.itemId],
    references: [items.id],
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  itemTags: many(itemTags),
}))

export const itemTagsRelations = relations(itemTags, ({ one }) => ({
  item: one(items, {
    fields: [itemTags.itemId],
    references: [items.id],
  }),
  tag: one(tags, {
    fields: [itemTags.tagId],
    references: [tags.id],
  }),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  item: one(items, {
    fields: [notes.itemId],
    references: [items.id],
  }),
}))

// ============================================
// Finance Tables
// ============================================

export type AccountType = 'cash' | 'card' | 'deposit'
export type Currency = 'RUB' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type CategoryType = 'income' | 'expense'
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type GoalStatus = 'active' | 'completed' | 'paused'

// Supplement types
export type SupplementType = 'vitamin' | 'mineral' | 'supplement' | 'protein' | 'herb' | 'other'
export type SupplementForm = 'tablet' | 'capsule' | 'powder' | 'liquid' | 'gummy' | 'softgel'
export type SupplementCategory = 'health' | 'sport' | 'beauty' | 'immunity' | 'energy' | 'sleep' | 'other'
export type SupplementFrequency = 'daily' | 'weekly' | 'as_needed'
export type SupplementTiming = 'morning' | 'afternoon' | 'evening' | 'before_workout' | 'after_workout' | 'with_meal' | 'before_meal' | 'after_meal'

export const financeAccounts = sqliteTable('finance_accounts', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  name: text('name').notNull(),
  type: text('type', { enum: ['cash', 'card', 'deposit'] }).notNull(),
  currency: text('currency', { enum: ['RUB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY'] }).notNull(),
  initialBalance: real('initial_balance').default(0),
  currentBalance: real('current_balance').default(0),
  icon: text('icon'),
  color: text('color'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const financeCategories = sqliteTable('finance_categories', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  isPredefined: text('is_predefined').default('false').notNull(),
  icon: text('icon'),
  color: text('color'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const financeTransactions = sqliteTable('finance_transactions', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  accountId: text('account_id').references(() => financeAccounts.id),
  toAccountId: text('to_account_id').references(() => financeAccounts.id),
  categoryId: text('category_id').references(() => financeCategories.id),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  date: text('date').notNull(),
  description: text('description'),
  tags: text('tags'), // JSON array of tag strings
  fee: real('fee'), // Commission for transfers
  isRecurring: text('is_recurring').default('false').notNull(),
  recurringTransactionId: text('recurring_transaction_id').references(() => financeRecurringTransactions.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const financeBudgets = sqliteTable('finance_budgets', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  categoryId: text('category_id').references(() => financeCategories.id),
  period: text('period', { enum: ['monthly', 'weekly', 'yearly'] }).notNull(),
  amount: real('amount').notNull(),
  spent: real('spent').default(0),
  month: integer('month'), // Month number (1-12)
  year: integer('year'), // Year (e.g., 2026)
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const financeRecurringTransactions = sqliteTable('finance_recurring_transactions', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  accountId: text('account_id').references(() => financeAccounts.id),
  toAccountId: text('to_account_id').references(() => financeAccounts.id),
  categoryId: text('category_id').references(() => financeCategories.id),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  frequency: text('frequency', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  lastProcessed: text('last_processed'),
  isActive: text('is_active').default('true').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const financeSavingsGoals = sqliteTable('finance_savings_goals', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0),
  accountId: text('account_id').references(() => financeAccounts.id),
  deadline: text('deadline'),
  status: text('status', { enum: ['active', 'completed', 'paused'] }).default('active').notNull(),
  icon: text('icon'),
  color: text('color'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

// ============================================
// Supplement Tables
// ============================================

export const supplements = sqliteTable('supplements', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id'),
  name: text('name').notNull(),
  type: text('type', { enum: ['vitamin', 'mineral', 'supplement', 'protein', 'herb', 'other'] }).notNull(),
  form: text('form', { enum: ['tablet', 'capsule', 'powder', 'liquid', 'gummy', 'softgel'] }).notNull(),
  dosage: real('dosage'),
  dosageUnit: text('dosage_unit'), // mg, mcg, IU, g, ml
  category: text('category', { enum: ['health', 'sport', 'beauty', 'immunity', 'energy', 'sleep', 'other'] }),
  brand: text('brand'),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: text('is_active').default('true').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const supplementInventory = sqliteTable('supplement_inventory', {
  id: text('id').primaryKey(), // UUID
  supplementId: text('supplement_id').references(() => supplements.id),
  quantity: real('quantity').notNull(), // текущее количество
  minQuantity: real('min_quantity'), // минимальный порог
  unit: text('unit'), // штук, грамм, мл
  purchaseDate: text('purchase_date'),
  expirationDate: text('expiration_date'),
  price: real('price'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const supplementSchedules = sqliteTable('supplement_schedules', {
  id: text('id').primaryKey(), // UUID
  supplementId: text('supplement_id').references(() => supplements.id),
  frequency: text('frequency', { enum: ['daily', 'weekly', 'as_needed'] }).notNull(),
  timing: text('timing', { enum: ['morning', 'afternoon', 'evening', 'before_workout', 'after_workout', 'with_meal', 'before_meal', 'after_meal'] }).notNull(),
  daysOfWeek: text('days_of_week'), // JSON array [0,1,2,3,4,5,6] для дней недели
  dosage: real('dosage'), // дозировка для этого приёма
  quantity: integer('quantity'), // количество штук за приём
  notes: text('notes'),
  isActive: text('is_active').default('true').notNull(),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

export const supplementLogs = sqliteTable('supplement_logs', {
  id: text('id').primaryKey(), // UUID
  supplementId: text('supplement_id').references(() => supplements.id),
  scheduleId: text('schedule_id').references(() => supplementSchedules.id),
  date: text('date').notNull(),
  time: text('time'),
  status: text('status', { enum: ['taken', 'skipped', 'missed'] }).notNull(),
  dosage: real('dosage'), // фактическая дозировка
  quantity: integer('quantity'), // фактическое количество
  notes: text('notes'),
  rating: integer('rating'), // оценка эффективности 1-5
  sideEffects: text('side_effects'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: text('synced').default('false').notNull(),
  deleted: text('deleted').default('false').notNull(),
  deletedAt: text('deleted_at'),
})

// ============================================
// Finance Relations
// ============================================

export const financeAccountsRelations = relations(financeAccounts, ({ many }) => ({
  transactions: many(financeTransactions),
  outgoingTransfers: many(financeTransactions, { relationName: 'outgoing_transfers' }),
  incomingTransfers: many(financeTransactions, { relationName: 'incoming_transfers' }),
}))

export const financeCategoriesRelations = relations(financeCategories, ({ many }) => ({
  transactions: many(financeTransactions),
  budgets: many(financeBudgets),
}))

export const financeTransactionsRelations = relations(financeTransactions, ({ one }) => ({
  account: one(financeAccounts, {
    fields: [financeTransactions.accountId],
    references: [financeAccounts.id],
  }),
  toAccount: one(financeAccounts, {
    fields: [financeTransactions.toAccountId],
    references: [financeAccounts.id],
    relationName: 'outgoing_transfers',
  }),
  category: one(financeCategories, {
    fields: [financeTransactions.categoryId],
    references: [financeCategories.id],
  }),
  recurringTransaction: one(financeRecurringTransactions, {
    fields: [financeTransactions.recurringTransactionId],
    references: [financeRecurringTransactions.id],
  }),
}))

export const financeBudgetsRelations = relations(financeBudgets, ({ one }) => ({
  category: one(financeCategories, {
    fields: [financeBudgets.categoryId],
    references: [financeCategories.id],
  }),
}))

export const financeRecurringTransactionsRelations = relations(financeRecurringTransactions, ({ one, many }) => ({
  account: one(financeAccounts, {
    fields: [financeRecurringTransactions.accountId],
    references: [financeAccounts.id],
  }),
  toAccount: one(financeAccounts, {
    fields: [financeRecurringTransactions.toAccountId],
    references: [financeAccounts.id],
  }),
  category: one(financeCategories, {
    fields: [financeRecurringTransactions.categoryId],
    references: [financeCategories.id],
  }),
  transactions: many(financeTransactions),
}))

export const financeSavingsGoalsRelations = relations(financeSavingsGoals, ({ one }) => ({
  account: one(financeAccounts, {
    fields: [financeSavingsGoals.accountId],
    references: [financeAccounts.id],
  }),
}))

// ============================================
// Supplement Relations
// ============================================

export const supplementsRelations = relations(supplements, ({ many }) => ({
  inventory: many(supplementInventory),
  schedules: many(supplementSchedules),
  logs: many(supplementLogs),
}))

export const supplementInventoryRelations = relations(supplementInventory, ({ one }) => ({
  supplement: one(supplements, {
    fields: [supplementInventory.supplementId],
    references: [supplements.id],
  }),
}))

export const supplementSchedulesRelations = relations(supplementSchedules, ({ one, many }) => ({
  supplement: one(supplements, {
    fields: [supplementSchedules.supplementId],
    references: [supplements.id],
  }),
  logs: many(supplementLogs),
}))

export const supplementLogsRelations = relations(supplementLogs, ({ one }) => ({
  supplement: one(supplements, {
    fields: [supplementLogs.supplementId],
    references: [supplements.id],
  }),
  schedule: one(supplementSchedules, {
    fields: [supplementLogs.scheduleId],
    references: [supplementSchedules.id],
  }),
}))

// Export types
export type FinanceAccount = typeof financeAccounts.$inferSelect
export type NewFinanceAccount = typeof financeAccounts.$inferInsert

export type FinanceCategory = typeof financeCategories.$inferSelect
export type NewFinanceCategory = typeof financeCategories.$inferInsert

export type FinanceTransaction = typeof financeTransactions.$inferSelect
export type NewFinanceTransaction = typeof financeTransactions.$inferInsert

export type FinanceBudget = typeof financeBudgets.$inferSelect
export type NewFinanceBudget = typeof financeBudgets.$inferInsert

export type FinanceRecurringTransaction = typeof financeRecurringTransactions.$inferSelect
export type NewFinanceRecurringTransaction = typeof financeRecurringTransactions.$inferInsert

export type FinanceSavingsGoal = typeof financeSavingsGoals.$inferSelect
export type NewFinanceSavingsGoal = typeof financeSavingsGoals.$inferInsert

// Supplement types
export type Supplement = typeof supplements.$inferSelect
export type NewSupplement = typeof supplements.$inferInsert
export type SupplementInventory = typeof supplementInventory.$inferSelect
export type NewSupplementInventory = typeof supplementInventory.$inferInsert
export type SupplementSchedule = typeof supplementSchedules.$inferSelect
export type NewSupplementSchedule = typeof supplementSchedules.$inferInsert
export type SupplementLog = typeof supplementLogs.$inferSelect
export type NewSupplementLog = typeof supplementLogs.$inferInsert

// Export types
export type Collection = typeof collections.$inferSelect
export type NewCollection = typeof collections.$inferInsert

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert

export type Metric = typeof metrics.$inferSelect
export type NewMetric = typeof metrics.$inferInsert

export type History = typeof history.$inferSelect
export type NewHistory = typeof history.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type ItemTag = typeof itemTags.$inferSelect
export type NewItemTag = typeof itemTags.$inferInsert

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
