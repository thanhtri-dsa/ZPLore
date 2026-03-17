import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean)
  return []
}

function serializeTags(tags: unknown): string {
  return normalizeTags(tags).join(',')
}

// Public GET endpoint - /api/destinations/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const destination = await prisma.destination.findUnique({
      where: { id },
    })

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    return NextResponse.json({ ...destination, tags: normalizeTags(destination.tags) })
  } catch (error) {
    console.error('Error fetching destination:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Protected PUT endpoint - /api/destinations/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    if (clerkEnabled) {
      const authRes = await auth()
      if (!authRes.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const id = params.id
    const { name, country, city, amount, tags, imageData, description, daysNights, tourType } = await request.json()

    if (!name || !country || !city || !amount || !description || !daysNights || !tourType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingDestination = await prisma.destination.findUnique({
      where: { id },
    })

    if (!existingDestination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const updatedDestination = await prisma.destination.update({
      where: { id },
      data: {
        name,
        country,
        city,
        amount: parseFloat(amount),
        tags: serializeTags(tags),
        imageData,
        description,
        daysNights: parseInt(daysNights),
        tourType,
      },
    })

    return NextResponse.json({ ...updatedDestination, tags: normalizeTags(updatedDestination.tags) })
  } catch (error) {
    console.error('Error updating destination:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Protected DELETE endpoint - /api/destinations/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    if (clerkEnabled) {
      const authRes = await auth()
      if (!authRes.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const id = params.id

    const existingDestination = await prisma.destination.findUnique({
      where: { id },
    })

    if (!existingDestination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    await prisma.destination.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Destination deleted successfully' })
  } catch (error) {
    console.error('Error deleting destination:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

