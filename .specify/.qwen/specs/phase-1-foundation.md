# Phase 1: Foundation Specification

**Status:** Approved  
**Priority:** P0 (Critical)  
**Phase:** 1  
**Estimated Time:** 2-3 days

---

## Overview

Phase 1 establishes the foundational setup for the All_Tracker_mobile application. This includes project initialization, configuration files, design system setup, and theme system.

---

## Objectives

1. Initialize Next.js 14+ project with App Router
2. Configure TypeScript with strict mode
3. Set up Tailwind CSS with OKLCH color system
4. Configure PWA support
5. Implement theme system (Light/Dark/AMOLED)
6. Create project structure

---

## Tasks

### 1.1 Project Initialization

**Files:**
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `.gitignore`

**Commands:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint
npm install [dependencies]
```

### 1.2 Dependencies Installation

**Production:**
```json
{
  "@radix-ui/*": "latest",
  "@tanstack/react-query": "^5.x",
  "dexie": "^3.x",
  "drizzle-orm": "^0.x",
  "lucide-react": "^0.x",
  "next": "^14.x",
  "next-pwa": "^5.x",
  "react": "^18.x",
  "tailwind-merge": "^2.x",
  "zod": "^3.x",
  "zustand": "^4.x"
}
```

**Development:**
```json
{
  "@playwright/test": "^1.x",
  "@testing-library/react": "^14.x",
  "@types/node": "^20.x",
  "@types/react": "^18.x",
  "jest": "^29.x",
  "tailwindcss": "^3.x",
  "typescript": "^5.x"
}
```

### 1.3 Configuration Files

**tailwind.config.ts:**
- OKLCH color palette (primary, neutral, semantic)
- Theme CSS variables
- Spacing (8px grid)
- Typography scale
- Border radius scale
- Animation keyframes

**tsconfig.json:**
- Strict mode enabled
- Path aliases (@/*, @/components/*, etc.)
- Next.js plugin

**next.config.js:**
- PWA configuration
- Image optimization
- SWC minification

**postcss.config.js:**
- Tailwind CSS
- Autoprefixer

### 1.4 Global Styles

**styles/globals.css:**

```css
:root {
  /* Light theme */
  --bg: oklch(98% 0.01 260);
  --card: oklch(100% 0 0);
  --border: oklch(90% 0.01 260);
  --text: oklch(20% 0.02 260);
}

[data-theme='dark'] {
  /* Dark theme */
  --bg: oklch(18% 0.02 260);
  --card: oklch(22% 0.02 260);
  --text: oklch(92% 0.02 260);
}

[data-theme='amoled'] {
  /* AMOLED theme */
  --bg: oklch(0% 0 0);
  --card: oklch(10% 0.01 260);
  --text: oklch(92% 0.02 260);
}
```

**Component classes:**
- `.card`
- `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-destructive`
- `.input`
- `.bottom-nav`
- `.sidebar`
- `.fab`
- `.metric-card`
- `.collection-grid`
- `.list-item`
- `.empty-state`
- `.skeleton`

### 1.5 PWA Setup

**public/manifest.json:**
```json
{
  "name": "All Tracker Mobile",
  "short_name": "Tracker",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "oklch(62% 0.19 260)",
  "background_color": "oklch(98% 0.01 260)"
}
```

**next.config.js:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})
```

### 1.6 Utility Functions

**lib/utils.ts:**
- `cn()` - class name merger
- `formatCurrency()`
- `formatDate()`
- `formatRelativeTime()`
- `formatPercent()`
- `truncate()`
- `generateId()`
- `debounce()`
- `isDefined()`

---

## Deliverables

| File | Status |
|------|--------|
| `package.json` | ✅ Created |
| `tsconfig.json` | ✅ Created |
| `tailwind.config.ts` | ✅ Created |
| `next.config.js` | ✅ Created |
| `postcss.config.js` | ✅ Created |
| `.gitignore` | ✅ Created |
| `styles/globals.css` | ✅ Created |
| `lib/utils.ts` | ✅ Created |
| `public/manifest.json` | ✅ Created |
| `jest.config.js` | ✅ Created |
| `playwright.config.ts` | ✅ Created |

---

## Acceptance Criteria

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server
- [ ] TypeScript compiles without errors
- [ ] Tailwind CSS classes work
- [ ] OKLCH colors display correctly
- [ ] Theme switcher changes themes
- [ ] Themes persist in localStorage
- [ ] PWA manifest is valid
- [ ] Linting passes

---

## Testing

### Manual Tests

1. **Project Setup**
   - Run `npm install`
   - Run `npm run dev`
   - Open http://localhost:3000

2. **Theme System**
   - Switch to Dark theme
   - Verify colors change
   - Refresh page
   - Verify theme persists

3. **Styling**
   - Verify Tailwind classes work
   - Verify OKLCH colors render
   - Check mobile responsive

---

## Technical Notes

### OKLCH Color Palette

**Primary (Linear style blue):**
```
50:  oklch(97% 0.02 260)
100: oklch(92% 0.04 260)
500: oklch(62% 0.19 260)
900: oklch(32% 0.12 260)
```

**Neutral:**
```
50:  oklch(99% 0.01 260)
500: oklch(54% 0.02 260)
900: oklch(18% 0.02 260)
```

**Semantic:**
```
success: oklch(65% 0.18 150)
warning: oklch(75% 0.17 80)
error:   oklch(62% 0.22 25)
```

---

## Dependencies

- None (this is the first phase)

---

## Related Documents

- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
- [constitution.md](./.specify/.qwen/memory/constitution.md)
- [system.md](./.specify/.qwen/memory/system.md)

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-08 | AI Assistant | Initial specification |
