# Deployment Guide

## Vercel Deployment

### Prerequisites

1. Vercel account (free tier available)
2. GitHub repository with your code
3. Node.js 18+ installed

### Step 1: Connect to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Step 2: Configure Project

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_APP_NAME": "All Tracker Mobile",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0"
  },
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Step 3: Environment Variables

Set these in Vercel dashboard (Project Settings → Environment Variables):

```bash
# Application
NEXT_PUBLIC_APP_NAME="All Tracker Mobile"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Database (for production)
DATABASE_URL="your-production-db-url"

# Optional: Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="your-ga-id"
```

### Step 4: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 5: Custom Domain (Optional)

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown
4. Wait for SSL certificate (automatic)

---

## GitHub Actions CI/CD

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Performance Optimization

### 1. Code Splitting

Next.js does this automatically, but you can optimize further:

```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR if not needed
})
```

### 2. Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-fold images
  quality={75}
/>
```

### 3. Font Optimization

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // Prevents FOIT
  preload: true,
})
```

### 4. Bundle Analysis

```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})

# Run analysis
ANALYZE=true npm run build
```

---

## Monitoring Setup

### 1. Vercel Analytics

Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Sentry Error Tracking

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

### 3. Performance Monitoring

Use Web Vitals:

```bash
npm install web-vitals
```

Create `app/web-vitals.tsx`:

```typescript
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
    // Send to analytics
  })
}
```

---

## Post-Deployment Checklist

- [ ] Build completes without errors
- [ ] All routes accessible
- [ ] PWA manifest valid
- [ ] Service Worker registers
- [ ] Offline mode works
- [ ] API endpoints respond
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics tracking
- [ ] Error tracking configured
- [ ] Performance metrics acceptable

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

Check Vercel Functions logs:
- Dashboard → Project → Functions → Logs

### Database Issues

Ensure production database is configured:
```bash
vercel env pull
```

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Analytics](https://vercel.com/analytics)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
