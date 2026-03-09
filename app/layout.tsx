import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, setRequestLocale } from 'next-intl/server'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { InstallPrompt } from '@/components/ui/install-prompt'
import { QuickAddFAB } from '@/components/shared/quick-add-fab'
import { SupabaseProvider } from '@/components/auth/supabase-provider'
import { useSeedData } from '@/hooks/use-seed-data'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://all-tracker-mobile.vercel.app'),
  title: {
    default: 'All Tracker Mobile',
    template: '%s | All Tracker Mobile',
  },
  description: 'Track your activities - finances, exercises, books, vitamins, and more',
  keywords: ['tracker', 'activities', 'finances', 'exercises', 'books', 'health', 'PWA', 'offline-first'],
  authors: [{ name: 'All Tracker Team' }],
  creator: 'All Tracker Team',
  publisher: 'All Tracker',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://all-tracker-mobile.vercel.app',
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
  twitter: {
    card: 'summary_large_image',
    title: 'All Tracker Mobile',
    description: 'Track your activities - finances, exercises, books, vitamins, and more',
    images: ['/twitter-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: 'oklch(62% 0.19 260)',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  
  // Устанавливаем локаль для текущего запроса
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <SupabaseProvider>
            <ThemeProvider>
              <SeedDataInitializer />
              {children}
              <InstallPrompt />
              <QuickAddFAB />
            </ThemeProvider>
          </SupabaseProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

// Client component for seed data initialization
function SeedDataInitializer() {
  useSeedData()
  return null
}
