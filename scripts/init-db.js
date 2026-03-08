/**
 * Database Initialization Script
 * 
 * Run with: node scripts/init-db.js
 */

const { initializeDatabase, closeDatabase } = require('../lib/db-server')

async function main() {
  console.log('🚀 Initializing database...')

  try {
    await initializeDatabase()
    console.log('✅ Database initialized successfully!')
    console.log('📁 Database file: tracker.db')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await closeDatabase()
    console.log('👋 Database connection closed')
  }
}

main()
