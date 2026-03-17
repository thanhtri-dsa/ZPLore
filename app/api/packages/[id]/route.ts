import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type ItineraryLegInput = {
  order?: unknown
  mode?: unknown
  fromName?: unknown
  toName?: unknown
  distanceKm?: unknown
  fromLat?: unknown
  fromLng?: unknown
  toLat?: unknown
  toLng?: unknown
  note?: unknown
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function normalizeItinerary(raw: unknown): Array<{
  order: number
  mode: string
  fromName: string
  toName: string
  distanceKm: number | null
  fromLat: number | null
  fromLng: number | null
  toLat: number | null
  toLng: number | null
  note: string | null
}> {
  if (!Array.isArray(raw)) return []
  return raw
    .map((l, idx) => {
      const leg = (l ?? {}) as ItineraryLegInput
      const fromName = String(leg.fromName ?? '').trim()
      const toName = String(leg.toName ?? '').trim()
      if (!fromName || !toName) return null
      const order = normalizeNumber(leg.order) ?? idx
      const distanceKm = normalizeNumber(leg.distanceKm)
      const fromLat = normalizeNumber(leg.fromLat)
      const fromLng = normalizeNumber(leg.fromLng)
      const toLat = normalizeNumber(leg.toLat)
      const toLng = normalizeNumber(leg.toLng)
      const mode = String(leg.mode ?? 'CAR').trim().toUpperCase() || 'CAR'
      const note = String(leg.note ?? '').trim()
      return {
        order: Math.max(0, Math.floor(order)),
        mode,
        fromName,
        toName,
        distanceKm,
        fromLat,
        fromLng,
        toLat,
        toLng,
        note: note ? note : null,
      }
    })
    .filter((v): v is NonNullable<typeof v> => v != null)
    .sort((a, b) => a.order - b.order)
    .map((leg, idx) => ({ ...leg, order: idx }))
}

// Public GET endpoint - /api/packages/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        included: true,
        itinerary: { orderBy: { order: 'asc' } },
      }
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Protected PUT endpoint - /api/packages/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    let userId: string | null = null
    if (clerkEnabled) {
      const authRes = await auth()
      userId = authRes.userId ?? null
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      userId = 'dev-admin'
    }

    const id = params.id
    const { name, location, imageData, duration, groupSize, price, description, included, itinerary } = await request.json()

    if (!name || !location || !duration || !groupSize || !price || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        included: true
      }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (clerkEnabled && existingPackage.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // First delete all existing included items and itinerary legs
    await prisma.included.deleteMany({
      where: {
        packageId: id
      }
    })
    await prisma.packageItineraryLeg.deleteMany({
      where: {
        packageId: id
      }
    })

    const itineraryData = normalizeItinerary(itinerary)

    // Update package with new data
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name,
        location,
        imageData,
        duration: duration.toString(),
        groupSize: groupSize.toString(),
        price: parseFloat(price.toString()),
        description,
        included: {
          create: included.map((item: string) => ({
            item: item
          }))
        },
        itinerary: itineraryData.length
          ? {
              create: itineraryData.map((leg) => ({
                order: leg.order,
                mode: leg.mode,
                fromName: leg.fromName,
                toName: leg.toName,
                distanceKm: leg.distanceKm,
                fromLat: leg.fromLat,
                fromLng: leg.fromLng,
                toLat: leg.toLat,
                toLng: leg.toLng,
                note: leg.note,
              })),
            }
          : undefined,
      },
      include: {
        included: true,
        itinerary: { orderBy: { order: 'asc' } },
      }
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Protected DELETE endpoint - /api/packages/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    let userId: string | null = null
    if (clerkEnabled) {
      const authRes = await auth()
      userId = authRes.userId ?? null
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      userId = 'dev-admin'
    }

    const id = params.id

    const existingPackage = await prisma.package.findUnique({
      where: { id },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (clerkEnabled && existingPackage.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the included items first (due to foreign key constraint)
    await prisma.included.deleteMany({
      where: {
        packageId: id
      }
    })
    await prisma.packageItineraryLeg.deleteMany({
      where: {
        packageId: id
      }
    })

    // Then delete the package
    await prisma.package.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
