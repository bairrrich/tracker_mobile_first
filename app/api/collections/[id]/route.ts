import { NextRequest, NextResponse } from 'next/server'
import { collectionsRepository } from '@/lib/repositories/collections-repository'

/**
 * Collection by ID API Endpoint
 * 
 * GET /api/collections/[id] - Get collection by ID
 * PUT /api/collections/[id] - Update collection
 * DELETE /api/collections/[id] - Delete collection
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params

    if (!idParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid collection ID',
        },
        { status: 400 }
      )
    }

    const collection = await collectionsRepository.getById(idParam)

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          error: 'Collection not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: collection,
    })
  } catch (error) {
    console.error('[Collection API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params

    if (!idParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid collection ID',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, color, icon } = body

    await collectionsRepository.update(idParam, {
      name: name || undefined,
      description: description || undefined,
      color: color || undefined,
      icon: icon || undefined,
    })

    const collection = await collectionsRepository.getById(idParam)

    return NextResponse.json({
      success: true,
      data: collection,
    })
  } catch (error) {
    console.error('[Collection API] PUT error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params

    if (!idParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid collection ID',
        },
        { status: 400 }
      )
    }

    await collectionsRepository.delete(idParam)

    return NextResponse.json({
      success: true,
      message: 'Collection deleted',
    })
  } catch (error) {
    console.error('[Collection API] DELETE error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
