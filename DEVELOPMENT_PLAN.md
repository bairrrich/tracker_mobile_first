# 📋 План разработки All_Tracker_mobile

**Версия:** 1.0  
**Обновлено:** 8 марта 2026  
**Статус:** Ready to start

---

## 🎯 Обзор проекта

**All_Tracker_mobile** — offline-first мобильное приложение для трекинга различных активностей (финансы, упражнения, книги, витамины, продукты, травы).

### Ключевые характеристики

- **Offline-first** — полная работа без интернета
- **PWA** — устанавливаемое веб-приложение
- **Sync** — синхронизация при появлении соединения
- **Mobile-first** — дизайн от мобильных к десктопу
- **Minimalism** — чистый интерфейс без шума
- **OKLCH** — современная цветовая система

---

## 🧩 Технологический стек

| Категория | Технология | Назначение |
|-----------|------------|------------|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, PWA |
| **Language** | TypeScript | Типобезопасность |
| **Styling** | Tailwind CSS + OKLCH | Утилитарные стили |
| **UI Components** | shadcn/ui + Radix UI | Готовые компоненты |
| **Icons** | Lucide Icons | Векторные иконки |
| **State** | Zustand | Глобальное состояние |
| **Data Fetching** | TanStack React Query | Кэширование, sync |
| **Offline DB** | IndexedDB + Dexie.js | Локальное хранилище |
| **ORM** | Drizzle ORM | Работа с SQLite/PostgreSQL |
| **Backend DB** | SQLite (dev) / PostgreSQL (prod) | Хранение данных |
| **PWA** | next-pwa + Workbox | Offline caching |
| **Sync** | Custom Sync Engine | Синхронизация |
| **Validation** | Zod | Валидация схем |
| **Testing** | Jest + RTL / Playwright | Тестирование |

---

## 📁 Структура проекта

```
All_Tracker_mobile/
├── .specify/
│   └── .qwen/
│       ├── memory/           # Конституция, продукт, система
│       ├── specs/            # Спецификации функций
│       └── templates/        # Шаблоны документов
├── .agents/skills/           # Vercel Agent Skills
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── sync/
│   │       └── route.ts
│   ├── (main)/               # Основная группа routes
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── collections/
│   │   ├── settings/
│   │   └── analytics/
│   ├── layout.tsx            # Root layout
│   └── page.tsx
├── components/
│   ├── ui/                   # shadcn/ui компоненты
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/               # Layout компоненты
│   │   ├── header.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── sidebar.tsx
│   │   └── container.tsx
│   └── shared/               # Общие компоненты
│       ├── metric-card.tsx
│       ├── activity-item.tsx
│       └── collection-grid.tsx
├── lib/
│   ├── db.ts                 # Dexie.js конфигурация
│   ├── drizzle.ts            # Drizzle ORM
│   ├── sync.ts               # Sync engine
│   ├── api.ts                # API client
│   ├── utils.ts              # Утилиты (cn, etc.)
│   └── constants.ts
├── store/                    # Zustand stores
│   ├── app-store.ts
│   ├── collections-store.ts
│   └── sync-store.ts
├── hooks/                    # Custom hooks
│   ├── use-sync.ts
│   ├── use-collections.ts
│   └── use-media-query.ts
├── styles/
│   └── globals.css           # Глобальные стили + OKLCH
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── icons/                # PWA icons
│   └── sw.js                 # Service Worker
└── tests/
    ├── unit/
    └── e2e/
```

---

## 📅 Дорожная карта разработки

### Phase 1: Foundation (2-3 дня)
**Приоритет:** 🔴 Critical

- [ ] 1.1 Инициализация Next.js проекта
- [ ] 1.2 Установка зависимостей
- [ ] 1.3 Настройка структуры проекта
- [ ] 1.4 Конфигурационные файлы
  - [ ] `tailwind.config.ts` — OKLCH цвета, темы
  - [ ] `tsconfig.json` — строгий TypeScript
  - [ ] `next.config.js` — PWA настройки
  - [ ] `public/manifest.json` — PWA manifest
- [ ] 1.5 Design System — OKLCH палитра
- [ ] 1.6 Система тем (Light/Dark/AMOLED)

**Критерии готовности:**
- ✅ Проект запускается `npm run dev`
- ✅ Tailwind настроен с OKLCH цветами
- ✅ Темы переключаются и сохраняются

---

### Phase 2: Core UI Components (3-4 дня)
**Приоритет:** 🔴 Critical

