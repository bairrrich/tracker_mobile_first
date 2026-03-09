# QWEN.md - AI Assistant Context

This file provides context for Qwen Code assistant working on this project.

## Project Overview

**All_Tracker_mobile** - мобильное приложение для трекинга различных активностей.

## Spec-Driven Development Process

This project uses **Spec Kit** methodology for structured AI-assisted development.

### Available Slash Commands

| Command | Purpose |
|---------|---------|
| `/speckit.constitution` | Create project principles |
| `/speckit.specify` | Define requirements and user stories |
| `/speckit.clarify` | Clarify unclear requirements |
| `/speckit.plan` | Technical planning |
| `/speckit.tasks` | Generate task list |
| `/speckit.analyze` | Analyze artifact consistency |
| `/speckit.implement` | Execute implementation |
| `/speckit.checklist` | Generate quality checklists |

### Development Workflow

```
Constitution → Specify → Clarify → Plan → Tasks → Implement
```

## Project Structure

```
All_Tracker_mobile/
├── .specify/
│   └── .qwen/
│       ├── memory/
│       │   ├── constitution.md    # Project principles
│       │   ├── product.md         # Product vision & roadmap
│       │   ├── system.md          # Technical architecture
│       │   └── changelog.md       # Version history
│       ├── scripts/                # Automation scripts
│       ├── specs/                  # Feature specifications
│       └── templates/              # Document templates
├── QWEN.md                         # This file
└── ... (source code)
```

## Guidelines

1. **Always check existing specifications** before implementing new features
2. **Update specifications** when requirements change
3. **Follow project constitution** for all technical decisions
4. **Create tasks** before implementing complex features
5. **Run checklists** before considering a feature complete
6. **Localization is mandatory** — all UI text must be in resource files (RU + EN)
7. **English only for code** — variable names, comments, commits (no Russian in code)
8. **Follow Vercel Agent Skills** — automatically apply relevant skills (React, UI, RN)
9. **Use MCP servers** — Context7, Sequential Thinking, Playwright, Chrome DevTools

## Qwen Added Memories
- Theme System Rules for this project:
1. NEVER use fixed colors like bg-neutral-100, bg-white, bg-black, text-white, text-black, etc.
2. ALWAYS use CSS variables: var(--card), var(--border), var(--text), var(--text-muted), var(--bg), var(--primary), var(--primary-foreground)
3. For component styles use: bg-[var(--card)], text-[var(--text)], border-[var(--border)], etc.
4. OKLCH color system is defined in globals.css with theme variables
5. All UI components must support light, dark, and AMOLED themes via CSS variables
6. When creating new components, always reference theme variables instead of hardcoded colors

## Coding Conventions

### Database Table Naming (snake_case only)

**ALL database table names MUST use snake_case format:**

| Entity | Table Name | Notes |
|--------|-----------|-------|
| Collections | `collections` | |
| Items | `items` | |
| Books | `books` | |
| Book Quotes | `book_quotes` | NOT `bookQuotes` |
| Metrics | `metrics` | |
| History | `history` | |
| Tags | `tags` | |
| Item Tags | `item_tags` | NOT `itemTags` |
| Notes | `notes` | |
| Sync Queue | `sync_queue` | |

**Rules:**
1. NEVER use camelCase for table names in sync operations (`table: 'book_quotes'` NOT `table: 'bookQuotes'`)
2. ALWAYS use snake_case in TABLE_MAPPING, markForSync(), and sync queue operations
3. Dexie property names can be camelCase (e.g., `db.bookQuotes`) but sync queue table names must be snake_case
4. Supabase table names are always snake_case
5. When adding new tables, follow the snake_case convention consistently

**Example:**
```typescript
// ✅ CORRECT
await markForSync('book_quotes', id, 'insert', data)
TABLE_MAPPING: { book_quotes: 'book_quotes' }

// ❌ WRONG
await markForSync('bookQuotes', id, 'insert', data)
TABLE_MAPPING: { bookQuotes: 'book_quotes' }
```
