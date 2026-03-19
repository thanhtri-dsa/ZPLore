import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { violatorId, bookingId, description, proofImageData } = await request.json()
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const reporter = await prisma.customer.findUnique({
      where: { clerkUserId: userId },
    })

    if (!reporter) {
      return NextResponse.json({ error: 'Reporter not found' }, { status: 404 })
    }

    const report = await prisma.ecoReport.create({
      data: {
        reporterId: reporter.id,
        violatorId: violatorId || null,
        bookingId: bookingId || null,
        description,
        proofImageData: proofImageData || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ message: 'Report submitted successfully', reportId: report.id })
  } catch (error) {
    console.error('Report submission error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
