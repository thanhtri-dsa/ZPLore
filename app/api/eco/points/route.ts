import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

// Route này phụ thuộc `auth()` (dùng headers) nên cần luôn chạy dynamic.
export const dynamic = 'force-dynamic'

async function resolveCustomerByAuthUser(userId: string) {
  let customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    include: {
      pointLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { reward: true },
      },
    },
  })
  if (customer) return customer

  // Auto-link existing customer by Clerk primary email.
  const cu = await currentUser().catch(() => null)
  const primaryEmail =
    cu?.emailAddresses?.find((e) => e.id === cu.primaryEmailAddressId)?.emailAddress ||
    cu?.emailAddresses?.[0]?.emailAddress ||
    null
  if (!primaryEmail) return null
  const emailNormalized = primaryEmail.trim().toLowerCase()

  customer = await prisma.customer.findUnique({
    where: { emailNormalized },
    include: {
      pointLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { reward: true },
      },
    },
  })

  if (customer) {
    if (!customer.clerkUserId) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { clerkUserId: userId, lastSeenAt: new Date(), email: primaryEmail },
        include: {
          pointLogs: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { reward: true },
          },
        },
      })
    }
    return customer
  }

  // Create minimal profile when first-time signed-in user has no booking record yet.
  const name = `${cu?.firstName ?? ''} ${cu?.lastName ?? ''}`.trim()
  return prisma.customer.create({
    data: {
      clerkUserId: userId,
      email: primaryEmail,
      emailNormalized,
      firstName: cu?.firstName ?? null,
      lastName: cu?.lastName ?? null,
      fullName: name || null,
      lastSeenAt: new Date(),
      ecoPoints: 0,
    },
    include: {
      pointLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { reward: true },
      },
    },
  })
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await resolveCustomerByAuthUser(userId)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      ecoPoints: customer.ecoPoints,
      pointLogs: customer.pointLogs,
    })
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
