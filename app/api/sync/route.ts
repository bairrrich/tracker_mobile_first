import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Sync API Endpoint
 *
 * Handles synchronization between local IndexedDB and Supabase
 */

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Table name mapping
const TABLE_MAPPING: Record<string, string> = {
  collections: 'collections',
  items: 'items',
  books: 'books',
  bookQuotes: 'book_quotes',
  metrics: 'metrics',
  history: 'history',
  tags: 'tags',
  itemTags: 'item_tags',
  notes: 'notes',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { changes = [], lastSync } = body

    console.log('[Sync API] Received changes:', changes.length)
    console.log('[Sync API] Last sync:', lastSync)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Sync API] Supabase not configured - running in local mode')
      return NextResponse.json({
        success: true,
        changes: [],
        processed: changes.map((c: any) => c.id),
        lastSync: new Date().toISOString(),
        warning: 'Supabase not configured',
      })
    }

    const supabase = getSupabaseClient()
    const processedIds: Array<{ localId: number; remoteId: string; recordId: string }> = []
    const errors: string[] = []

    // Process incoming changes
    for (const change of changes) {
      try {
        console.log(`[Sync API] Processing change:`, {
          id: change.id,
          table: change.table,
          recordId: change.recordId,
          operation: change.operation,
        })
        
        const tableName = TABLE_MAPPING[change.table]
        if (!tableName) {
          console.warn(`[Sync API] Unknown table: ${change.table}`)
          errors.push(`Unknown table: ${change.table}`)
          continue
        }

        // Parse data if it's a string
        let data = typeof change.data === 'string'
          ? JSON.parse(change.data)
          : change.data

        // Strip local-only fields and convert camelCase to snake_case
        const { createdAt, updatedAt, synced, ...syncData } = data
        const snakeCaseData: Record<string, any> = {}
        for (const [key, value] of Object.entries(syncData)) {
          // Convert camelCase to snake_case
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          snakeCaseData[snakeKey] = value
        }
        data = snakeCaseData

        console.log(`[Sync API] Processing change:`, {
          table: tableName,
          operation: change.operation,
          recordId: change.recordId,
          data,
        })

        // Get user ID from auth header or use anon
        const authHeader = request.headers.get('authorization')
        const userId = authHeader?.replace('Bearer ', '')

        switch (change.operation) {
          case 'insert':
            console.log(`[Sync API] Insert into ${tableName}:`, change.recordId)
            console.log(`[Sync API] Data from client:`, data)
            console.log(`[Sync API] ID from data:`, (data as any).id)
            
            const insertData = {
              ...data,
              user_id: userId || null,
              synced: true,
              updated_at: new Date().toISOString(),
            }
            
            // Use client-generated UUID - DON'T delete it!
            // The id field is already in data from the client
            
            const { data: insertResult, error: insertError } = await supabase
              .from(tableName)
              .insert(insertData)
              .select()
              .single()
            if (insertError) {
              // Handle duplicate key error - record already exists
              if (insertError.code === '23505') {
                console.log(`[Sync API] Record already exists, updating instead`)
                const { data: updateResult, error: updateError } = await supabase
                  .from(tableName)
                  .update({ ...insertData, updated_at: new Date().toISOString() })
                  .eq('id', (insertData as any).id)
                  .select()
                  .single()
                if (updateError) {
                  console.error(`[Sync API] Update error:`, updateError)
                  throw updateError
                }
                console.log(`[Sync API] Updated existing:`, updateResult.id)
                processedIds.push({
                  localId: change.id,
                  remoteId: updateResult.id,
                  recordId: change.recordId,
                })
                break
              }
              
              console.error(`[Sync API] Insert error:`, insertError)
              throw insertError
            }
            console.log(`[Sync API] Inserted with ID:`, insertResult.id)
            
            // Return mapping of local ID to remote ID
            processedIds.push({
              localId: change.id,  // syncQueue record ID
              remoteId: insertResult.id,  // Supabase ID (should match client ID)
              recordId: change.recordId,  // Book/Item record ID in IndexedDB
            })
            break

          case 'update':
            console.log(`[Sync API] Update ${tableName}:`, change.recordId)
            const updateData = {
              ...data,
              updated_at: new Date().toISOString(),
            }
            // Remove user_id from update to avoid changing ownership
            delete (updateData as any).user_id
            delete (updateData as any).id
            const { data: updateResult, error: updateError } = await supabase
              .from(tableName)
              .update(updateData)
              .eq('id', change.recordId)
              .select()
              .single()
            if (updateError) {
              console.error(`[Sync API] Update error:`, updateError)
              throw updateError
            }
            console.log(`[Sync API] Updated:`, updateResult)
            processedIds.push(change.id)
            break

          case 'delete':
            console.log(`[Sync API] Delete from ${tableName}:`, change.recordId)
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .eq('id', change.recordId)
            if (deleteError) {
              console.error(`[Sync API] Delete error:`, deleteError)
              throw deleteError
            }
            console.log(`[Sync API] Deleted`)
            processedIds.push(change.id)
            break

          default:
            console.warn(`[Sync API] Unknown operation: ${change.operation}`)
        }
      } catch (error) {
        console.error(`[Sync API] Error processing change:`, error)
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
        errors.push(errorMessage)
      }
    }

    // Get remote changes since lastSync
    const remoteChanges: Array<{
      table: string
      operation: string
      data: object
      id?: number
    }> = []

    // Fetch remote changes for each table
    const authHeader = request.headers.get('authorization')
    const userId = authHeader?.replace('Bearer ', '')

    if (userId) {
      for (const [localTable, remoteTable] of Object.entries(TABLE_MAPPING)) {
        try {
          const { data: records, error } = await supabase
            .from(remoteTable)
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', lastSync || '1970-01-01')
            .limit(100)

          if (error) {
            console.error(`[Sync API] Error fetching ${remoteTable}:`, error)
            continue
          }

          if (records && records.length > 0) {
            for (const record of records) {
              remoteChanges.push({
                table: localTable,
                operation: 'update',
                data: record,
                id: record.id,
              })
            }
          }
        } catch (error) {
          console.error(`[Sync API] Error fetching ${remoteTable}:`, error)
        }
      }
    }

    const response = {
      success: errors.length === 0,
      changes: remoteChanges,
      processed: processedIds.map(id => ({ id })),  // Return both id and recordId
      lastSync: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('[Sync API] Response:', response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Sync API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return sync status
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  })
}
