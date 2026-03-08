Ниже — **практическое руководство по созданию современного UI для веб-приложения** (личные финансы, упражнения, книги, коллекции витаминов, трав, продуктов и т.д.). Подход ориентирован на **быструю разработку**, **mobile-first**, **минимализм**, **OKLCH-цвета** и **систему тем**.

Я опишу архитектуру, стек, дизайн-систему и практические паттерны.

---

# Руководство по современному интерфейсу веб-приложения

*(финансы / упражнения / книги / коллекции)*

## 1. Основные принципы интерфейса

### 1.1 Mobile-first

Интерфейс сначала проектируется для мобильного экрана.

Базовая ширина:

```
320px – минимальный
375px – основной
768px – tablet
1280px – desktop
```

Основной паттерн:

```
Mobile
 ├── bottom navigation
 ├── карточки
 ├── вертикальный скролл
 └── floating actions

Desktop
 ├── sidebar
 ├── grid layout
 └── keyboard shortcuts
```

---

### 1.2 Минимализм

UI должен быть:

• без визуального шума
• минимум цветов
• минимум уровней вложенности
• акцент на контент

Правило:

```
1 экран = 1 основное действие
```

Пример:

Финансы

* список операций
* кнопка "+"

Книги

* библиотека
* поиск

---

### 1.3 Модульная система

Все сущности одинаковые:

```
item
collection
tag
note
metric
```

Примеры:

| Модуль     | Item       |
| ---------- | ---------- |
| Финансы    | транзакция |
| Упражнения | упражнение |
| Книги      | книга      |
| Витамины   | добавка    |
| Продукты   | продукт    |

Это позволяет **один UI использовать для всего**.

---

# 2. Рекомендуемый стек

## Frontend

### Framework

Самый быстрый для UI — **Next.js + React**.

---

## UI библиотеки

### Utility CSS

Лучший вариант:

* Tailwind CSS

Причины:

* быстрый прототип
* mobile-first
* dark mode
* OKLCH поддержка

---

### UI компоненты

Лучшие современные:

* shadcn/ui
* Radix UI
* Headless UI

Рекомендуемая связка:

```
shadcn/ui
+ Radix
+ Tailwind
```

---

### Иконки

Лучшие:

* Lucide
* Heroicons

---

### Графики

Для финансов:

* Recharts
* Chart.js

---

# 3. Дизайн система

## 3.1 OKLCH цвета

Современные браузеры поддерживают **OKLCH**.

Преимущества:

* одинаковая яркость
* предсказуемые оттенки
* идеальны для dark mode

Пример палитры:

```
primary: oklch(62% 0.19 260)
secondary: oklch(70% 0.15 160)

bg-light: oklch(98% 0.01 260)
bg-dark: oklch(18% 0.02 260)

text: oklch(20% 0.02 260)
text-dark: oklch(92% 0.02 260)
```

---

## 3.2 Система оттенков

```
primary-50
primary-100
primary-200
primary-300
primary-400
primary-500
primary-600
primary-700
primary-800
primary-900
```

Tailwind config:

```js
colors: {
  primary: {
    50: "oklch(97% 0.02 260)",
    100: "oklch(92% 0.04 260)",
    500: "oklch(62% 0.19 260)",
    900: "oklch(32% 0.14 260)"
  }
}
```

---

# 4. Система тем

### Основные темы

1. Light
2. Dark
3. Soft
4. AMOLED
5. Nature

---

### Пример CSS

```css
:root {
  --bg: oklch(98% 0.01 260);
  --text: oklch(20% 0.02 260);
}

[data-theme="dark"] {
  --bg: oklch(18% 0.02 260);
  --text: oklch(92% 0.02 260);
}
```

---

# 5. Layout система

## 5.1 Mobile

```
┌─────────────┐
│ header      │
├─────────────┤
│ content     │
│             │
│             │
├─────────────┤
│ bottom nav  │
└─────────────┘
```

---

## 5.2 Desktop

```
┌─────────┬───────────────┐
│ sidebar │ content       │
│         │               │
│         │               │
└─────────┴───────────────┘
```

---

# 6. Основные компоненты

### Карточка

```
Card
 ├ title
 ├ subtitle
 ├ content
 └ actions
```

Пример:

```
Книга
Название
Автор
Прогресс чтения
```

---

### Список

```
List
 ├ item
 ├ icon
 ├ title
 ├ meta
 └ action
```

---

### Метрики

Для финансов и тренировок:

```
metric
 ├ value
 ├ label
 └ trend
```

