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

export async function GET(req: NextRequest) {
  try {
    if (clerkEnabled()) {
      const userId = getAuth(req).userId ?? null
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const q = (url.searchParams.get('q') || '').trim()
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where =
      q.length === 0
        ? {}
        : {
            OR: [
              { email: { contains: q, mode: 'insensitive' as const } },
              { emailNormalized: { contains: q.toLowerCase(), mode: 'insensitive' as const } },
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q, mode: 'insensitive' as const } },
            ],
          }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: [{ lastSeenAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
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
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