**Важно:** Используем только shadcn/ui + Radix UI. Никаких нативных элементов.

#### 2.1 Базовые UI компоненты
- [ ] `Button` — variants: default, outline, ghost, destructive
- [ ] `Input` — text, search, number
- [ ] `Textarea`
- [ ] `Select` (Radix UI)
- [ ] `Dialog` (Radix UI) — модальные окна
- [ ] `Drawer` — mobile bottom sheets
- [ ] `DropdownMenu` (Radix UI)
- [ ] `Tooltip` (Radix UI)
- [ ] `Toast` — уведомления
- [ ] `Alert` — предупреждения
- [ ] `Skeleton` — loading states
- [ ] `Spinner` — индикаторы загрузки

#### 2.2 Формы компоненты
- [ ] `Checkbox` (Radix UI)
- [ ] `RadioGroup` (Radix UI)
- [ ] `Switch` (Radix UI)
- [ ] `Slider` (Radix UI)
- [ ] `TagInput` — ввод тегов
- [ ] `DatePicker` — выбор даты
- [ ] `SearchInput` — поиск с debounce

#### 2.3 Data Display компоненты
- [ ] `Card` — базовая карточка
- [ ] `List` — списки
- [ ] `Table` — таблицы
- [ ] `Badge` — бейджи/статусы
- [ ] `Avatar` — аватарки
- [ ] `Progress` — прогресс бары
- [ ] `Tags` — отображение тегов

#### 2.4 Layout компоненты
- [ ] `Container` — центрирование
- [ ] `Grid` — grid layout
- [ ] `Stack` — vertical/horizontal stack
- [ ] `Spacer` — отступы
- [ ] `Divider` — разделители

#### 2.5 Навигация компоненты
- [ ] `BottomNav` — mobile navigation
- [ ] `Sidebar` — desktop navigation
- [ ] `Tabs` — вкладки
- [ ] `Breadcrumbs` — навигационная цепочка
- [ ] `Pagination` — пагинация
- [ ] `CommandPalette` — Cmd+K search (Linear style)

#### 2.6 Специализированные компоненты
- [ ] `MetricCard` — карточка метрики
- [ ] `ActivityItem` — элемент активности
- [ ] `CollectionCard` — карточка коллекции
- [ ] `ItemCard` — карточка элемента
- [ ] `ItemView` — детальное отображение
- [ ] `ItemEditor` — редактирование элемента
- [ ] `ItemHistory` — история изменений
- [ ] `Charts` — графики (Recharts)

#### 2.7 Floating Action Button
- [ ] `FAB` — плавающая кнопка "+"
- [ ] `QuickAddMenu` — меню быстрых действий

**Критерии готовности:**
- ✅ Все компоненты используют shadcn/ui + Radix UI
- ✅ Компоненты переиспользуемые
- ✅ Поддерживают темы
- ✅ Доступны (ARIA, keyboard nav)

---

### Phase 3: Offline Database (2-3 дня)
**Приоритет:** 🔴 Critical

#### 3.1 Dexie.js конфигурация
**Файл:** `lib/db.ts`

- [ ] Создать Dexie инстанс
- [ ] Определить схему БД (version 1)
- [ ] Настроить индексы

**Схема:**
```typescript
db.version(1).stores({
  // Collections
  collections: "++id, name, type, icon, color, createdAt",
  
  // Items — главная таблица
  items: "++id, collectionId, name, status, updatedAt, createdAt",
  
  // Metrics — числовые данные
  metrics: "++id, itemId, type, value, unit, createdAt",
  
  // History — история активности
  history: "++id, itemId, action, value, createdAt",
  
  // Tags
  tags: "++id, name, color",
  
  // Связь items ↔ tags
  item_tags: "[itemId+tagId]",
  
  // Notes
  notes: "++id, itemId, createdAt",
  
  // Sync queue
  sync_queue: "++id, table, recordId, operation, synced"
})
```

#### 3.2 Repository слой
**Файлы:** `lib/repositories/*.ts`

- [ ] `collections-repository.ts`
- [ ] `items-repository.ts`
- [ ] `metrics-repository.ts`
- [ ] `history-repository.ts`
- [ ] `tags-repository.ts`
- [ ] `notes-repository.ts`
- [ ] `sync-queue-repository.ts`

**Методы каждого репозитория:**
```typescript
getAll()
getById(id)
create(data)
update(id, data)
delete(id)
getUnsynced()
markSynced(id)
```

