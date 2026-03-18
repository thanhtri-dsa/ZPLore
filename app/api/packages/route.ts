import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

type ItineraryLegInput = {
  order?: unknown
  mode?: unknown
  day?: unknown
  stopTitle?: unknown
  stopDesc?: unknown
  stopImage?: unknown
  mapsQuery?: unknown
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
  day: number
  stopTitle: string | null
  stopDesc: string | null
  stopImage: string | null
  mapsQuery: string | null
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
      const dayRaw = normalizeNumber(leg.day)
      const day = dayRaw && dayRaw > 0 ? Math.floor(dayRaw) : 1
      const distanceKm = normalizeNumber(leg.distanceKm)
      const fromLat = normalizeNumber(leg.fromLat)
      const fromLng = normalizeNumber(leg.fromLng)
      const toLat = normalizeNumber(leg.toLat)
      const toLng = normalizeNumber(leg.toLng)
      const mode = String(leg.mode ?? 'CAR').trim().toUpperCase() || 'CAR'
      const note = String(leg.note ?? '').trim()
      const stopTitle = String(leg.stopTitle ?? '').trim()
      const stopDesc = String(leg.stopDesc ?? '').trim()
      const stopImage = typeof leg.stopImage === 'string' ? leg.stopImage.trim() : ''
      const mapsQuery = String(leg.mapsQuery ?? '').trim()
      return {
        order: Math.max(0, Math.floor(order)),
        mode,
        day,
        stopTitle: stopTitle ? stopTitle : null,
        stopDesc: stopDesc ? stopDesc : null,
        stopImage: stopImage ? stopImage : null,
        mapsQuery: mapsQuery ? mapsQuery : null,
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

// Public GET endpoint - /api/packages
export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        location: true,
        imageData: true,
        duration: true,
        groupSize: true,
        price: true,
        description: true,
        included: true,
        itinerary: {
          orderBy: { order: 'asc' },
        },
        createdAt: true,
        updatedAt: true,
        authorId: true,
        authorName: true,
      },
    })
    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Protected POST endpoint - /api/packages
export async function POST(request: Request) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    let userId: string | null = null
    let authorName = 'Dev Admin'
    if (clerkEnabled) {
      const authRes = await auth()
      userId = authRes.userId ?? null
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      authorName = `${user.firstName} ${user.lastName}`.trim()
    } else {
      userId = 'dev-admin'
    }

    const { name, location, imageData, duration, groupSize, price, description, included, itinerary } = await request.json()

    if (!name || !location || !duration || !groupSize || !price || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Transform the included array into the correct format matching your schema
    const includedData = {
      create: included.map((item: string) => ({
        item: item // Changed from 'name' to 'item' to match your schema
      }))
    }

    const itineraryData = normalizeItinerary(itinerary)

    const newPackage = await prisma.package.create({
      data: {
        name,
        location,
        imageData,
        duration,
        groupSize,
        price: parseFloat(price),
        description,
        included: includedData,
        itinerary: itineraryData.length
          ? {
              create: itineraryData.map((leg) => ({
                order: leg.order,
                mode: leg.mode,
                day: leg.day,
                stopTitle: leg.stopTitle,
                stopDesc: leg.stopDesc,
                stopImage: leg.stopImage,
                mapsQuery: leg.mapsQuery,
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
        authorId: userId,
        authorName,
      },
      include: {
        included: true,
        itinerary: { orderBy: { order: 'asc' } },
      }
    })

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
