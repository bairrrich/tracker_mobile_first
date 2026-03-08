# All_Tracker_mobile

Мобильное приложение для трекинга различных активностей.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- npm или pnpm
- Git

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd All_Tracker_mobile

# Установить зависимости
npm install

# Запустить разработку
npm run dev
```

---

## 📋 Технологии

### 🧩 Полный стек (offline-first)

| Категория | Технология | Назначение |
|-----------|------------|------------|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, PWA |
| **Language** | TypeScript | Типобезопасность |
| **Styling** | Tailwind CSS + OKLCH | Утилитарные стили, доступность |
| **UI Components** | shadcn/ui + Radix UI | Готовые доступные компоненты |
| **Icons** | Lucide Icons | Векторные иконки |
| **State** | Zustand | Глобальное состояние |
| **Data Fetching** | TanStack React Query | Кэширование, background sync |
| **Offline DB (Web)** | IndexedDB + Dexie.js | Локальное хранилище |
| **ORM** | Drizzle ORM | Работа с SQLite/PostgreSQL |
| **Backend DB** | SQLite (dev) / PostgreSQL (prod) | Хранение данных |
| **PWA** | next-pwa + Workbox | Offline caching, installable app |
| **Sync** | Custom Sync Engine + API routes | Синхронизация данных |
| **Validation** | Zod | Валидация схем |
| **Testing** | Jest + React Testing Library | Unit тесты |
| **E2E** | Playwright | End-to-end тесты |
| **Cloud (optional)** | Supabase | Backend-as-a-Service |

---

## 🏗️ Архитектура

### Архитектура offline-first приложения

```
Next.js (React UI)
       │
       │
Zustand state
       │
       │
Dexie.js
IndexedDB (offline DB)
       │
       │
Sync Engine
       │
       │
Next.js API routes
       │
       │
SQLite / PostgreSQL
       │
       │
Supabase (optional)
```

### Принципы разработки

1. **Mobile First** — прогрессивное улучшение от мобильных к десктопу
2. **Minimalism** — только необходимые элементы
3. **OKLCH Colors** — равномерное восприятие цвета
4. **Accessibility** — ARIA, контраст >4.5:1, keyboard navigation
5. **Localization** — RU + EN с первого дня
6. **English-only Code** — переменные, комментарии, коммиты на английском
7. **shadcn/ui + Radix UI** — обязательные компоненты (без нативных HTML элементов)

### Структура проекта

```
All_Tracker_mobile/
├── .specify/
│   └── .qwen/
│       ├── memory/           # Конституция, продукт, система
│       ├── scripts/          # MCP настройка
│       ├── specs/            # Спецификации функций
│       └── templates/        # Шаблоны документов
├── .agents/skills/           # Vercel Agent Skills
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (sync, backend)
│   │   └── sync/
│   │       └── route.ts
│   ├── (auth)/               # Route groups
│   ├── layout.tsx
│   └── page.tsx
├── components/               # React компоненты
│   ├── ui/                   # Переиспользуемые UI компоненты (shadcn/ui)
│   └── ...
├── hooks/                    # Custom hooks
├── lib/                      # Утилиты и конфигурация
│   ├── db.ts                 # Dexie.js конфигурация
│   ├── sync.ts               # Sync engine логика
│   └── api.ts                # API client
├── store/                    # Zustand stores
│   └── notesStore.ts
├── styles/                   # Глобальные стили
├── tests/                    # Тесты
└── public/
    ├── manifest.json         # PWA manifest
    └── sw.js                 # Service Worker
```

---

## 💾 Offline Database

### IndexedDB слой (Dexie.js)

**Почему Dexie:**

* Удобный API
* Транзакции
* Reactive queries
* Versioning migrations

**Пример использования:**

```typescript
// lib/db.ts
import Dexie from "dexie"

export const db = new Dexie("tracker_db")

db.version(1).stores({
  activities: "++id, type, title, createdAt, updatedAt",
  settings: "key, value"
})
```

---

## 📱 PWA (Progressive Web App)

### next-pwa + Workbox

**Функции:**

* Offline caching статических активов
* Installable app (Add to Home Screen)
* Push notifications
* Background sync

**Конфигурация:**

```typescript
// next.config.js
const withPWA = require('next-pwa')()

