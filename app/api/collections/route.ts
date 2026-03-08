import { NextRequest, NextResponse } from 'next/server'
import { collectionsRepository } from '@/lib/repositories/collections-repository'

/**
 * Collections API Endpoint
 * 
 * GET /api/collections - Get all collections
 * POST /api/collections - Create new collection
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as string | null

    let collections

    if (type) {
      collections = await collectionsRepository.getByType(type as any)
    } else {
      collections = await collectionsRepository.getAllWithCounts()
    }

    return NextResponse.json({
      success: true,
      data: collections,
    })
  } catch (error) {
    console.error('[Collections API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch collections',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, description, color, icon } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and type are required',
        },
        { status: 400 }
      )
    }

    // Create collection
    const id = await collectionsRepository.create({
      name,
      type,
      description: description || undefined,
      color: color || undefined,
      icon: icon || undefined,
    })

    const collection = await collectionsRepository.getById(id)

    return NextResponse.json(
      {
        success: true,
        data: collection,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Collections API] POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
