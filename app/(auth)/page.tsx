'use client'

import * as React from 'react'
import { SignInForm } from '@/components/auth/sign-in-form'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/components/auth/supabase-provider'

export default function AuthPage() {
  const { user, signOut } = useSupabase()
  const [tab, setTab] = React.useState('signin')

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>
              You are signed in as {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signOut()} variant="outline" className="w-full">
              Sign Out
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
          <CardTitle className="text-2xl">All Tracker Mobile</CardTitle>
          <CardDescription>
            Sign in to sync your data across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm onSuccess={() => console.log('Signed in!')} />
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