#### 3.3 Миграции БД
**Файл:** `lib/db-migrations.ts`

- [ ] Система версионирования схемы
- [ ] Функция миграции данных
- [ ] Rollback механизм

**Критерии готовности:**
- ✅ Dexie.js настроен
- ✅ Все репозитории работают
- ✅ CRUD операции выполняются

---

### Phase 4: State Management (1-2 дня)
**Приоритет:** 🟠 High

#### 4.1 App Store
**Файл:** `store/app-store.ts`

```typescript
{
  theme: 'light' | 'dark' | 'amoled',
  language: 'ru' | 'en',
  isLoading: boolean,
  error: string | null
}
```

- [ ] Создать store
- [ ] Actions: setTheme, setLanguage, setLoading, setError
- [ ] Persist в localStorage

#### 4.2 Collections Store
**Файл:** `store/collections-store.ts`

```typescript
{
  collections: Collection[],
  selectedCollection: Collection | null,
  isLoading: boolean
}
```

- [ ] fetchCollections
- [ ] selectCollection
- [ ] addCollection
- [ ] updateCollection
- [ ] deleteCollection

#### 4.3 Items Store
**Файл:** `store/items-store.ts`

```typescript
{
  items: Item[],
  selectedItem: Item | null,
  filters: Filters,
  sortBy: string,
  viewMode: 'grid' | 'list'
}
```

- [ ] fetchItems(collectionId)
- [ ] selectItem(id)
- [ ] addItem(data)
- [ ] updateItem(id, data)
- [ ] deleteItem(id)
- [ ] setFilters(filters)
- [ ] setSortBy(field)
- [ ] setViewMode(mode)

#### 4.4 Sync Store
**Файл:** `store/sync-store.ts`

```typescript
{
  syncStatus: 'idle' | 'syncing' | 'error',
  lastSync: Date | null,
  unsyncedCount: number
}
```

- [ ] startSync()
- [ ] completeSync()
- [ ] setSyncError(error)
- [ ] updateLastSync()

**Критерии готовности:**
- ✅ Все stores созданы
- ✅ Actions работают
- ✅ Состояние сохраняется

---

### Phase 5: PWA (1-2 дня)
**Приоритет:** 🟠 High

#### 5.1 next-pwa конфигурация
**Файл:** `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})
```

#### 5.2 PWA Manifest
**Файл:** `public/manifest.json`

```json
{
  "name": "All Tracker Mobile",
  "short_name": "Tracker",
  "description": "Track your activities",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "oklch(62% 0.19 260)",
  "background_color": "oklch(98% 0.01 260)",
  "icons": [...]
}
```

#### 5.3 Service Worker
**Файл:** `public/sw.js`

- [ ] Offline caching стратегия
- [ ] Background sync
- [ ] Push notifications (optional)

#### 5.4 Install Prompt
**Файл:** `components/ui/install-prompt.tsx`

- [ ] Detect installable state
- [ ] Show install prompt UI
- [ ] Handle install event

**Критерии готовности:**
- ✅ PWA manifest корректный
- ✅ Service Worker работает
- ✅ Offline режим функционирует
- ✅ Можно установить приложение

---

### Phase 6: Universal Collections Module (3-4 дня)
**Приоритет:** 🔴 Critical

#### 6.1 Layout компоненты
**Файлы:** `components/layout/`

- [ ] `MainLayout` — общий layout
- [ ] `Header` — шапка с поиском
- [ ] `BottomNav` — mobile navigation
- [ ] `Sidebar` — desktop navigation

#### 6.2 Dashboard страница
**Файл:** `app/(main)/page.tsx`

- [ ] Metrics Grid компонент
- [ ] Recent Activity список
- [ ] Quick Stats виджеты
- [ ] Empty state

#### 6.3 Collections страница
**Файл:** `app/(main)/collections/page.tsx`

- [ ] Collection Grid/List переключатель
- [ ] Filters компонент (tags, sort, type)
- [ ] Search с debounce
- [ ] Collection Card компонент

#### 6.4 Item Detail страница
**Файл:** `app/(main)/collections/[id]/items/[itemId]/page.tsx`

- [ ] Item Header с back button
- [ ] Progress Bar компонент
- [ ] Tags Display
- [ ] Notes Section
- [ ] History Timeline
- [ ] Edit/Delete actions

#### 6.5 Add/Edit Item форма
**Файл:** `components/forms/item-form.tsx`

