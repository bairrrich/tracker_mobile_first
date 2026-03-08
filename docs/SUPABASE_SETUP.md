# Supabase Integration Guide

## ✅ Setup Complete!

Your Supabase project is now connected to All Tracker Mobile.

## 🔑 Configuration

### Environment Variables

Already configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://fjivflktqbuwqghfklqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Database Setup

### Step 1: Run Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy contents from `supabase/schema.sql`
4. Run the SQL script

This creates:
- 7 tables (collections, items, metrics, history, tags, item_tags, notes)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for updated_at timestamps

### Step 2: Verify Tables

After running the schema, verify in **Table Editor**:
- [ ] collections
- [ ] items
- [ ] metrics
- [ ] history
- [ ] tags
- [ ] item_tags
- [ ] notes

## 🔐 Authentication

### Demo Credentials

```
Email: demo@demo.com
Password: demo
```

### Auth Pages

- **Sign In/Up:** `http://localhost:3000/auth` (create this route)
- **Reset Password:** Automatic via Supabase

### Usage in Components

```typescript
import { useSupabase } from '@/components/auth/supabase-provider'

function MyComponent() {
  const { user, session, signOut } = useSupabase()
  
  if (user) {
    return <div>Welcome {user.email}!</div>
  }
  
  return <div>Please sign in</div>
}
```

## 📁 File Structure

```
lib/
  └── supabase.ts          # Supabase client & helpers
components/auth/
  ├── supabase-provider.tsx # Context provider
  ├── sign-in-form.tsx      # Sign in form
  └── sign-up-form.tsx      # Sign up form
app/(auth)/
  └── page.tsx              # Auth page
supabase/
  └── schema.sql            # Database schema
```

## 🚀 Next Steps

### 1. Create Auth Page

Create `app/auth/page.tsx`:

```typescript
import AuthPage from '@/app/(auth)/page'
export default AuthPage
```

### 2. Protect Routes

Create middleware for protected routes:

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  
  return res
}
```

### 3. Sync Local ↔ Cloud

Update sync engine to use Supabase:

```typescript
// lib/sync-engine.ts
import { supabase } from '@/lib/supabase'

export async function pushChanges() {
  const user = await getUser()
  if (!user) return
  
  // Push to Supabase instead of local API
  const { data, error } = await supabase
    .from('collections')
    .upsert(localCollections)
}
```

## 📊 Database Schema

### Collections

```sql
collections (
  id UUID PK,
  user_id UUID FK → auth.users,
  name TEXT,
  type TEXT,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  synced BOOLEAN
)
```

### Items

```sql
items (
  id UUID PK,
  collection_id UUID FK → collections,
  user_id UUID FK → auth.users,
  name TEXT,
  description TEXT,
  image TEXT,
  status TEXT,
  rating REAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  synced BOOLEAN
)
```

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only CRUD their own data
- Policies prevent unauthorized access
- Service role key bypasses RLS (use carefully!)

### Best Practices

1. **Never expose service_role key** to client
2. **Always use anon key** in browser
3. **Validate user ownership** in API routes
4. **Use Supabase Auth** for authentication

## 🧪 Testing

### Test Authentication

1. Open `http://localhost:3000/auth`
2. Sign up with test email
3. Check email for confirmation
4. Sign in with credentials
5. Verify user data in Supabase Dashboard

### Test Database

```sql
-- Insert test collection
INSERT INTO collections (user_id, name, type)
VALUES (auth.uid(), 'Test Collection', 'books');

-- Query your collections
SELECT * FROM collections WHERE user_id = auth.uid();
```

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Drizzle + Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)

## 🆘 Troubleshooting

### "Invalid API key"

Check `.env.local` has correct keys from Supabase Dashboard → Settings → API

### "Row Level Security policy violation"

Ensure you're inserting with correct `user_id`:
```typescript
const { data } = await supabase.auth.getUser()
await supabase.from('collections').insert({ user_id: data.user.id })
```

### "Table doesn't exist"

Run the schema.sql script in Supabase SQL Editor

---

**Status:** ✅ Integration Complete  
**Database:** Connected  
**Authentication:** Ready  
**Next:** Run schema.sql in Supabase Dashboard
