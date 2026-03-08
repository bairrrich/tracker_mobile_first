# System Memory

## Architecture Overview

### Tech Stack (offline-first)

| Layer | Technology | Version | Назначение |
|-------|------------|---------|------------|
| **Framework** | Next.js 14+ (App Router) | Latest | SSR, API routes, PWA |
| **Language** | TypeScript | Latest | Типобезопасность |
| **Styling** | Tailwind CSS + OKLCH | Latest | Утилитарные стили |
| **UI Components** | shadcn/ui + Radix UI | Latest | Готовые компоненты |
| **Icons** | Lucide Icons | Latest | Векторные иконки |
| **State Management** | Zustand | Latest | Глобальное состояние |
| **Data Fetching** | TanStack React Query | Latest | Кэширование, sync |
| **Offline DB (Web)** | IndexedDB + Dexie.js | Latest | Локальное хранилище |
| **ORM** | Drizzle ORM | Latest | Работа с БД |
| **Backend DB** | SQLite / PostgreSQL | Latest | Хранение данных |
| **PWA** | next-pwa + Workbox | Latest | Offline, installable |
| **Sync** | Custom Sync Engine | Custom | Синхронизация |
| **Validation** | Zod | Latest | Валидация схем |
| **Testing** | Jest + RTL | Latest | Unit тесты |
| **E2E** | Playwright | Latest | End-to-end тесты |
| **Cloud (optional)** | Supabase | Latest | BaaS |

### Color System

All colors use **OKLCH** color space for accessibility and uniform perception:

```css
/* Example OKLCH colors */
--primary: oklch(0.5 0.1 200);
--success: oklch(0.6 0.12 140);
--warning: oklch(0.7 0.1 80);
--error: oklch(0.5 0.15 25);
```

### Theme System

- **Light mode** (default)
- **Dark mode** (night)
- Optional color variations
- Stored in `localStorage`
- CSS variables for theming

### Project Locale

- **Code language:** English only
- **UI languages:** Russian + English
- **Localization files:** `.arb` format

### Архитектура offline-first приложения

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Screens, Views, Widgets, Components)  │
│         shadcn/ui + Radix UI            │
├─────────────────────────────────────────┤
│         State Management Layer          │
│    (Zustand stores, React Query)        │
├─────────────────────────────────────────┤
│         Offline Database Layer          │
│    (IndexedDB + Dexie.js)               │
├─────────────────────────────────────────┤
│         Sync Engine Layer               │
│    (Custom sync logic, conflicts)       │
├─────────────────────────────────────────┤
│         API Routes Layer                │
│    (Next.js API, /api/sync)             │
├─────────────────────────────────────────┤
│         Backend Database Layer          │
│    (SQLite / PostgreSQL + Drizzle)      │
├─────────────────────────────────────────┤
│         Cloud Layer (optional)          │
│    (Supabase, external services)        │
└─────────────────────────────────────────┘
```

## Project Structure

```
All_Tracker_mobile/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── sync/
│   │       └── route.ts      # Sync endpoint
│   ├── (auth)/               # Route groups
│   ├── layout.tsx
│   └── page.tsx
├── components/               # React компоненты
│   ├── ui/                   # Переиспользуемые shadcn/ui компоненты
│   └── ...
├── hooks/                    # Custom hooks
├── lib/                      # Утилиты и конфигурация
│   ├── db.ts                 # Dexie.js конфигурация
│   ├── sync.ts               # Sync engine логика
│   ├── api.ts                # API client
│   └── drizzle.ts            # Drizzle ORM конфигурация
├── store/                    # Zustand stores
│   └── notesStore.ts
├── styles/                   # Глобальные стили
├── tests/                    # Тесты
└── public/
    ├── manifest.json         # PWA manifest
    └── sw.js                 # Service Worker
```

## Key Design Decisions

### Decision 1: Offline-first архитектура
- **Status:** Accepted
- **Context:** Приложение должно работать без подключения к интернету
- **Consequences:** 
  - IndexedDB + Dexie.js для локального хранения
  - Custom sync engine для синхронизации
  - PWA для offline caching

### Decision 2: shadcn/ui + Radix UI компоненты
- **Status:** Accepted
- **Context:** Требование к использованию готовых компонентов
- **Consequences:**
  - Запрет нативных HTML элементов (input, select, button)
  - Все UI компоненты на базе shadcn/ui
  - Переиспользуемые компоненты в `/components/ui/`

### Decision 3: Dexie.js для IndexedDB
- **Status:** Accepted
- **Context:** Удобная работа с IndexedDB
- **Consequences:**
  - Версионирование схемы БД
  - Транзакции
  - Reactive queries

### Decision 4: Drizzle ORM
- **Status:** Accepted
- **Context:** Типобезопасная работа с SQLite/PostgreSQL
- **Consequences:**
  - Поддержка SQLite (dev) и PostgreSQL (prod)
  - Типобезопасные запросы
  - Миграции

---

## Offline Database (Dexie.js)

**Пример конфигурации:**

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

## PWA (Progressive Web App)

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
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development'
  }
})
```

---

## Sync Engine

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

## Backend Database

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

## Performance Guidelines

| Metric | Target |
|--------|--------|
| App startup time | < 2 seconds |
| Frame rate | 60 FPS |
| Memory footprint | < 100 MB |
| Bundle size | < 50 MB |
| Offline support | Full functionality |

## Dependencies

### Production Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "dexie": "^4.x",
  "zustand": "^4.x",
  "@tanstack/react-query": "^5.x",
  "drizzle-orm": "^0.x",
  "better-sqlite3": "^9.x",
  "zod": "^3.x",
  "next-pwa": "^5.x",
  "workbox-window": "^7.x",
  "@radix-ui/*": "latest",
  "class-variance-authority": "^0.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "lucide-react": "^0.x"
}
```

### Development Dependencies

```json
{
  "typescript": "^5.x",
  "@types/node": "^20.x",
  "@types/react": "^18.x",
  "@types/better-sqlite3": "^7.x",
  "jest": "^29.x",
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "playwright": "^1.x",
  "@playwright/test": "^1.x",
  "tailwindcss": "^3.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x"
}
```

---

## Build & Development

### Setup

```bash
# Install dependencies
npm install

# Run development build
npm run dev

# Run tests
npm run test
```

### Build Commands

```bash
# Debug build
npm run build

# Release build
npm run build && npm run start

# Run E2E tests
npm run test:e2e
```

---

## Testing Strategy

| Test Type | Coverage Goal | Tools |
|-----------|---------------|-------|
| Unit Tests | 80%+ | Jest + RTL |
| Component Tests | Key components | Jest + RTL |
| Integration Tests | Critical paths | Jest + RTL |
| E2E Tests | Main flows | Playwright |

---

## Security Considerations

- No hardcoded secrets
- Secure local storage for sensitive data (IndexedDB encryption)
- Input validation on all user inputs (Zod)
- Regular dependency updates
- XSS protection via React escaping
- CSRF protection for API routes
