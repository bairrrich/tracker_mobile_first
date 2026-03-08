'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/layout/theme-provider'
import { useSupabase } from '@/components/auth/supabase-provider'
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

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useSupabase()
  const [currency, setCurrency] = React.useState('USD')
  const [language, setLanguage] = React.useState('en')
  const [notifications, setNotifications] = React.useState(true)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your app preferences and account
          </p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Light Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Bright and clean interface
                  </p>
                </div>
              </div>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                {theme === 'light' ? 'Active' : 'Select'}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Dark Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Easy on the eyes
                  </p>
                </div>
              </div>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                {theme === 'dark' ? 'Active' : 'Select'}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">AMOLED Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Pure black for OLED screens
                  </p>
                </div>
              </div>
              <Button
                variant={theme === 'amoled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('amoled')}
              >
                {theme === 'amoled' ? 'Active' : 'Select'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>
              Set your preferred language and currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
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
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates and reminders
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
              <CardTitle>Authentication</CardTitle>
            </div>
            <CardDescription>
              Manage your account and sign-in settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-theme-bg border border-theme-border">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Signed in
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-theme-bg border border-theme-border">
                  <p className="text-sm text-theme-text">
                    You are not signed in. Sign in to sync your data across devices.
                  </p>
                </div>

                <Button className="w-full" onClick={() => router.push('/auth')}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Changes */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Reset to Defaults
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