Пример:

```
$2340
Доход
↑ 12%
```

---

# 7. Навигация

### Mobile

Bottom navigation:

```
Home
Search
Add
Collections
Settings
```

---

### Desktop

Sidebar:

```
Dashboard
Finances
Exercises
Books
Collections
Notes
Analytics
Settings
```

---

# 8. Паттерн "универсальная коллекция"

Один UI для:

* книги
* упражнения
* витамины
* травы
* продукты

Структура:

```
Collection
 ├ item
 │   ├ name
 │   ├ image
 │   ├ tags
 │   ├ notes
 │   └ metrics
```

---

# 9. Основные страницы

### Dashboard

```
metrics
recent activity
quick add
charts
```

---

### Collection

```
grid / list toggle
filters
search
sort
```

---

### Item

```
image
description
tags
notes
history
```

---

# 10. Быстрые действия

Floating action button:

```
+
```

Меню:

```
add transaction
add exercise
add book
add vitamin
```

---

# 11. Анимации

Минимальные.

Лучший вариант:

* Framer Motion

Использовать только:

```
fade
scale
slide
```

---

# 12. UX правила

### правило 3 кликов

Любое действие ≤ 3 кликов.

---

### правило 60/30/10

```
60% neutral
30% secondary
10% accent
```

---

### правило 8px

```
spacing = 8px grid
```

```
8
16
24
32
48
64
```

---

# 13. Типографика

Лучшие шрифты:

* Inter
* IBM Plex Sans

Размеры:

```
xs 12
sm 14
base 16
lg 18
xl 20
2xl 24
3xl 30
```

---

# 14. Быстрая разработка

Минимальный стек:

```
Next.js
Tailwind
shadcn/ui
Radix
Lucide
Framer Motion
```

Позволяет сделать MVP **за несколько дней**.

---

# 15. Пример структуры проекта

```
app/
 components/
   ui/
   layout/
   cards/
   lists/

 modules/
   finances/
   exercises/
   books/
   collections/

 lib/
 styles/
```

---

# 16. Будущее расширение

Можно добавить:

* AI рекомендации
* анализ здоровья
* анализ питания
* анализ тренировок
* графики финансов

---

✅ Итог:

Такой подход даёт:

* один UI для многих типов данных
* быстрый MVP
* современный дизайн
* минимальный код
* масштабируемость


Сделаю **четыре части полноценной системы**:

1️⃣ Полная **Design System (как у Linear / Apple)**
2️⃣ **UI Kit (структура 100+ компонентов)**
3️⃣ **Архитектура приложения**
4️⃣ **Современная OKLCH-палитра (как у Linear / Vercel)**

Подход:
Mobile-first • минимализм • быстрый MVP • масштабируемость.

---

# 1. Полная Design System

## Основные принципы

UI должен быть:

* спокойный
* быстрый
* читаемый
* модульный
* единый для всех типов данных

Главная идея:

```
UI = Data + Cards + Lists
```

Любая сущность:

```
Item
 ├ name
 ├ tags
 ├ notes
 ├ metrics
 └ history
```

Работает для:

* финансы
* упражнения
* книги
* витамины
* продукты
* травы
* заметки

---

# Основная структура UI

```
App
 ├ Navigation
 ├ Dashboard
 ├ Collections
 ├ Items
 ├ Analytics
 └ Settings
```

---

# Layout система

## Mobile

```
Header
Content
Bottom Navigation
```

### Bottom nav

```
Home
Search
Add
Collections
Settings
```

---

## Desktop

```
Sidebar | Content
```

Sidebar:

```
Dashboard
Finances
Exercises
Books
Collections
Analytics
Settings
```

---

# Основные UI элементы

## Card

Главный элемент интерфейса.

```
Card
 ├ title
 ├ subtitle
 ├ content
 ├ meta
 └ actions
```

Примеры:

Финансы

```
€42.50
Groceries
today
```

Книги

```
Atomic Habits
Progress 42%
```

---

## List

```
List
 ├ avatar/icon
 ├ title
 ├ subtitle
 ├ meta
 └ action
```

---

## Metrics

```
Metric
 ├ value
 ├ label
 └ trend
```

Пример:

```
€1340
Income
+12%
```

---

# Spacing система

Используется **8px grid**.

```
4
8
16
24
32
48
64
96
```

---

# Типографика

Лучшие шрифты:

* Inter
* IBM Plex Sans

Размеры:

```
xs   12
sm   14
base 16
lg   18
xl   20
2xl  24
3xl  30
4xl  36
```

