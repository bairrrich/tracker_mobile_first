# 🚀 Getting Started Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **pnpm** - Package manager
- **Git** - Version control

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd All_Tracker_mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
All_Tracker_mobile/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard
│   └── collections/        # Collections module
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   └── shared/             # Shared components
├── lib/
│   ├── db.ts               # Dexie.js database
│   ├── repositories/       # Data repositories
│   └── utils.ts            # Utilities
├── store/                  # Zustand stores
├── hooks/                  # Custom hooks
├── public/                 # Static assets
└── styles/                 # Global styles
```

---

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing

```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

### Deployment

```bash
npm run deploy       # Deploy to Vercel
vercel               # Vercel CLI
```

---

## Features

### ✅ Completed

| Feature | Status |
|---------|--------|
| **Offline-first** | ✅ Works without internet |
| **PWA** | ✅ Installable app |
| **Themes** | ✅ Light/Dark/AMOLED |
| **Database** | ✅ IndexedDB + Dexie.js |
| **Sync** | ✅ Sync queue system |
| **UI Components** | ✅ 24+ components |
| **Responsive** | ✅ Mobile-first |

### 🔄 In Progress

| Feature | Status |
|---------|--------|
| **Forms & Validation** | 🔄 Zod schemas |
| **Sync Engine** | ⏳ API routes |
| **Backend** | ⏳ SQLite/Drizzle |
| **Testing** | ⏳ Unit/E2E tests |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16+ |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 + OKLCH |
| **UI** | shadcn/ui + Radix UI |
| **State** | Zustand |
| **Database** | Dexie.js (IndexedDB) |
| **PWA** | Custom Service Worker |

---

## Key Concepts

### Offline-first

The app works completely offline using IndexedDB. Changes are queued for sync when online.

```typescript
// Data is saved locally first
await itemsRepository.create(data)

// Then queued for sync
await markForSync('items', id, 'insert', data)
```

### Themes

Three themes supported:

- **Light** - Default
- **Dark** - For low light
- **AMOLED** - Pure black

```typescript
import { useTheme } from '@/components/layout/theme-provider'

const { theme, setTheme } = useTheme()
setTheme('dark')
```

### PWA

Install the app on your device:

1. Open in Chrome/Edge
2. Click "Install App" in address bar
3. Or use the install prompt

---

## Common Tasks

### Add a New Collection

1. Click "+" button on Dashboard
2. Or go to Collections → New Collection
3. Fill in name, type, description
4. Click Create

### View Item Details

1. Go to Collections
2. Click on a collection
3. Click on an item
4. View details, metrics, progress

### Quick Add

Click the floating "+" button:

- 💰 Transaction
- 💪 Workout
- 📚 Book
- 💊 Supplement
- 🍎 Food

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

### PWA Not Working

1. Ensure HTTPS (or localhost)
2. Check Service Worker registration
3. Clear browser cache

### Database Issues

```typescript
// Check database
import { db } from '@/lib/db'

console.log(await db.collections.toArray())
```

---

## Environment Variables

Create `.env.local`:

```bash
# Optional: Supabase for sync
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Required:** IndexedDB, Service Workers, WebAssembly

---

## Performance Tips

1. **Lazy load** heavy components
2. **Memoize** expensive calculations
3. **Debounce** search inputs
4. **Cache** API responses
5. **Optimize** images (WebP)

---

## Accessibility

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Color contrast > 4.5:1

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Dexie.js](https://dexie.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

## Support

For issues or questions:

1. Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Review [QUICK_START.md](./QUICK_START.md)
3. Read specifications in `.specify/.qwen/specs/`

---

## License

MIT
