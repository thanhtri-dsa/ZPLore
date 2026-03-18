import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function clerkEnabled() {
  return (
    !!process.env.CLERK_SECRET_KEY?.trim() &&
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
    (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')
  )
}

export async function GET() {
  try {
    if (!clerkEnabled()) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const authRes = await auth()
    if (!authRes.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await currentUser()
    const email =
      user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      ''

    if (!email) return NextResponse.json({ trips: [] })

    const trips = await prisma.aIPlannerBooking.findMany({
      where: {
        publicToken: { not: null },
        email: { equals: email, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        publicToken: true,
        startLocation: true,
        endLocation: true,
        transportMode: true,
        distanceKm: true,
        co2Kg: true,
        bookingDate: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      trips: trips.map((t) => ({
        token: t.publicToken,
        startLocation: t.startLocation,
        endLocation: t.endLocation,
        transportMode: t.transportMode,
        distanceKm: t.distanceKm,
        co2Kg: t.co2Kg,
        bookingDate: t.bookingDate,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching my trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