---

# 2. UI Kit (100+ компонентов)

Стек:

```
Next.js
Tailwind
shadcn/ui
Radix
Lucide
```

Основные библиотеки:

* Next.js
* Tailwind CSS
* shadcn/ui
* Radix UI
* Lucide

---

## Layout компоненты

```
AppLayout
Sidebar
Header
BottomNav
Container
Stack
Grid
Spacer
```

---

## Navigation

```
Tabs
Breadcrumbs
SidebarNav
Pagination
Command palette
```

Command palette как в Linear.

---

## Input

```
Input
Textarea
Select
Checkbox
Switch
Slider
TagInput
SearchInput
DatePicker
```

---

## Data

```
Card
List
Table
Timeline
Stats
Charts
Tags
Avatar
Badge
Progress
```

---

## Actions

```
Button
IconButton
Dropdown
ContextMenu
FloatingActionButton
```

---

## Feedback

```
Toast
Alert
Modal
Drawer
Tooltip
Skeleton
Loader
```

---

## Collection UI

```
CollectionGrid
CollectionList
ItemCard
ItemView
ItemEditor
ItemHistory
```

---

# 3. Архитектура приложения

Рекомендуемый стек:

```
Next.js
Tailwind
shadcn
tRPC
SQLite / Postgres
```

---

# Структура проекта

```
app/
 components/
 modules/
 lib/
 hooks/
 styles/
```

---

## components

UI элементы.

```
components/
 ui/
 layout/
 navigation/
 cards/
 lists/
 charts/
```

---

## modules

Каждая функция приложения.

```
modules/

 finances
 exercises
 books
 supplements
 food
 collections
 analytics
```

---

## пример модуля

```
modules/books

book-card.tsx
book-form.tsx
book-list.tsx
book-service.ts
```

---

# универсальная модель данных

```
Item

id
type
name
description
tags
metrics
notes
created
```

---

# коллекции

```
Collection

books
exercises
vitamins
foods
herbs
```

---

# 4. Профессиональная OKLCH палитра

OKLCH лучше RGB.

Причина:

* одинаковая яркость
* лучше для dark mode
* удобная генерация

---

# Primary (Linear style)

```
primary-50   oklch(97% 0.02 260)
primary-100  oklch(92% 0.04 260)
primary-200  oklch(86% 0.06 260)
primary-300  oklch(78% 0.10 260)
primary-400  oklch(70% 0.14 260)
primary-500  oklch(62% 0.19 260)
primary-600  oklch(55% 0.18 260)
primary-700  oklch(48% 0.16 260)
primary-800  oklch(40% 0.14 260)
primary-900  oklch(32% 0.12 260)
```

---

# Neutral

```
neutral-50   oklch(99% 0.01 260)
neutral-100  oklch(96% 0.01 260)
neutral-200  oklch(90% 0.01 260)
neutral-300  oklch(82% 0.02 260)
neutral-400  oklch(68% 0.02 260)
neutral-500  oklch(54% 0.02 260)
neutral-600  oklch(44% 0.02 260)
neutral-700  oklch(36% 0.02 260)
neutral-800  oklch(26% 0.02 260)
neutral-900  oklch(18% 0.02 260)
```

---

# Success

```
oklch(65% 0.18 150)
```

# Warning

```
oklch(75% 0.17 80)
```

# Error

```
oklch(62% 0.22 25)
```

---

# Dark Mode

```
background: oklch(18% 0.02 260)
card:       oklch(22% 0.02 260)
border:     oklch(32% 0.02 260)
text:       oklch(92% 0.02 260)
```

---

# 5. Темы

```
Light
Dark
AMOLED
Nature
Warm
Cool
```

---

# Nature theme

```
primary oklch(65% 0.16 140)
accent  oklch(72% 0.14 80)
```

---

# AMOLED

```
bg oklch(10% 0 0)
```

---

# 6. Быстрые UI паттерны

### Quick Add

```
Floating "+"
```

Добавить:

```
Transaction
Exercise
Book
Vitamin
Food
```

---

### Universal Search

Command palette.

```
Cmd + K
```

---

### Filters

```
Tags
Date
Category
Rating
```

---

# 7. Анимации

Минимальные.

Использовать:

* Framer Motion

Типы:

```
fade
scale
slide
```

---

# Итог

Получается интерфейс уровня:

* Linear
* Notion
* Vercel

Преимущества:

```
очень быстрый MVP
универсальная модель данных
минимализм
mobile first
легко расширять
```