module.exports = withPWA({
  // Next.js config
})
```

---

## 🔄 Sync Engine

### Синхронизация данных

**Компоненты:**

* Custom sync engine (`lib/sync.ts`)
* API routes (`app/api/sync/route.ts`)
* Conflict resolution стратегия

**Пример sync endpoint:**

```typescript
// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.json()
  // Sync logic with SQLite/PostgreSQL
  return NextResponse.json({ synced: true })
}
```

---

## 🗄️ Backend Database

### Production setup

| Среда | Database |
|-------|----------|
| **Local/Dev** | SQLite |
| **Production** | PostgreSQL |

**ORM:** Drizzle ORM

**Пример подключения:**

```typescript
// lib/drizzle.ts
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

const sqlite = new Database('tracker.db')
export const db = drizzle(sqlite)
```

---

## ☁️ Cloud Integration (optional)

### Supabase

Можно подключить как backend-as-a-service:

* PostgreSQL database
* Authentication
* Real-time subscriptions
* Storage

---

## 🛠️ Инструменты разработки

### Vercel Agent Skills

Автоматически применяемые навыки для AI-агентов:

| Skill | Активируется при |
|-------|-----------------|
| `vercel-react-best-practices` | React/Next.js код |
| `web-design-guidelines` | UI аудит, доступность |
| `vercel-react-native-skills` | React Native код |
| `vercel-composition-patterns` | Композиция компонентов |
| `deploy-to-vercel` | Деплой на Vercel |

### MCP Servers

| Сервер | Назначение |
|--------|------------|
| **Context7** | Документация API |
| **Sequential Thinking** | Решение сложных задач |
| **Playwright** | E2E тесты |
| **Chrome DevTools** | Дебаггинг браузера |

Подробности: [MCP.md](./MCP.md)

---

## 📝 Процесс разработки

### Spec-Driven Development

```
Constitution → Specify → Clarify → Plan → Tasks → Implement
```

1. **Specify** — создать спецификацию в `.specify/.qwen/specs/`
2. **Plan** — технический план
3. **Tasks** — декомпозиция задач
4. **Implement** — реализация
5. **Checklist** — проверка качества

### Guidelines

1. Проверь существующие спецификации перед реализацией
2. Обновляй спецификации при изменении требований
3. Следуй принципам из `constitution.md`
4. Создавай задачи перед сложной реализацией
5. Запускай чеклисты перед завершением фичи
6. **Локализация обязательна** (RU + EN)
7. **Только английский в коде**
8. **Применяй Vercel Agent Skills**
9. **Используй MCP серверы**

---

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Playwright тесты
npx playwright test
```

---

## 🎨 Стиль кода

### Именование

```typescript
// ✅ Правильно
const isLoading = true;
const hasError = false;
function fetchUserData() { }

// ❌ Неправильно
const load = true;
const err = false;
function getData() { }
```

### Структура файлов

```typescript
// 1. Imports
// 2. Types
// 3. Constants
// 4. Component/Function
```

Подробности: [`.specify/.qwen/templates/code-style-guide.md`](./.specify/.qwen/templates/code-style-guide.md)

---

## 🌐 Локализация

Все UI тексты должны быть в ресурс-файлах:

```typescript
// ✅ Правильно
Text(context.l10n.screens.login.title)

// ❌ Неправильно
Text('Вход')
```

Поддерживаемые языки: **Русский** + **English**

Подробности: [`.specify/.qwen/templates/localization-guide.md`](./.specify/.qwen/templates/localization-guide.md)

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [QWEN.md](./QWEN.md) | Контекст для AI-ассистента |
| [MCP.md](./MCP.md) | MCP серверы |
| [.specify/.qwen/memory/constitution.md](./.specify/.qwen/memory/constitution.md) | Принципы проекта |
| [.specify/.qwen/memory/product.md](./.specify/.qwen/memory/product.md) | Видение продукта |
| [.specify/.qwen/memory/system.md](./.specify/.qwen/memory/system.md) | Техническая архитектура |

---

## 🚀 Деплой

```bash
# Деплой на Vercel
npm run deploy

# Или через CLI
vercel
```

---

## 📝 Changelog

См. [CHANGELOG.md](./.specify/.qwen/memory/changelog.md)

---

## 📄 Лицензия

MIT
