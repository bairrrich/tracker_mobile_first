# UUID & snake_case Migration Documentation

**Migration ID:** 019  
**Date:** 2026-03-11  
**Status:** ✅ Completed

**IndexedDB Version:** 13

---

## Overview

This migration standardizes all database tables to use **UUID primary keys** and **snake_case naming** for consistency across Supabase, IndexedDB (Dexie), and client code.

---

## Breaking Changes

### IndexedDB Schema Version 13

The IndexedDB schema has been upgraded to version 13. Users will need to clear their browser's IndexedDB:

**For Development:**
```javascript
// In browser console
indexedDB.deleteDatabase('tracker_db')
location.reload()
```

**Or manually:**
1. Open DevTools (F12)
2. Go to Application → IndexedDB
3. Right-click `tracker_db` → Delete
4. Refresh the page

---

## Changes Summary

### 1. Database Naming Convention (snake_case)

**ALL** database table names and Dexie properties now use `snake_case` format:

| Entity | Old Name (camelCase) | New Name (snake_case) |
|--------|---------------------|----------------------|
| Book Quotes | `bookQuotes` | `book_quotes` |
| Item Tags | `itemTags` | `item_tags` |
| Sync Queue | `syncQueue` | `sync_queue` |
| Workout Exercises | `workoutExercises` | `workout_exercises` |
| Workout Sets | `workoutSets` | `workout_sets` |
| Finance Accounts | `financeAccounts` | `finance_accounts` |
| Finance Transactions | `financeTransactions` | `finance_transactions` |
| Finance Categories | `financeCategories` | `finance_categories` |
| Finance Budgets | `financeBudgets` | `finance_budgets` |
| Finance Recurring Transactions | `financeRecurringTransactions` | `finance_recurring_transactions` |
| Finance Savings Goals | `financeSavingsGoals` | `finance_savings_goals` |
| Supplement Inventory | `supplementInventory` | `supplement_inventory` |
| Supplement Schedules | `supplementSchedules` | `supplement_schedules` |
| Supplement Logs | `supplementLogs` | `supplement_logs` |

### 2. UUID Primary Keys

All tables now use UUID primary keys:

```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

This ensures:
- Consistency across Supabase and IndexedDB
- No ID conflicts in offline-first sync
- Better security (non-sequential IDs)

### 3. Theme System Compliance

Fixed UI components to use CSS variables instead of hardcoded colors:

| Component | Old | New |
|-----------|-----|-----|
| Button (destructive) | `text-white` | `text-[var(--text-inverse)]` |
| Badge (destructive) | `text-white` | `text-[var(--text-inverse)]` |
| Badge (success) | `text-white` | `text-[var(--text-inverse)]` |
| Badge (warning) | `text-white` | `text-[var(--text-inverse)]` |
| Dialog Overlay | `bg-black/60` | `bg-[var(--overlay)]/60` |
| Alert Dialog Overlay | `bg-black/60` | `bg-[var(--overlay)]/60` |

### 4. New CSS Variables

Added to `styles/globals.css`:

```css
/* Light theme */
--text-inverse: oklch(99% 0.01 260);
--overlay: oklch(0% 0 0 / 0.6);

/* Dark theme */
--text-inverse: oklch(10% 0.02 260);
--overlay: oklch(0% 0 0 / 0.8);

/* AMOLED theme */
--text-inverse: oklch(10% 0.02 260);
--overlay: oklch(0% 0 0 / 0.85);
```

---

## Files Modified

### Core Database

- ✅ `lib/db.ts` - Dexie schema with snake_case properties
- ✅ `QWEN.md` - Updated coding conventions

### Repositories (lib/repositories/)

- ✅ `book-quotes-repository.ts`
- ✅ `tags-repository.ts`
- ✅ `items-repository.ts`
- ✅ `books-repository.ts`
- ✅ `workouts-repository.ts`
- ✅ `finance-accounts-repository.ts`
- ✅ `finance-transactions-repository.ts`
- ✅ `finance-categories-repository.ts`
- ✅ `finance-budgets-repository.ts`
- ✅ `finance-savings-goals-repository.ts`
- ✅ `supplement-inventory-repository.ts`
- ✅ `supplement-schedules-repository.ts`
- ✅ `supplement-logs-repository.ts`

### Sync Engine

- ✅ `lib/sync-engine.ts`

### UI Components

- ✅ `components/ui/button.tsx`
- ✅ `components/ui/badge.tsx`
- ✅ `components/ui/dialog.tsx`
- ✅ `components/ui/alert-dialog.tsx`
- ✅ `styles/globals.css`

### Migrations

- ✅ `supabase/migrations/019_convert_all_tables_to_uuid.sql`

---

## Migration Guide

### For Existing Databases

1. **Backup your data** before running the migration
2. Run the migration script:
   ```bash
   supabase db push supabase/migrations/019_convert_all_tables_to_uuid.sql
   ```
3. Clear IndexedDB in browser (DevTools → Application → IndexedDB → Delete)
4. Refresh the application

### For New Development

No additional steps required. The snake_case convention is now the default.

---

## Code Examples

### ✅ CORRECT - snake_case everywhere

```typescript
// Dexie operations
db.book_quotes.add({ id, bookId, text, ... })
db.item_tags.where('itemId').equals(itemId).toArray()
db.sync_queue.add({ table: 'book_quotes', recordId: id, ... })

// Sync operations
await markForSync('book_quotes', id, 'insert', data)
TABLE_MAPPING: { book_quotes: 'book_quotes' }
```

### ❌ WRONG - No more camelCase

```typescript
// DON'T use camelCase for Dexie properties
db.bookQuotes.add(...)  // ❌
db.itemTags.where(...)  // ❌
db.syncQueue.add(...)   // ❌

// DON'T use camelCase in sync operations
await markForSync('bookQuotes', id, 'insert', data)  // ❌
```

---

## Benefits

1. **Consistency**: Same naming across Supabase, IndexedDB, and sync queue
2. **No mapping overhead**: No need to convert between camelCase and snake_case
3. **Better readability**: snake_case is standard for database identifiers
4. **Theme support**: CSS variables enable proper light/dark/AMOLED themes
5. **Future-proof**: UUID IDs prevent conflicts in distributed systems

---

## Testing Checklist

- [ ] All repositories compile without errors
- [ ] Sync engine tests pass
- [ ] UI components render correctly in all themes
- [ ] Migration script runs successfully
- [ ] Data is preserved after migration
- [ ] Offline sync works correctly

---

## Related Documentation

- [QWEN.md](./QWEN.md) - Coding conventions
- [OFFLINE_FIRST_SYNC.md](./OFFLINE_FIRST_SYNC.md) - Sync architecture
- [MCP.md](./MCP.md) - Development tools

---

## Rollback Plan

If issues occur, rollback to previous schema:

```sql
-- Restore from backup
pg_restore -d your_database backup_file.dump
```

Then revert code to previous commit:

```bash
git revert HEAD~5..HEAD
```

---

**Last Updated:** 2026-03-11