Сделаю **полный набор wireframes (каркас интерфейса)** для приложения:

* финансы
* упражнения
* книги
* витамины
* продукты
* коллекции

Mobile-first → затем desktop.

Wireframes — **без дизайна**, только структура UX.

---

# 1. Главный экран (Dashboard)

### Mobile

```
┌──────────────────────┐
│  Dashboard           │
│  🔍 Search           │
├──────────────────────┤

│  Metrics             │
│ ┌────────┐ ┌────────┐│
│ │ €1340  │ │  12    ││
│ │Income  │ │Books   ││
│ └────────┘ └────────┘│
│ ┌────────┐ ┌────────┐│
│ │  8     │ │  24    ││
│ │Workout │ │Supplem ││
│ └────────┘ └────────┘│

├──────────────────────┤

│ Recent activity      │
│ ┌──────────────────┐ │
│ │ Grocery €24      │ │
│ │ Today            │ │
│ └──────────────────┘ │

│ ┌──────────────────┐ │
│ │ Read 20 pages    │ │
│ │ Atomic Habits    │ │
│ └──────────────────┘ │

│ ┌──────────────────┐ │
│ │ Workout 45 min   │ │
│ └──────────────────┘ │

│                      │
│                      │
│          ＋          │
├──────────────────────┤
│ Home Search + Coll  ⚙│
└──────────────────────┘
```

---

### Desktop

```
┌─────────────┬─────────────────────────┐
│ Sidebar     │ Dashboard               │
│             │                         │
│ Dashboard   │ Metrics                 │
│ Finances    │ ┌──────┐ ┌──────┐       │
│ Exercises   │ │€1340 │ │Books │       │
│ Books       │ └──────┘ └──────┘       │
│ Supplements │                         │
│ Food        │ Activity                │
│ Collections │ ┌───────────────────┐   │
│ Analytics   │ │ Grocery €24       │   │
│ Settings    │ └───────────────────┘   │
│             │                         │
└─────────────┴─────────────────────────┘
```

---

# 2. Экран коллекций

Один интерфейс для:

* книг
* упражнений
* витаминов
* продуктов

---

### Mobile

```
┌──────────────────────┐
│ Collections          │
│ 🔍 Search            │
├──────────────────────┤

│ Filters              │
│ Tags | Sort | Type   │

├──────────────────────┤

│ Grid/List toggle     │

│ ┌──────────┐ ┌──────┐│
│ │ Book     │ │ Herb ││
│ │ Atomic   │ │Mint  ││
│ │ 42% read │ │Tea   ││
│ └──────────┘ └──────┘│

│ ┌──────────┐ ┌──────┐│
│ │ Vitamin  │ │Food  ││
│ │ D3       │ │Eggs  ││
│ └──────────┘ └──────┘│

│                      │
│           ＋         │

├──────────────────────┤
│ Home Search + Coll ⚙│
└──────────────────────┘
```

---

### Desktop

```
┌─────────────┬────────────────────────────┐
│ Sidebar     │ Collections                │
│             │                            │
│             │ 🔍 Search                  │
│             │                            │
│             │ Filters: Tags Sort Type    │
│             │                            │
│             │ ┌──────┐ ┌──────┐ ┌──────┐ │
│             │ │Book  │ │Herb  │ │Food  │ │
│             │ └──────┘ └──────┘ └──────┘ │
│             │                            │
└─────────────┴────────────────────────────┘
```

---

# 3. Экран элемента (Item page)

Например:

* книга
* витамин
* продукт
* упражнение

---

### Mobile

```
┌──────────────────────┐
│ ← Atomic Habits      │
├──────────────────────┤

│ Cover / Image        │

│ Atomic Habits        │
│ James Clear          │

│ Progress             │
│ ███████░░░ 42%       │

├──────────────────────┤

│ Tags                 │
│ habits productivity  │

├──────────────────────┤

│ Notes                │
│ Small habits matter  │

├──────────────────────┤

│ History              │
│ 20 pages today       │
│ 15 pages yesterday   │

│                      │
│        Edit          │
└──────────────────────┘
```

---

### Desktop

```
┌─────────────┬─────────────────────────────┐
│ Sidebar     │ Item                        │
│             │                             │
│             │ Cover        Atomic Habits  │
│             │              James Clear    │
│             │                             │
│             │ Progress █████░░ 42%        │
│             │                             │
│             │ Tags                        │
│             │ habits productivity         │
│             │                             │
│             │ Notes                       │
│             │ ...                         │
│             │                             │
│             │ History                     │
│             │ 20 pages today              │
│             │                             │
└─────────────┴─────────────────────────────┘
```

