import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function clerkEnabled() {
  return (
    !!process.env.CLERK_SECRET_KEY?.trim() &&
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
    (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')
  )
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (clerkEnabled()) {
      const userId = getAuth(req).userId ?? null
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        clerkUserId: true,
        firstName: true,
        lastName: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { bookings: true, aiPlannerBookings: true, packageBookings: true } },
      },
    })

    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [bookings, aiPlannerBookings, packageBookings] = await Promise.all([
      prisma.booking.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          status: true,
          destinationName: true,
          price: true,
          bookingDate: true,
          numberOfGuests: true,
          createdAt: true,
        },
      }),
      prisma.aIPlannerBooking.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          status: true,
          startLocation: true,
          endLocation: true,
          transportMode: true,
          distanceKm: true,
          co2Kg: true,
          bookingDate: true,
          numberOfGuests: true,
          createdAt: true,
        },
      }),
      prisma.packageBooking.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          status: true,
          packageId: true,
          price: true,
          bookingDate: true,
          numberOfGuests: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({ customer, bookings, aiPlannerBookings, packageBookings })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}
