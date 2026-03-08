import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ============================================
// Tables
// ============================================

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: integer('synced', { mode: 'boolean' }).default(false).notNull(),
})

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  collectionId: integer('collection_id').references(() => collections.id),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: text('status').default('active'),
  rating: real('rating'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: integer('synced', { mode: 'boolean' }).default(false).notNull(),
})

export const metrics = sqliteTable('metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').references(() => items.id),
  type: text('type').notNull(),
  value: real('value').notNull(),
  unit: text('unit'),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
})

export const history = sqliteTable('history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').references(() => items.id),
  action: text('action').notNull(),
  value: real('value'),
  note: text('note'),
  createdAt: text('created_at').notNull(),
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: text('created_at').notNull(),
})

export const itemTags = sqliteTable('item_tags', {
  itemId: integer('item_id').references(() => items.id),
  tagId: integer('tag_id').references(() => tags.id),
})

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').references(() => items.id),
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