- [ ] Name input
- [ ] Description textarea
- [ ] Tags input
- [ ] Metrics inputs (dynamic)
- [ ] Notes textarea
- [ ] Image upload (optional)
- [ ] Save/Cancel buttons
- [ ] Валидация Zod schema

#### 6.6 Quick Add FAB
**Файл:** `components/ui/quick-add-fab.tsx`

- [ ] Плавающая кнопка "+"
- [ ] Меню быстрых действий

**Критерии готовности:**
- ✅ Dashboard отображает метрики
- ✅ Можно создать коллекцию
- ✅ Можно добавить/отредактировать/удалить item
- ✅ Mobile responsive
- ✅ Desktop responsive

---

### Phase 7: Sync Engine (2-3 дня)
**Приоритет:** 🟡 Medium

#### 7.1 Sync Queue система
**Файл:** `lib/sync-queue.ts`

- [ ] addToQueue(operation)
- [ ] getUnsynced()
- [ ] markSynced(ids)
- [ ] clearSynced()

#### 7.2 Sync Engine
**Файл:** `lib/sync.ts`

- [ ] Push локальных изменений
- [ ] Pull удалённых изменений
- [ ] Conflict resolution (last-write-wins)
- [ ] Sync status tracking

#### 7.3 Sync API endpoint
**Файл:** `app/api/sync/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // Process incoming changes
  // Get remote changes
  return NextResponse.json({ success: true, changes: [] })
}
```

#### 7.4 Sync Hooks
**Файл:** `hooks/use-sync.ts`

- [ ] useSync() hook
- [ ] triggerSync()
- [ ] cancelSync()

#### 7.5 Sync UI индикаторы
**Файл:** `components/ui/sync-status.tsx`

- [ ] ✓ Synced
- [ ] ⟳ Syncing
- [ ] ⚠ Offline
- [ ] ❌ Error

**Критерии готовности:**
- ✅ Sync работает
- ✅ Статусы отображаются
- ✅ Конфликты разрешаются

---

### Phase 8: Backend (2-3 дня)
**Приоритет:** 🟡 Medium

#### 8.1 Drizzle ORM конфигурация
**Файл:** `lib/drizzle.ts`

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

