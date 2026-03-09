# Supabase Setup Instructions

## Automatic Setup

Run the initialization script:

```bash
node scripts/init-supabase.js
```

## Manual Setup

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration**
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL editor
   - Click "Run"

4. **Verify Tables**
   - Go to "Table Editor"
   - You should see all tables:
     - collections
     - items
     - books
     - book_quotes
     - metrics
     - history
     - tags
     - item_tags
     - notes
     - sync_queue

## Test Connection

After setup, test the connection:

```bash
curl https://fjivflktqbuwqghfklqf.supabase.co/rest/v1/collections \
  -H "apikey: eyJhbGciOiJIUzI1NiIs..." \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fjivflktqbuwqghfklqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Troubleshooting

### "permission denied for table"
- Check that RLS policies are set up correctly
- Make sure you're using the correct API key

### "relation does not exist"
- Run the migration script
- Check that all tables were created

### "JWT expired"
- Regenerate your API keys in Supabase dashboard
- Update `.env.local` and restart the dev server
