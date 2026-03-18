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

    if (!email) return NextResponse.json({ destinationBookings: [], packageBookings: [] })

    const [destinationBookings, packageBookings] = await Promise.all([
      prisma.booking.findMany({
        where: { email: { equals: email, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          status: true,
          destinationName: true,
          bookingDate: true,
          numberOfGuests: true,
          price: true,
          createdAt: true,
        },
      }),
      prisma.packageBooking.findMany({
        where: { email: { equals: email, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          status: true,
          bookingDate: true,
          numberOfGuests: true,
          price: true,
          createdAt: true,
          packageId: true,
          package: { select: { name: true, location: true } },
        },
      }),
    ])

    return NextResponse.json({
      destinationBookings: destinationBookings.map((b) => ({
        id: b.id,
        status: b.status,
        destinationName: b.destinationName,
        bookingDate: b.bookingDate,
        numberOfGuests: b.numberOfGuests,
        price: b.price,
        createdAt: b.createdAt,
      })),
      packageBookings: packageBookings.map((b) => ({
        id: b.id,
        status: b.status,
        bookingDate: b.bookingDate,
        numberOfGuests: b.numberOfGuests,
        price: b.price,
        createdAt: b.createdAt,
        packageId: b.packageId,
        packageName: b.package?.name ?? null,
        packageLocation: b.package?.location ?? null,
      })),
    })
  } catch (error) {
    console.error('Error fetching my bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

