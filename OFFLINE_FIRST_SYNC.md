# Offline-First Синхронизация с Tombstones

## Архитектура

Данная реализация следует принципам **offline-first** архитектуры, где локальная база данных устройства является основным источником данных для приложения, а удалённая (облачная) база служит для синхронизации между устройствами и централизованного хранения.

## Ключевые компоненты

### 1. Tombstones (Мягкое удаление)

Вместо физического удаления записей используется **мягкое удаление** (soft delete) с помощью tombstones:

- **`deleted: boolean`** - флаг удаления
- **`deleted_at: timestamp`** - временная метка удаления

Записи с tombstone сохраняются в базе данных и синхронизируются между устройствами перед окончательным удалением.

### 2. Синхронизация

#### Push (локаль → сервер)
1. Клиент отправляет изменения (создание, обновление, удаление)
2. Для удалений отправляется tombstone (`deleted: true`)
3. Сервер применяет изменения или отклоняет при конфликтах

#### Pull (сервер → клиент)
1. Клиент запрашивает изменения с последней синхронизации
2. Сервер возвращает как обычные обновления, так и tombstones
3. Клиент применяет tombstones, удаляя соответствующие записи локально

### 3. Разрешение конфликтов

**Стратегия: Удаление побеждает (Delete Wins)**

Если запись удалена на сервере (tombstone), но изменена на клиенте:
- Сервер отклоняет изменения клиента
- Клиент получает tombstone и удаляет запись локально

Это предотвращает "воскрешение" удалённых записей.

## Миграции

### Supabase (020_add_tombstone_fields.sql)

Добавляет поля `deleted` и `deleted_at` во все таблицы:

```sql
ALTER TABLE collections ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
```

Также создаётся функция `cleanup_old_tombstones(retention_days)` для очистки старых tombstones.

### IndexedDB

Все интерфейсы обновлены для поддержки полей:
```typescript
interface Item {
  id: string
  // ... другие поля
  deleted?: boolean  // Tombstone flag
  deletedAt?: Date   // Tombstone timestamp
}
```

## API

### Репозитории

Все репозитории поддерживают soft delete:

```typescript
// Мягкое удаление (создаёт tombstone)
await itemsRepository.delete(itemId)

// Физическое удаление (только для очистки tombstones)
await itemsRepository.hardDelete(itemId)

// Получение только активных записей
const activeItems = await itemsRepository.getActive()

// Получение всех записей (включая удалённые)
const allItems = await itemsRepository.getAll()
```

### Утилиты синхронизации

`lib/utils/sync-utils.ts`:

```typescript
// Создать tombstone
const tombstone = createTombstone() // { deleted: true, deletedAt: Date }

// Проверить, является ли запись tombstone
const isDeleted = isTombstone(record)

// Фильтровать активные записи
const active = filterActive(allRecords)

// Разрешить конфликт
const winner = resolveConflict(local, remote, ConflictStrategy.DELETE_WINS)
```

## Жизненный цикл записи

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Создание   │────▶│  Обновление  │────▶│  Удаление   │────▶│  Очистка     │
│             │     │              │     │ (tombstone) │     │ (физическое) │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                           │                    │                    │
                           │                    │                    │
                           ▼                    ▼                    ▼
                     synced: false        synced: false        Удаление из
                                                                sync queue
```

## Очистка tombstones

Tombstones хранятся **90 дней** (настраивается) перед окончательным удалением.

### Автоматическая очистка (Supabase)

```sql
-- Выполнять ежедневно через cron
SELECT cleanup_old_tombstones(90);
```

### Локальная очистка (IndexedDB)

```typescript
import { isTombstoneExpired } from '@/lib/utils/sync-utils'

// Очистить локальные tombstones старше 90 дней
const expired = records.filter(r => isTombstoneExpired(r, 90))
for (const record of expired) {
  await repository.hardDelete(record.id)
}
```

## Конфликты

### Сценарий 1: Удаление vs Обновление

```
Устройство A          Сервер           Устройство B
    │                  │                  │
    │─── Обновление ──▶│                  │
    │                  │◀─── Удаление ────│
    │                  │                  │
    │◀─── Конфликт ────│                  │
    │  (delete wins)   │                  │
    │                  │                  │
    │─── Tombstone ───▶│                  │
    │                  │◀─── Sync ────────│
    │                  │                  │
    │  Удалено         │     Удалено      │
```

### Сценарий 2: Одновременное удаление

```
Устройство A          Сервер           Устройство B
    │                  │                  │
    │─── Удаление ────▶│                  │
    │                  │◀─── Удаление ────│
    │                  │                  │
    │  Первое удаление побеждает (earlier timestamp)
    │                  │                  │
    │◀─── Tombstone ───│─── Tombstone ───▶│
    │                  │                  │
```

## Рекомендации

### 1. Всегда используйте soft delete

```typescript
// ✅ Правильно
await repository.delete(id)  // Создаёт tombstone

// ❌ Неправильно (если только не очистка)
await repository.hardDelete(id)
```

### 2. Фильтруйте удалённые записи в UI

```typescript
// Получение активных записей для отображения
const items = await itemsRepository.getActive()
```

### 3. Обрабатывайте конфликты

При получении ошибки синхронизации:
- Проверьте, не была ли запись удалена
- Покажите пользователю соответствующее сообщение

### 4. Мониторьте размер tombstones

Периодически проверяйте количество tombstones и при необходимости уменьшайте retention period.

## Тестирование

### Проверка синхронизации удалений

1. Удалите запись на устройстве A
2. Дождитесь синхронизации
3. Проверьте, что на устройстве B запись удалена (получен tombstone)
4. Проверьте, что попытка изменения на устройстве A отклонена

### Проверка очистки

1. Создайте tombstone (удалите запись)
2. Измените дату `deleted_at` на 91 день назад
3. Запустите `cleanup_old_tombstones(90)`
4. Проверьте, что запись физически удалена

## Дополнительные ресурсы

- [Offline-First Architecture](https://offlinefirst.org/)
- [Sync Best Practices](https://www.sqlite.org/protocol.html)
- [Tombstone Pattern](https://docs.couchdb.org/en/stable/replication/conflicts.html)