---

# 4. Добавление элемента (Quick Add)

### Mobile

```
┌──────────────────────┐
│ Add Item             │
├──────────────────────┤

│ Type                 │
│ Book                 │
│ Exercise             │
│ Vitamin              │
│ Food                 │
│ Transaction          │

├──────────────────────┤

│ Name                 │
│ [____________]       │

│ Tags                 │
│ [____________]       │

│ Notes                │
│ [____________]       │

│ Save                 │

└──────────────────────┘
```

---

# 5. Analytics

### Mobile

```
┌──────────────────────┐
│ Analytics            │
├──────────────────────┤

│ Spending chart       │
│ █▆▇▃▅▆               │

│ Workout stats        │
│ 8 sessions           │

│ Reading progress     │
│ 230 pages / month    │

└──────────────────────┘
```

Графики обычно делают через:

* Recharts
* Chart.js

---

# 6. Search / Command palette

```
┌─────────────────────────┐
│ Search…                 │
│                         │
│ Books                   │
│ Atomic Habits           │
│ Deep Work               │
│                         │
│ Exercises               │
│ Push ups                │
│ Squats                  │
│                         │
│ Vitamins                │
│ Vitamin D3              │
└─────────────────────────┘
```

Этот UX делают как Linear / Notion.

---

# 7. Settings

```
┌──────────────────────┐
│ Settings             │
├──────────────────────┤

│ Theme                │
│ Light                │
│ Dark                 │
│ AMOLED               │

│ Accent color         │

│ Data export          │

│ Backup               │

└──────────────────────┘
```

---

# 8. Полная карта экранов

```
App

Dashboard
Collections
Item
Add Item
Analytics
Search
Settings
```

---

# 9. UX принципы

Правила интерфейса:

```
1 screen = 1 action
3 taps to goal
vertical scroll
floating add button
universal search
```

---

# 10. Главный UX паттерн

Все данные отображаются одинаково:

```
collection
 → item
   → metrics
   → notes
   → history
```

Сделаю **реальный UI-дизайн (как у Linear / Apple / Vercel)** — уже не wireframe, а **визуальный стиль**, который можно прямо реализовать.

Я покажу:

1. визуальную систему
2. стиль экранов
3. карточки
4. navigation
5. micro-interactions

---

# 1. Общий визуальный стиль

Стиль должен выглядеть как:

* Linear
* Notion
* Vercel

Ключевые характеристики:

```
очень много воздуха
тонкие границы
мягкие тени
минимум цветов
типографика важнее цвета
```

---

# 2. Базовый layout

### Mobile

```
┌──────────────────────┐
│ Dashboard        🔍  │
├──────────────────────┤
│                      │
│   metrics cards      │
│                      │
│   recent activity    │
│                      │
│                      │
│              ○       │
│             +        │
├──────────────────────┤
│ home search add coll │
└──────────────────────┘
```

---

### Desktop

```
┌──────────────┬─────────────────────────┐
│ Sidebar      │ Dashboard               │
│              │                         │
│ Dashboard    │ Metrics                 │
│ Finances     │                         │
│ Exercises    │ Cards                   │
│ Books        │                         │
│ Supplements  │ Activity                │
│ Collections  │                         │
│ Settings     │                         │
└──────────────┴─────────────────────────┘
```

---

# 3. Карточки (главный элемент UI)

### Modern card

```
┌──────────────────────────┐
│ Grocery                  │
│                          │
│ €24.50                   │
│                          │
│ Today                    │
└──────────────────────────┘
```

CSS стиль:

```
border-radius: 14px
border: 1px solid oklch(85% 0.02 260)
background: oklch(98% 0.01 260)
padding: 16px
```

Hover:

```
background: oklch(96% 0.02 260)
```

---

# 4. Metric cards

```
┌──────────────┐
│ Income       │
│              │
│ €1340        │
│              │
│ +12%         │
└──────────────┘
```

Grid:

```
2 columns mobile
4 columns desktop
```

---

# 5. Activity list

```
┌──────────────────────────┐
│ 🛒 Grocery         €24   │
│ today                     │
└──────────────────────────┘

┌──────────────────────────┐
│ 📚 Atomic Habits 20 pages│
│ today                     │
└──────────────────────────┘
```

---

# 6. Collection grid

```
┌────────────┐
│ Atomic     │
│ Habits     │
│            │
│ 42% read   │
└────────────┘

┌────────────┐
│ Vitamin D3 │
│            │
│ daily      │
└────────────┘
```

