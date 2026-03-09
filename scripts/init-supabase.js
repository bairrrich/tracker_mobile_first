#!/usr/bin/env node

/**
 * Initialize Supabase Database
 * 
 * This script runs the SQL migrations to set up your Supabase database.
 * 
 * Usage:
 *   node scripts/init-supabase.js
 */

const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
      process.env[key.trim()] = value
    }
  })
  console.log('✅ Loaded environment from:', envPath)
  console.log('')
}

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('')
  console.error('Please add these to your .env.local file:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('')
  process.exit(1)
}

console.log('🔧 Initializing Supabase database...')
console.log('')
console.log('Supabase URL:', supabaseUrl)
console.log('')

// Read SQL migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath)
  console.error('')
  console.error('Please ensure the SQL migration file exists.')
  process.exit(1)
}

const sql = fs.readFileSync(migrationPath, 'utf-8')

console.log('✅ Migration file found:')
console.log('   ', migrationPath)
console.log('')
console.log('📋 Next steps:')
console.log('')
console.log('1. Go to your Supabase project dashboard:')
console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('https://')[1])
console.log('')
console.log('2. Go to SQL Editor')
console.log('')
console.log('3. Copy and paste the contents of the migration file:')
console.log('   ' + migrationPath)
console.log('')
console.log('4. Run the SQL script')
console.log('')
console.log('Alternatively, you can use the Supabase CLI:')
console.log('   supabase db push')
console.log('')
console.log('✅ Setup complete!')
console.log('')

// Write instructions file
const instructionsPath = path.join(__dirname, '..', 'SUPABASE_SETUP.md')
const instructions = `# Supabase Setup Instructions

## Automatic Setup

Run the initialization script:

\`\`\`bash
node scripts/init-supabase.js
\`\`\`

## Manual Setup

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration**
   - Copy the contents of \`supabase/migrations/001_initial_schema.sql\`
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

\`\`\`bash
curl https://fjivflktqbuwqghfklqf.supabase.co/rest/v1/collections \\
  -H "apikey: ${supabaseKey.substring(0, 20)}..." \\
  -H "Authorization: Bearer ${supabaseKey.substring(0, 20)}..."
\`\`\`

## Environment Variables

Make sure these are set in \`.env.local\`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=${supabaseKey.substring(0, 20)}...
\`\`\`

## Troubleshooting

### "permission denied for table"
- Check that RLS policies are set up correctly
- Make sure you're using the correct API key

### "relation does not exist"
- Run the migration script
- Check that all tables were created

### "JWT expired"
- Regenerate your API keys in Supabase dashboard
- Update \`.env.local\` and restart the dev server
`

fs.writeFileSync(instructionsPath, instructions)

console.log('📄 Instructions written to:', instructionsPath)
console.log('')
