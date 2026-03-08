# SEO Configuration

## Meta Tags

Add these to `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'All Tracker Mobile',
    template: '%s | All Tracker Mobile',
  },
  description: 'Track your activities - finances, exercises, books, vitamins, and more',
  keywords: ['tracker', 'activities', 'finances', 'exercises', 'books', 'health', 'PWA'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Company',
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tracker',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}
```

## Open Graph Tags

```typescript
export const metadata: Metadata = {
  // ... basic metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'All Tracker Mobile',
    title: 'All Tracker Mobile',
    description: 'Track your activities - finances, exercises, books, vitamins, and more',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'All Tracker Mobile',
      },
    ],
  },
}
```

## Twitter Card

```typescript
export const metadata: Metadata = {
  // ... basic metadata
  twitter: {
    card: 'summary_large_image',
    title: 'All Tracker Mobile',
    description: 'Track your activities - finances, exercises, books, vitamins, and more',
    images: ['/twitter-image.png'],
    creator: '@yourusername',
  },
}
```

## Structured Data (JSON-LD)

Add to `app/page.tsx`:

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'All Tracker Mobile',
  description: 'Track your activities - finances, exercises, books, vitamins, and more',
  applicationCategory: 'Productivity',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}
```

## Sitemap

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-domain.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
}
```

## Robots.txt

Create `app/robots.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}
```