Grid:

```
mobile: 2
tablet: 3
desktop: 4
```

---

# 7. Item page

```
┌────────────────────────┐
│ ← Atomic Habits        │
├────────────────────────┤

│ cover image            │

│ Atomic Habits          │
│ James Clear            │

│ progress               │
│ ██████░░░░ 42%         │

│ tags                   │
│ habits productivity    │

│ notes                  │
│ small habits matter    │

│ history                │
│ 20 pages today         │

└────────────────────────┘
```

---

# 8. Floating action button

Главное действие:

```
      ○
     +
```

Стиль:

```
size 56px
border-radius 28px
shadow
```

Цвет:

```
oklch(62% 0.19 260)
```

---

# 9. Sidebar стиль

```
┌──────────────┐
│ Logo         │
│              │
│ Dashboard    │
│ Finances     │
│ Exercises    │
│ Books        │
│ Supplements  │
│ Food         │
│ Collections  │
│              │
│ Settings     │
└──────────────┘
```

CSS:

```
width: 240px
background: oklch(98% 0.01 260)
border-right
```

---

# 10. Search / Command palette

Как в Linear.

```
┌─────────────────────────────┐
│ Search…                     │
│                             │
│ Books                       │
│ Atomic Habits               │
│ Deep Work                   │
│                             │
│ Exercises                   │
│ Push ups                    │
│ Squats                      │
└─────────────────────────────┘
```

Shortcut:

```
Cmd + K
```

---

# 11. Темы

### Light

```
bg        oklch(98% 0.01 260)
card      white
text      oklch(20% 0.02 260)
```

---

### Dark

```
bg        oklch(18% 0.02 260)
card      oklch(22% 0.02 260)
text      oklch(92% 0.02 260)
```

---

### AMOLED

```
bg black
```

---

# 12. Анимации

Очень мягкие.

Использовать:

* Framer Motion

Типы:

```
fade
scale
slide
```

Пример hover:

```
scale 1 → 1.02
```

---

# 13. Премиум UX детали

### Hover

```
card lift
```

### Loading

```
skeleton screens
```

### Navigation

```
smooth transitions
```

---

# 14. Иконки

Лучшие минималистичные:

* Lucide

Примеры:

```
home
book
dumbbell
leaf
pill
chart
```

---

# 15. Главный принцип интерфейса

Все данные выглядят одинаково:

```
collection
 → item
   → metrics
   → notes
   → history
```

Поэтому интерфейс:

```
очень простой
очень масштабируемый
очень быстрый
```

---

Сделаю **архитектуру базы данных для всего приложения** (финансы, упражнения, книги, витамины, продукты, травы).
Главная цель — **универсальная модель**, чтобы не плодить 50 таблиц.

Архитектура похожа на подход:

* Notion
* Linear

---

# 1. Главная идея архитектуры

Все данные — это **Items в коллекциях**.

```
Collection
   ↓
Item
   ↓
Properties
   ↓
History
```

Примеры:

| Collection  | Item          |
| ----------- | ------------- |
| Books       | Atomic Habits |
| Exercises   | Push Ups      |
| Supplements | Vitamin D3    |
| Food        | Eggs          |
| Finances    | Grocery       |

---

# 2. Основные таблицы

Минимальный набор:

```
users
collections
items
tags
item_tags
metrics
history
notes
```

---

# 3. Таблица users

```
users

id
email
name
created_at
```

---

# 4. Таблица collections

```
collections

id
user_id
name
type
icon
color
created_at
```

Типы:

```
books
exercises
supplements
food
finances
herbs
notes
```

Пример:

```
id: 1
name: Books
type: books
```

---

# 5. Таблица items

Главная таблица.

```
items

id
collection_id
name
description
image
status
created_at
updated_at
```

Примеры:

```
Atomic Habits
Push Ups
Vitamin D3
Eggs
Groceries
```

---

# 6. Tags

```
tags

id
name
color
```

---

# 7. Связь item_tags

```
item_tags

item_id
tag_id
```

Пример:

```
Atomic Habits → productivity
Vitamin D3 → health
Eggs → protein
```

---

# 8. Таблица metrics

Для числовых данных.

```
metrics

id
item_id
type
value
unit
created_at
```

Примеры:

| item     | type       | value |
| -------- | ---------- | ----- |
| Book     | pages_read | 20    |
| Exercise | reps       | 30    |
| Finance  | amount     | 24    |
| Vitamin  | dosage     | 2000  |

