# Инструкция по исправлению ошибки "user_id does not exist"

## Проблема

Таблицы были созданы без колонки `user_id`. Нужно добавить её.

## Решение

### Вариант 1: Выполнить новую миграцию (рекомендуется)

1. Откройте Supabase Dashboard: https://supabase.com/dashboard/project/fjivflktqbuwqghfklqf
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла: `supabase/migrations/002_add_user_id_columns.sql`
4. Выполните SQL скрипт

### Вариант 2: Пересоздать таблицы

Если Вариант 1 не работает:

1. Откройте Table Editor
2. Удалите все таблицы (в обратном порядке):
   - sync_queue
   - notes
   - item_tags
   - tags
   - history
   - metrics
   - book_quotes
   - books
   - items
   - collections

3. Выполните полную миграцию: `supabase/migrations/001_initial_schema.sql`

## Проверка

После выполнения миграции проверьте:

```sql
-- Проверка наличия user_id в таблице books
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books' AND column_name = 'user_id';
```

Должен вернуться результат:
```
column_name | data_type
------------|----------
user_id     | uuid
```

## Тестирование синхронизации

```bash
curl http://localhost:3000/api/sync
# Должно вернуть: {"status":"ok","configured":true}
```
