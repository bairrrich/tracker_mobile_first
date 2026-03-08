# Project Structure

This document describes the project structure following Next.js and React best practices.

## Directory Structure

```
all-tracker-mobile/
├── .github/                    # GitHub Actions workflows and configuration
├── .specify/                   # Project specifications and documentation
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group for authentication pages
│   ├── api/                    # API routes
│   ├── auth/                   # Authentication pages
│   ├── collections/            # Collections feature
│   ├── locales/                # Translation files (i18n)
│   ├── settings/               # Settings page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (Dashboard)
├── components/                 # React components
│   ├── auth/                   # Authentication components
│   ├── forms/                  # Form components and validation
│   ├── layout/                 # Layout components (Header, Footer, etc.)
│   ├── shared/                 # Shared/reusable components
│   └── ui/                     # UI primitives (Button, Card, etc.)
├── hooks/                      # Custom React hooks
│   ├── use-form.ts             # Form handling hook
│   ├── use-locale.ts           # Locale management hook
│   ├── use-pwa.ts              # PWA features hook
│   └── use-sync.ts             # Sync state hook
├── lib/                        # Core utilities and libraries
│   ├── i18n/                   # Internationalization config
│   ├── repositories/           # Data access layer
│   ├── validations/            # Zod schemas and validators
│   ├── db-schema.ts            # Database schema
│   ├── db-server.ts            # Server-side DB utilities
│   ├── db.ts                   # Client-side DB utilities
│   ├── formatting.ts           # Formatting utilities
│   ├── supabase.ts             # Supabase client
│   ├── sync-engine.ts          # Sync logic
│   └── utils.ts                # General utilities
├── public/                     # Static assets
├── scripts/                    # Build and maintenance scripts
├── store/                      # Zustand state management
│   ├── collections-store.ts    # Collections state
│   ├── items-store.ts          # Items state
│   └── sync-store.ts           # Sync state
├── styles/                     # Global styles
├── supabase/                   # Supabase configuration
├── tests/                      # Test files
│   ├── e2e/                    # End-to-end tests (Playwright)
│   └── unit/                   # Unit tests (Jest)
├── types/                      # TypeScript type definitions
│   └── global.d.ts             # Global type declarations
├── middleware.ts               # Next.js middleware (i18n routing)
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Key Conventions

### Path Aliases

| Alias | Path | Description |
|-------|------|-------------|
| `@/*` | `./*` | Root directory |
| `@/components/*` | `./components/*` | Components |
| `@/lib/*` | `./lib/*` | Libraries and utilities |
| `@/hooks/*` | `./hooks/*` | Custom hooks |
| `@/store/*` | `./store/*` | State management |
| `@/styles/*` | `./styles/*` | Styles |
| `@/public/*` | `./public/*` | Public assets |
| `@/types/*` | `./types/*` | Type definitions |

### Component Organization

1. **UI Components** (`components/ui/`) - Low-level, reusable primitives
   - No business logic
   - Fully documented with props
   - Support theming

2. **Shared Components** (`components/shared/`) - Feature-agnostic components
   - May contain business logic
   - Composed of UI components

3. **Layout Components** (`components/layout/`) - App structure
   - Header, Footer, Navigation
   - Main layout wrappers

4. **Feature Components** (`components/auth/`, `components/forms/`) - Domain-specific
   - Tied to specific features
   - May contain complex logic

### State Management

- **Zustand** for global state (`store/`)
- **React Query** for server state
- **Custom hooks** for local state logic (`hooks/`)

### Internationalization

- **next-intl** for i18n
- Translation files in `app/locales/`
- Locale stored in cookies
- Middleware for locale detection

### Database

- **Drizzle ORM** for type-safe database access
- **SQLite** for local storage (development)
- **Dexie** for IndexedDB (PWA offline support)
- **Supabase** for cloud sync (production)

## Best Practices

1. **Colocation**: Keep related files together (components, hooks, tests)
2. **Barrel exports**: Use `index.ts` for clean imports
3. **Type safety**: Strict TypeScript, no `any`
4. **Testing**: Unit tests for utilities, E2E for critical flows
5. **Performance**: Code splitting, lazy loading, memoization
6. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