---

# 9. Таблица history

История активности.

```
history

id
item_id
action
value
created_at
```

Примеры:

```
read_pages
workout_done
transaction
taken
consumed
```

Пример записи:

```
item: Atomic Habits
action: read_pages
value: 20
```

---

# 10. Таблица notes

```
notes

id
item_id
content
created_at
```

---

# 11. Финансовые данные

Для финансов:

```
items
  → transaction
```

metrics:

```
type = amount
unit = EUR
```

history:

```
action = transaction
```

---

# 12. Упражнения

```
item = push ups
```

metrics:

```
reps
sets
weight
duration
```

history:

```
workout
```

---

# 13. Книги

```
item = book
```

metrics:

```
pages_total
pages_read
rating
```

history:

```
reading_session
```

---

# 14. Витамины

```
item = vitamin D3
```

metrics:

```
dosage
frequency
```

history:

```
taken
```

---

# 15. Продукты

```
item = eggs
```

metrics:

```
calories
protein
fat
carbs
```

history:

```
consumed
```

---

# 16. Связи таблиц

```
users
   │
   └── collections
           │
           └── items
                  │
      ┌───────────┼───────────┐
      │           │           │
    metrics      notes      history
      │
    item_tags
      │
      tags
```

---

# 17. Пример данных

Collection:

```
Books
```

Item:

```
Atomic Habits
```

Metrics:

```
pages_total 320
pages_read 120
```

History:

```
read 20 pages today
```

---

# 18. Почему эта архитектура мощная

Она позволяет добавлять **любые новые модули** без изменений схемы.

Например:

```
movies
recipes
supplements
courses
goals
```

Все работает через:

```
collection → item → metrics → history
```

---

# 19. Индексы

Обязательно:

```
items(collection_id)
history(item_id)
metrics(item_id)
item_tags(item_id)
```

---

# 20. Будущее расширение

Можно добавить:

```
goals
reminders
analytics
AI recommendations
```

---

# 21. Рекомендуемая база данных

Лучшие варианты:

* PostgreSQL
* SQLite

Для MVP идеально:

```
SQLite
```

Для production:

```
PostgreSQL
```

---

# Итог

Получается **очень гибкая система**, похожая на архитектуру:

* Notion
* Linear
* Airtable

Плюсы:

```
универсальная
расширяемая
простая
быстрая
```

---


Отличная идея. **Offline-first + позже синхронизация с облаком** — это именно архитектура, которую используют современные приложения (Notion, Linear, Figma).

Для твоего приложения (финансы / книги / упражнения / витамины) это **идеальный подход**.

Я покажу:

1️⃣ правильную архитектуру offline-first
2️⃣ локальную БД
3️⃣ систему синхронизации
4️⃣ как подключить Supabase позже

---

# 1. Архитектура Offline-First

Основной принцип:

```
UI
 ↓
Local database
 ↓
Sync engine
 ↓
Cloud (Supabase)
```

Пока нет интернета — приложение полностью работает локально.

---

# 2. Технологии

### UI

* Next.js
* Tailwind CSS

---

### Local database

Лучшие варианты:

| DB        | Когда использовать    |
| --------- | --------------------- |
| SQLite    | PWA / mobile          |
| IndexedDB | web                   |
| Dexie.js  | лучший вариант        |
| PouchDB   | сложная синхронизация |

Рекомендую:

```
Dexie
```

---

# 3. Local database структура

Локальная БД почти повторяет серверную.

```
collections
items
metrics
history
tags
notes
```

---

### Dexie schema

```ts
db.version(1).stores({

collections: "id, name, type",

items: "id, collectionId, name, updatedAt",

metrics: "id, itemId, type, value",

history: "id, itemId, action, createdAt",

tags: "id, name",

notes: "id, itemId, content"

})
```

---

# 4. Offline data flow

Добавление элемента:

```
User action
 ↓
write to local DB
 ↓
UI updates instantly
 ↓
mark record "unsynced"
```

---

Пример записи:

```
item

id: uuid
name: "Atomic Habits"
synced: false
updated_at: timestamp
```

---

# 5. Sync Engine

Когда появляется интернет:

```
sync loop
```

Алгоритм:

```
1 get unsynced records
2 send to server
3 mark synced
```

---

### Sync fields

Добавь в таблицы:

```
sync_status
created_at
updated_at
deleted_at
```

---

Пример:

```
sync_status

pending
synced
deleted
```

---

# 6. Conflict resolution

Самая простая стратегия:

