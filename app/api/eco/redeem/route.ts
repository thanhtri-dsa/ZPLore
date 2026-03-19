import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rewardId } = await request.json()
    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 })
    }

    // Use transaction to ensure point consistency
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { clerkUserId: userId },
      })

      if (!customer) {
        throw new Error('Customer not found')
      }

      const reward = await tx.ecoReward.findUnique({
        where: { id: rewardId },
      })

      if (!reward || !reward.isActive) {
        throw new Error('Reward not found or inactive')
      }

      if (reward.stock <= 0) {
        throw new Error('Out of stock')
      }

      if (customer.ecoPoints < reward.pointsRequired) {
        throw new Error('Insufficient points')
      }

      // 1. Update customer points
      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          ecoPoints: { decrement: reward.pointsRequired },
        },
      })

      // 2. Decrement stock
      await tx.ecoReward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } },
      })

      // 3. Log the action
      await tx.ecoPointLog.create({
        data: {
          customerId: customer.id,
          actionType: 'SPEND_REDEEM',
          pointsChange: -reward.pointsRequired,
          rewardId: reward.id,
          description: `Redeemed reward: ${reward.title}`,
        },
      })

      return updatedCustomer
    })

    return NextResponse.json({ message: 'Redeemed successfully', ecoPoints: result.ecoPoints })
  } catch (error) {
    console.error('Redemption error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 400 })
  }
}
