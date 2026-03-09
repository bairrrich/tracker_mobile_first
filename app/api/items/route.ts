import { NextRequest, NextResponse } from 'next/server'
import { itemsRepository } from '@/lib/repositories/items-repository'

/**
 * Items API Endpoint
 * 
 * GET /api/items - Get items (optionally by collection)
 * POST /api/items - Create new item
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const collectionId = searchParams.get('collectionId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let items

    if (collectionId) {
      if (status) {
        items = await itemsRepository.getByCollectionAndStatus(collectionId, status as any)
      } else {
        items = await itemsRepository.getByCollection(collectionId)
      }
    } else if (search) {
      items = await itemsRepository.search(search)
    } else {
      items = await itemsRepository.getAll()
    }

    return NextResponse.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('[Items API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collectionId, name, description, image, status, rating } = body

    // Validate required fields
    if (!collectionId || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Collection ID and name are required',
        },
        { status: 400 }
      )
    }

    // Create item
    const id = await itemsRepository.create({
      collectionId,  // Already UUID string
      name,
      description: description || undefined,
      image: image || undefined,
      status: status || 'active',
      rating: rating ? parseFloat(rating) : undefined,
    })

    const item = await itemsRepository.getById(id)

    return NextResponse.json(
      {
        success: true,
        data: item,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Items API] POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