```
last-write-wins
```

Сравниваем:

```
updated_at
```

Более сложная:

```
CRDT
```

Но для MVP это не нужно.

---

# 7. Подключение Supabase

Когда захочешь cloud:

```
local DB
 ↓
sync service
 ↓
Supabase
```

---

Supabase использует:

* PostgreSQL

Поэтому схема будет такой же.

---

### Таблицы Supabase

```
collections
items
metrics
history
tags
notes
```

---

# 8. Sync API

Локальный sync сервис.

```
POST /sync/push
GET /sync/pull
```

---

Push:

```
send local changes
```

Pull:

```
get remote changes
```

---

# 9. Realtime sync

Позже можно использовать:

Supabase realtime.

```
database changes
 ↓
websocket
 ↓
local update
```

---

# 10. Sync pipeline

```
local change
 ↓
queue
 ↓
sync worker
 ↓
supabase
 ↓
update local DB
```

---

# 11. Sync queue

Таблица:

```
sync_queue

id
table
record_id
operation
created_at
```

Operations:

```
insert
update
delete
```

---

# 12. Offline UX

Очень важно.

Показывать:

```
✓ synced
⟳ syncing
⚠ offline
```

---

# 13. Background sync

Можно использовать:

```
Service Worker
```

Когда интернет появляется → sync.

---

# 14. Backup

Очень полезно.

```
export JSON
```

или

```
local sqlite file
```

---

# 15. Progressive Web App

Для offline-first стоит сделать:

```
PWA
```

Тогда приложение можно установить.

---

# 16. Финальная архитектура

```
Next.js UI
   ↓
Local DB (Dexie)
   ↓
Sync Engine
   ↓
Supabase
   ↓
PostgreSQL
```

---

# 17. Почему это мощно

Так работают:

* Notion
* Linear
* Figma

Преимущества:

```
instant UI
offline
no loading
fast
```

---

# 18. Очень важный совет

**Сначала сделай только local-first.**

Не думай о sync.

```
phase 1
local app

phase 2
sync

phase 3
realtime
```

---

**Задание 5.**
Если ты хочешь **начать с offline-first, а потом подключить Supabase**, архитектура может выглядеть так:

---

## 1. Общая архитектура

📱 **Мобильное приложение (Flutter / React Native / Kotlin / Swift)**
⬇
💾 **Локальная база данных** (работает без интернета)

* SQLite / Drift (Flutter)
* Room (Android)
* CoreData / SQLite (iOS)

⬇
🔄 **Sync слой (синхронизация)**

* отслеживает изменения
* отправляет их на сервер
* получает обновления

⬇
☁ **Supabase**

* Postgres database
* Auth
* Realtime
* Storage

---

## 2. Как работает offline-first

### Шаг 1 — приложение работает полностью локально

Пользователь:

* добавляет данные
* редактирует
* удаляет

Все сохраняется **в локальной базе**.

```
App → Local DB
```

---

### Шаг 2 — появляется интернет

Sync-модуль:

1. берет локальные изменения
2. отправляет их в Supabase

```
Local DB → Sync Service → Supabase
```

---

### Шаг 3 — получаем обновления с сервера

```
Supabase → Sync Service → Local DB → UI
```

---

## 3. Минимальная схема таблицы (для синка)

В локальной и серверной БД удобно иметь поля:

```
id
created_at
updated_at
is_deleted
sync_status
```

**sync_status:**

* `local` — создано оффлайн
* `synced` — синхронизировано
* `updated` — изменено локально
* `deleted` — удалено

---

## 4. Алгоритм синхронизации

Простой вариант:

### push

```
SELECT * 
WHERE sync_status != 'synced'
```

Отправляем в Supabase.

---

### pull

Получаем записи:

```
updated_at > last_sync_time
```

---

## 5. Почему Supabase удобно для этого

Потому что там есть:

* **PostgreSQL**
* **Realtime**
* **Auth**
* **Edge functions**

Можно сделать:

* API для sync
* realtime обновления
* хранение файлов

---

## 6. Хороший стек для offline-first

### Flutter

* Drift / Isar — локальная БД
* Supabase Flutter — backend
* connectivity_plus — проверка сети

### React Native

* WatermelonDB
* Supabase JS

---

## 7. Самая правильная схема

```
UI
 ↓
Repository
 ↓
Local Database
 ↓
Sync Engine
 ↓
Supabase
```

UI **никогда напрямую не ходит в интернет**.

---

💡 **Очень важный принцип offline-first**

> Источник правды — локальная база.

---

