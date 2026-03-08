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

| Категория | Технология |
|-----------|------------|
| **Framework** | Next.js 14+ |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + OKLCH |
| **UI Components** | shadcn/ui + Radix UI |
| **Icons** | Lucide Icons |
| **State** | Zustand |
| **Data** | TanStack React Query |
| **Validation** | Zod |
| **Testing** | Jest + React Testing Library |
| **E2E** | Playwright |

---

## 🏗️ Архитектура

### Принципы разработки

1. **Mobile First** — прогрессивное улучшение от мобильных к десктопу
2. **Minimalism** — только необходимые элементы
3. **OKLCH Colors** — равномерное восприятие цвета
4. **Accessibility** — ARIA, контраст >4.5:1, keyboard navigation
5. **Localization** — RU + EN с первого дня
6. **English-only Code** — переменные, комментарии, коммиты на английском

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
├── components/               # React компоненты
├── hooks/                    # Custom hooks
├── lib/                      # Утилиты и конфигурация
├── styles/                   # Глобальные стили
└── tests/                    # Тесты
```

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
