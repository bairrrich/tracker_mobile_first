# Next-Intl v4 Setup Guide

This document describes the next-intl v4 implementation in this project.

## Structure

```
project/
├── messages/                    # Translation files
│   ├── en.json                  # English translations
│   └── ru.json                  # Russian translations
├── src/i18n/
│   ├── routing.ts               # Routing configuration
│   └── request.ts               # Request configuration
├── middleware.ts                # Next.js middleware for i18n routing
└── components/layout/
    └── locale-switcher.tsx      # Language switcher component
```

## Configuration Files

### 1. `src/i18n/routing.ts`

Defines routing configuration using `defineRouting`:

```typescript
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  },
  localeDetection: false
});
```

### 2. `src/i18n/request.ts`

Configures how translations are loaded for each request:

```typescript
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async () => {
  const locale = routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

### 3. `middleware.ts`

Handles locale detection and routing:

```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(ru|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ]
};
```

### 4. `next.config.js`

Integrates next-intl with Next.js:

```javascript
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

module.exports = withNextIntl(nextConfig);
```

## Usage in Components

### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('HomePage');
  
  return <h1>{t('title')}</h1>;
}
```

### Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyComponent() {
  const t = await getTranslations('HomePage');
  
  return <h1>{t('title')}</h1>;
}
```

### Getting Current Locale

```typescript
import { useLocale } from 'next-intl';

export function LocaleDisplay() {
  const locale = useLocale();
  
  return <span>Current locale: {locale}</span>;
}
```

## Translation Files Structure

```json
{
  "HomePage": {
    "title": "Hello World",
    "description": "Welcome to our app"
  },
  "Settings": {
    "title": "Settings",
    "appearance": {
      "title": "Appearance"
    }
  }
}
```

## Locale Switching

The `LocaleSwitcher` component handles language switching:

```typescript
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

// In your settings page
<LocaleSwitcher />
```

When a user changes locale:
1. A cookie (`NEXT_LOCALE`) is set with the new locale
2. The page reloads to apply the new translations
3. Middleware reads the cookie on subsequent requests

## Key Features

| Feature | Configuration |
|---------|--------------|
| Cookie name | `NEXT_LOCALE` |
| Cookie max age | 1 year |
| Default locale | `en` |
| Supported locales | `en`, `ru` |
| Locale detection | Disabled (cookie only) |
| URL prefix | `as-needed` (only for non-default) |

## Migration Notes (next-intl v4)

Key changes from previous versions:

1. **Routing configuration**: Use `defineRouting` in `src/i18n/routing.ts`
2. **Middleware**: Import routing config in middleware
3. **Cookie name**: Changed to `NEXT_LOCALE` by default
4. **Client navigation**: Use `useRouter` and `usePathname` from `next-intl/client` (if available) or fall back to cookie + reload

## Troubleshooting

### Translations not loading
- Check that `messages/*.json` files exist
- Verify the path in `request.ts` is correct
- Ensure the locale exists in the `routing.locales` array

### Locale not switching
- Check that middleware is running (check matcher)
- Verify cookie name matches (`NEXT_LOCALE`)
- Clear browser cookies and try again

### Type errors
- Make sure `types/global.d.ts` is set up correctly
- Run `npm run build` to regenerate types
