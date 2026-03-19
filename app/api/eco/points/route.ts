import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { clerkUserId: userId },
      include: {
        pointLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { reward: true },
        },
      },
    })

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
