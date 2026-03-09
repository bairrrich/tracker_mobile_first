'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/layout/theme-provider'
import { useSupabase } from '@/components/auth/supabase-provider'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { Moon, Sun, Smartphone, LogOut, User, Shield, Bell, Palette, Languages } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const currencies = [
  { value: 'USD', label: '$ - US Dollar' },
  { value: 'EUR', label: '€ - Euro' },
  { value: 'GBP', label: '£ - British Pound' },
  { value: 'RUB', label: '₽ - Russian Ruble' },
  { value: 'JPY', label: '¥ - Japanese Yen' },
  { value: 'CNY', label: '¥ - Chinese Yuan' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useSupabase()
  const t = useTranslations('Settings')
  const [currency, setCurrency] = React.useState('USD')
  const [notifications, setNotifications] = React.useState(true)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <CardTitle>{t('appearance.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('appearance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-medium">{t('appearance.lightTheme.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('appearance.lightTheme.description')}
                  </p>
                </div>
              </div>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                {theme === 'light' ? t('appearance.active') : t('appearance.select')}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                  <Moon className="w-5 h-5 text-[var(--text)]" />
                </div>
                <div>
                  <p className="font-medium">{t('appearance.darkTheme.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('appearance.darkTheme.description')}
                  </p>
                </div>
              </div>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                {theme === 'dark' ? t('appearance.active') : t('appearance.select')}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[var(--text)]" />
                </div>
                <div>
                  <p className="font-medium">{t('appearance.amoledTheme.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('appearance.amoledTheme.description')}
                  </p>
                </div>
              </div>
              <Button
                variant={theme === 'amoled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('amoled')}
              >
                {theme === 'amoled' ? t('appearance.active') : t('appearance.select')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              <CardTitle>{t('languageAndRegion.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('languageAndRegion.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('languageAndRegion.language')}</label>
              <LocaleSwitcher />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('languageAndRegion.currency')}</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder={t('languageAndRegion.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>{t('notifications.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.pushNotifications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.pushNotificationsDescription')}
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>{t('authentication.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('authentication.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <User className="w-6 h-6 text-[var(--primary-foreground)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('authentication.signedIn')}
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('authentication.signOut')}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-sm text-[var(--text)]">
                    {t('authentication.notSignedIn')}
                  </p>
                </div>

                <Button className="w-full" onClick={() => router.push('/auth')}>
                  <User className="w-4 h-4 mr-2" />
                  {t('authentication.signIn')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Changes */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            {t('resetToDefaults')}
          </Button>
          <Button>
            {t('saveChanges')}
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
