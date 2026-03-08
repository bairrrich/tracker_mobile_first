'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { SignInForm } from '@/components/auth/sign-in-form'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/components/auth/supabase-provider'

export default function AuthPage() {
  const { user, signOut } = useSupabase()
  const router = useRouter()
  const t = useTranslations('Auth')
  const [tab, setTab] = React.useState('signin')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('welcomeBack')}</CardTitle>
            <CardDescription>
              {t('signedInAs')} {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.push('/')} className="w-full">
              {t('goToDashboard')}
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              {t('signOut')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm onSuccess={() => router.push('/')} />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm onSuccess={() => setTab('signin')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
