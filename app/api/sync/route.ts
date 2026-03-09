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

/**
 * Get user ID from auth header
 */
async function getUserIdFromHeader(authHeader: string | null): Promise<string | null> {
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Use service role client to get user from token
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    console.error('[Sync API] Failed to get user from token:', error)
    return null
  }
  
  return user.id
}

// Table name mapping
const TABLE_MAPPING: Record<string, string> = {
  collections: 'collections',
  items: 'items',
  books: 'books',
  book_quotes: 'book_quotes',
  metrics: 'metrics',
  history: 'history',
  tags: 'tags',
  item_tags: 'item_tags',
  notes: 'notes',
  // Exercise & Workout tables
  workout_types: 'workout_types',
  exercise_categories: 'exercise_categories',
  exercises: 'exercises',
  workouts: 'workouts',
  workout_exercises: 'workout_exercises',
  workout_sets: 'workout_sets',
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
    const processedIds: Array<{ localId: string; remoteId: string; recordId: string }> = []
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

        // Get user ID from auth header
        const authHeader = request.headers.get('authorization')
        const userId = await getUserIdFromHeader(authHeader)

        switch (change.operation) {
          case 'insert':
            console.log(`[Sync API] Insert into ${tableName}:`, change.recordId)
            console.log(`[Sync API] Data from client:`, data)
            console.log(`[Sync API] ID from data:`, (data as any).id)

            // Ensure the ID in data matches recordId
            if ((data as any).id !== change.recordId) {
              console.warn(`[Sync API] ID mismatch! data.id: ${(data as any).id}, recordId: ${change.recordId}`)
              // Use recordId as the authoritative ID
              data.id = change.recordId
            }

            const insertData = {
              ...data,
              user_id: userId || null,
              synced: true,
              updated_at: new Date().toISOString(),
            }

            console.log(`[Sync API] Final insertData.id:`, insertData.id)

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
            
            // First, check if the record exists and if it's deleted on the server
            const { data: existingRecord } = await supabase
              .from(tableName)
              .select('id, deleted, deleted_at, updated_at')
              .eq('id', change.recordId)
              .single()

            // Conflict resolution: if server has tombstone but client is updating
            if (existingRecord?.deleted) {
              console.log(`[Sync API] Conflict: Record ${change.recordId} is deleted on server but updated on client`)
              // Delete wins - reject the update and keep tombstone
              processedIds.push({
                localId: change.id,
                remoteId: change.recordId,
                recordId: change.recordId,
              })
              break
            }

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
            processedIds.push({
              localId: change.id,  // syncQueue record ID
              remoteId: change.recordId,  // Same as recordId for updates
              recordId: change.recordId,  // Book/Item record ID
            })
            break

          case 'delete':
            console.log(`[Sync API] Delete from ${tableName}:`, change.recordId)
            
            // Soft delete: mark as deleted instead of physical delete
            const { data: deleteResult, error: deleteError } = await supabase
              .from(tableName)
              .update({
                deleted: true,
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', change.recordId)
              .select()
              .single()
            
            if (deleteError) {
              // If record doesn't exist, that's ok - it was already deleted
              if (deleteError.code === 'PGRST116') {
                console.log(`[Sync API] Record ${change.recordId} not found (already deleted?)`)
              } else {
                console.error(`[Sync API] Delete error:`, deleteError)
                throw deleteError
              }
            } else {
              console.log(`[Sync API] Soft deleted:`, deleteResult)
            }
            
            processedIds.push({
              localId: change.id,  // syncQueue record ID
              remoteId: change.recordId,  // Same as recordId for deletes
              recordId: change.recordId,  // Book/Item record ID
            })
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
    // This includes both updates AND tombstones (soft deletes)
    const remoteChanges: Array<{
      table: string
      operation: string
      data: object
      id?: string  // UUID string
      recordId?: string  // UUID string
    }> = []

    // Fetch remote changes for each table
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromHeader(authHeader)

    if (userId) {
      for (const [localTable, remoteTable] of Object.entries(TABLE_MAPPING)) {
        try {
          // Fetch records updated/changed since last sync
          // This includes both regular updates and tombstones (deleted=true)
          const { data: records, error } = await supabase
            .from(remoteTable)
            .select('*')
            .eq('user_id', userId)
            .or(`updated_at.gt.${lastSync || '1970-01-01'},deleted_at.gt.${lastSync || '1970-01-01'}`)
            .limit(100)

          if (error) {
            console.error(`[Sync API] Error fetching ${remoteTable}:`, error)
            continue
          }

          if (records && records.length > 0) {
            for (const record of records) {
              // Determine operation based on deleted flag
              const operation = record.deleted ? 'delete' : 'update'

              remoteChanges.push({
                table: localTable,
                operation,
                data: record,
                id: record.id,
                recordId: record.id,  // Use record.id as recordId for remote changes
              })

              console.log(`[Sync API] Remote change: ${operation} ${localTable}/${record.id}`)
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
      processed: processedIds,  // Return the full objects with localId, remoteId, recordId
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
