# Quick Start Commands

## Project Status

**Current Phase:** Phase 7 - Sync Engine (Upcoming)

### Completed Phases

| Phase | Status | Description | Files |
|-------|--------|-------------|-------|
| **Phase 1** | ✅ Complete | Foundation - Project setup, Tailwind, OKLCH, Themes | 15+ |
| **Phase 2** | ✅ Complete | Core UI Components - 24+ shadcn/ui components | 24+ |
| **Phase 3** | ✅ Complete | Offline Database - Dexie.js + IndexedDB + Repositories | 10+ |
| **Phase 4** | ✅ Complete | PWA - Service Worker, Offline caching, Install prompt | 5+ |
| **Phase 5** | ✅ Complete | Collections Module - Dashboard, Collections, Items | 6+ |
| **Phase 6** | ✅ Complete | Forms & Validation - Zod schemas, Form components | 8+ |
| **Phase 7** | 🔄 Upcoming | Sync Engine - API routes, Sync logic | - |

### Project Statistics

| Category | Count |
|----------|-------|
| **Total Files** | 75+ |
| **UI Components** | 24+ |
| **Database Tables** | 8 |
| **Repository Classes** | 5 |
| **Zustand Stores** | 3 |
| **Custom Hooks** | 3 |
| **PWA Features** | 6 |
| **Pages/Routes** | 4 |
| **Documentation Files** | 11+ |
| **Build Status** | ✅ Passing |

### Progress

```
██████████████░░░░░░░░░░░░░░░░ 60% (6/10 phases complete)
```

### Quick Commands

```bash
npm run dev      # Start development (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run unit tests
npm run test:e2e # Run E2E tests
```

### Project Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Dashboard with metrics | ✅ Complete |
| `/collections` | Collections list (grid/list) | ✅ Complete |
| `/collections/[id]/items/[itemId]` | Item detail page | ✅ Complete |
| `/_not-found` | 404 page | ✅ Auto |

### Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Offline-first** | ✅ | Full functionality without internet |
| **PWA** | ✅ | Installable on mobile devices |
| **Themes** | ✅ | Light/Dark/AMOLED (3 themes) |
| **Database** | ✅ | IndexedDB + Dexie.js (8 tables) |
| **Sync Queue** | ✅ | Sync queue with auto-sync |
| **UI Components** | ✅ | 24+ shadcn/ui + Radix UI |
| **Responsive** | ✅ | Mobile-first design |
| **Accessibility** | ✅ | ARIA, keyboard nav, contrast |
| **Form Validation** | ✅ | Zod schemas + useForm hook |
| **Formatting** | ✅ | Currency, date, number formatting |

---

## Installation

```bash
# Install dependencies
npm install

# Verify installation
npm run dev
```

---

## Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Run linter with fix
npm run lint -- --fix
```

---

## Building

```bash
# Build for production
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run build -- --stats
```

---

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## Deployment

```bash
# Deploy to Vercel
npm run deploy

# Or use Vercel CLI
vercel

# Deploy to production
vercel --prod
```

---

## Database

```bash
# SQLite commands (when backend is set up)
node scripts/db-migrate.js
node scripts/db-seed.js
```

---

## Utilities

```bash
# Type check
npx tsc --noEmit

# Check for outdated dependencies
npx npm-check-updates

# Update dependencies
npx npm-check-updates -u
npm install
```

---

## Git Commands

```bash
# Check status
git status

# View recent commits
git log -n 5

# Stage all changes
git add .

# Commit with message
git commit -m "feat: add new feature"

# Push to remote
git push origin main
```

---

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting
- `refactor` — Code restructuring
- `test` — Tests
- `chore` — Maintenance

**Examples:**
```
feat(ui): add Button component
fix(db): resolve sync issue
docs(readme): update installation steps
refactor(store): simplify state management
```

---

## Environment Variables

Create `.env.local`:

```bash
# Supabase (optional, for sync)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# App settings
NEXT_PUBLIC_APP_NAME="All Tracker Mobile"
NEXT_PUBLIC_APP_VERSION="0.1.0"
```

---

## Troubleshooting

### Clear cache

```bash
# Next.js cache
rm -rf .next

# Node modules
rm -rf node_modules
npm install

# PWA cache (in browser DevTools)
# Application → Storage → Clear site data
```

### Reset everything

```bash
rm -rf node_modules .next
npm install
npm run dev
```

---

## Useful VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- CSS Modules

---

## Keyboard Shortcuts (DevTools)

| Shortcut | Action |
|----------|--------|
| `Cmd + Shift + C` | Inspect element |
| `Cmd + Shift + J` | Open Console |
| `Cmd + Option + J` | Open Console (Mac) |
| `Cmd + Shift + P` | Command palette |
| `Cmd + K` | Clear console |

---

## PWA Testing

```bash
# Build and test PWA
npm run build
npm run start

# Open in browser
# DevTools → Application → Manifest
# DevTools → Application → Service Workers
```

---

## Performance Testing

```bash
# Lighthouse CLI
npx lighthouse http://localhost:3000 --view

# Web Vitals
# Install web-vitals package
# Import in app to monitor metrics
```

---

## Accessibility Testing

```bash
# axe DevTools (browser extension)
# WAVE (browser extension)
# Lighthouse accessibility audit
```

---

## Mobile Testing

```bash
# Chrome DevTools → Toggle device toolbar
# Select device: iPhone 12, Pixel 5, etc.
# Test touch interactions
# Test offline mode
```

---

## Current Dependencies

### Production

```json
{
  "next": "^16.x",
  "react": "^18.x",
  "tailwindcss": "^4.x",
  "@radix-ui/*": "latest",
  "cmdk": "latest",
  "dexie": "^4.x",
  "zustand": "^4.x",
  "zod": "^3.x"
}
```

### Development

```json
{
  "typescript": "^5.x",
  "jest": "^29.x",
  "@testing-library/react": "^14.x",
  "playwright": "^1.x"
}
```

---

## Contact

For questions or issues, refer to project documentation or team channels.
