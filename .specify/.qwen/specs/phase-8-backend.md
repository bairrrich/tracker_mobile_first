# Phase 8: Backend Specification

**Status:** Draft  
**Priority:** P1 (High)  
**Phase:** 8  
**Estimated Time:** 2-3 days

---

## Overview

Phase 8 implements the backend layer using SQLite for development and PostgreSQL for production, with Drizzle ORM for type-safe database operations.

---

## Objectives

1. Set up SQLite for local development
2. Configure Drizzle ORM
3. Create database schema
4. Implement backend API endpoints
5. Add database migrations
6. Optional: Supabase integration

---

## Tasks

### 8.1 SQLite Setup

**File:** `lib/db-server.ts`

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

const sqlite = new Database('tracker.db')
export const db = drizzle(sqlite)
```

**Dependencies:**
```bash
npm install better-sqlite3 drizzle-orm
npm install -D @types/better-sqlite3 drizzle-kit
```

### 8.2 Drizzle Schema

**File:** `lib/db-schema.ts`

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  synced: integer('synced', { mode: 'boolean' }).default(false),
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
  synced: integer('synced', { mode: 'boolean' }).default(false),
})

// Add metrics, history, tags, notes tables
```

### 8.3 Backend API Routes

**Files:** `app/api/backend/*/route.ts`

**Endpoints:**
- [ ] `GET /api/backend/collections` - Get all collections
- [ ] `POST /api/backend/collections` - Create collection
- [ ] `GET /api/backend/collections/:id` - Get collection by ID
- [ ] `PUT /api/backend/collections/:id` - Update collection
- [ ] `DELETE /api/backend/collections/:id` - Delete collection
- [ ] `GET /api/backend/items` - Get items
- [ ] `POST /api/backend/items` - Create item
- [ ] `GET /api/backend/items/:id` - Get item by ID
- [ ] `PUT /api/backend/items/:id` - Update item
- [ ] `DELETE /api/backend/items/:id` - Delete item

### 8.4 Database Migrations

**File:** `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db-schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
} satisfies Config
```

**Scripts:**
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

### 8.5 Repository Layer (Backend)

**Files:** `lib/server-repositories/*.ts`

Create server-side repositories that use Drizzle:

```typescript
// lib/server-repositories/collections-repository.ts
import { db } from '@/lib/db-server'
import { collections } from '@/lib/db-schema'
import { eq } from 'drizzle-orm'

export async function getCollections() {
  return await db.select().from(collections)
}

export async function getCollectionById(id: number) {
  return await db.select().from(collections).where(eq(collections.id, id))
}
```

### 8.6 Supabase Integration (Optional)

**File:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## Technical Design

### Database Schema

```
collections
├── id (PK)
├── name
├── type
├── description
├── color
├── icon
├── created_at
├── updated_at
└── synced

items
├── id (PK)
├── collection_id (FK)
├── name
├── description
├── image
├── status
├── rating
├── created_at
├── updated_at
└── synced

metrics
├── id (PK)
├── item_id (FK)
├── type
├── value
├── unit
├── date
└── created_at

history
├── id (PK)
├── item_id (FK)
├── action
├── value
├── note
└── created_at

tags
├── id (PK)
├── name
└── color

item_tags
├── item_id (FK)
└── tag_id (FK)

notes
├── id (PK)
├── item_id (FK)
├── content
├── created_at
└── updated_at
```

### Data Flow

```
Client Request
    ↓
API Route Handler
    ↓
Server Repository
    ↓
Drizzle ORM
    ↓
SQLite / PostgreSQL
```

---

## Acceptance Criteria

- [ ] SQLite database working
- [ ] Drizzle ORM configured
- [ ] All schema tables created
- [ ] Migrations working
- [ ] Backend API endpoints functional
- [ ] All tests pass
- [ ] Documentation updated

---

## Testing

### Unit Tests

- [ ] Repository tests
- [ ] Schema tests
- [ ] API endpoint tests

### Integration Tests

- [ ] Database connection
- [ ] CRUD operations
- [ ] Migration tests

---

## Performance Considerations

- Database indexes on foreign keys
- Query optimization
- Connection pooling (for PostgreSQL)

---

## Security Considerations

- Input validation
- SQL injection protection (Drizzle handles this)
- Rate limiting on API endpoints
- Authentication (if implemented)

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