const sqlite = new Database('tracker.db')
export const db = drizzle(sqlite)
```

#### 8.2 Database Schema
**Файл:** `lib/drizzle-schema.ts`

- [ ] users
- [ ] collections
- [ ] items
- [ ] metrics
- [ ] history
- [ ] tags
- [ ] item_tags
- [ ] notes

#### 8.3 API Routes
**Файлы:** `app/api/`

- [ ] `POST /api/sync` — синхронизация
- [ ] `GET /api/collections` — получить коллекции
- [ ] `POST /api/collections` — создать коллекцию
- [ ] `GET /api/collections/:id/items` — получить items
- [ ] `POST /api/items` — создать item
- [ ] `PUT /api/items/:id` — обновить item
- [ ] `DELETE /api/items/:id` — удалить item

#### 8.4 Supabase Integration (optional)
**Файл:** `lib/supabase.ts`

- [ ] Настроить клиент
- [ ] Auth (optional)
- [ ] Realtime (optional)

**Критерии готовности:**
- ✅ SQLite работает
- ✅ API endpoints отвечают
- ✅ Данные сохраняются

---

### Phase 9: Testing (2-3 дня)
**Приоритет:** 🟠 High

#### 9.1 Unit тесты
**Файлы:** `tests/unit/`

- [ ] UI компоненты (Button, Card, Input)
- [ ] Hooks (useSync, useCollections)
- [ ] Stores (Zustand)
- [ ] Utils функции
- [ ] Валидация Zod схемами

#### 9.2 Integration тесты
**Файлы:** `tests/integration/`

- [ ] Добавить item в коллекцию
- [ ] Отредактировать item
- [ ] Удалить item
- [ ] Фильтрация collections
- [ ] Поиск items

#### 9.3 E2E тесты (Playwright)
**Файлы:** `tests/e2e/`

**Критические пути:**
- [ ] Dashboard загрузка
- [ ] Создание новой коллекции
- [ ] Добавление item
- [ ] Редактирование item
- [ ] Offline режим → добавление → sync
- [ ] Theme переключение

**Критерии готовности:**
- ✅ Unit тесты проходят (80%+ coverage)
- ✅ Integration тесты работают
- ✅ E2E тесты проходят

---

### Phase 10: Polish (1-2 дня)
**Приоритет:** 🟠 High

#### 10.1 Performance оптимизация
- [ ] Dynamic imports
- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting по routes
- [ ] Memoization (useMemo, useCallback)
- [ ] Virtual scrolling для больших списков

#### 10.2 Accessibility аудит
- [ ] ARIA атрибуты
- [ ] Keyboard navigation
- [ ] Contrast ratio > 4.5:1
- [ ] Screen reader тестирование

#### 10.3 Localization (i18n)
**Файлы:** `lib/i18n/`

- [ ] RU переводы всех UI текстов
- [ ] EN переводы всех UI текстов
- [ ] Language switcher компонент
- [ ] Locale persistence

#### 10.4 Final Checklists
**Pre-deployment:**
- [ ] Все тесты проходят
- [ ] Нет console errors/warnings
- [ ] PWA manifest корректный
- [ ] Offline режим работает
- [ ] Sync работает
- [ ] Темы переключаются
- [ ] Mobile responsive
- [ ] Desktop responsive

#### 10.5 Деплой на Vercel
```bash
npm run build
vercel deploy
```

- [ ] Подключить GitHub репозиторий
- [ ] Настроить environment variables
- [ ] Deploy production
- [ ] Настроить custom domain (optional)

**Критерии готовности:**
- ✅ Приложение задеплоено
- ✅ Все функции работают
- ✅ Производительность в норме

---

## 📊 Сводная таблица фаз

| № | Фаза | Приоритет | Время | Статус |
|---|------|-----------|-------|--------|
| 1 | Foundation | 🔴 Critical | 2-3 дня | ⏳ Pending |
| 2 | Core UI Components | 🔴 Critical | 3-4 дня | ⏳ Pending |
| 3 | Offline Database | 🔴 Critical | 2-3 дня | ⏳ Pending |
| 4 | State Management | 🟠 High | 1-2 дня | ⏳ Pending |
| 5 | PWA | 🟠 High | 1-2 дня | ⏳ Pending |
| 6 | Collections Module | 🔴 Critical | 3-4 дня | ⏳ Pending |
| 7 | Sync Engine | 🟡 Medium | 2-3 дня | ⏳ Pending |
| 8 | Backend | 🟡 Medium | 2-3 дня | ⏳ Pending |
| 9 | Testing | 🟠 High | 2-3 дня | ⏳ Pending |
| 10 | Polish | 🟠 High | 1-2 дня | ⏳ Pending |

**Общее время MVP:** ~20-25 дней

---

## ✅ Критерии готовности MVP

1. ✅ Работает offline (Dexie.js)
2. ✅ Можно создать коллекцию
3. ✅ Можно добавить/отредактировать/удалить item
4. ✅ Dashboard показывает метрики
5. ✅ PWA устанавливается
6. ✅ Темы переключаются (Light/Dark)
7. ✅ Mobile responsive
8. ✅ Локализация RU + EN

---

## 📚 Связанные документы

| Документ | Описание |
|----------|----------|
| [README.md](./README.md) | Быстрый старт и технологии |
| [QWEN.md](./QWEN.md) | Контекст для AI-ассистента |
| [.specify/.qwen/memory/constitution.md](./.specify/.qwen/memory/constitution.md) | Принципы проекта |
| [.specify/.qwen/memory/system.md](./.specify/.qwen/memory/system.md) | Техническая архитектура |
| [.specify/.qwen/memory/product.md](./.specify/.qwen/memory/product.md) | Видение продукта |
| [plan.md](./plan.md) | Руководство по дизайну и UI |

---

## 🔄 Process

### Spec-Driven Development

```
Constitution → Specify → Clarify → Plan → Tasks → Implement
```

### Перед началом каждой фазы

1. Проверить существующие спецификации
2. Обновить спецификации при необходимости
3. Создать задачи для фазы
4. Реализовать
5. Запустить тесты
6. Обновить статус в этом файле

### Guidelines

1. ✅ Проверь существующие спецификации перед реализацией
2. ✅ Обновляй спецификации при изменении требований
3. ✅ Следуй принципам из `constitution.md`
4. ✅ Создавай задачи перед сложной реализацией
5. ✅ Запускай чеклисты перед завершением фичи
6. ✅ **Локализация обязательна** (RU + EN)
7. ✅ **Только английский в коде**
8. ✅ **Применяй Vercel Agent Skills**
9. ✅ **Используй MCP серверы**

---

## 📝 Changelog

| Дата | Версия | Изменения |
|------|--------|-----------|
| 8 марта 2026 | 1.0 | Initial plan created |
