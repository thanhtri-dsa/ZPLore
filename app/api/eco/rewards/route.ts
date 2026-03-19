import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const rewards = await prisma.ecoReward.findMany({
      where: { isActive: true },
      orderBy: { pointsRequired: 'asc' },
    })
    return NextResponse.json(rewards)
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
