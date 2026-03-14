import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

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

    const { name, location, imageData, duration, groupSize, price, description, included } = await request.json()

    if (!name || !location || !duration || !groupSize || !price || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Transform the included array into the correct format matching your schema
    const includedData = {
      create: included.map((item: string) => ({
        item: item // Changed from 'name' to 'item' to match your schema
      }))
    }

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
        authorId: userId,
        authorName,
      },
      include: {
        included: true // Include the related items in the response
      }
    })

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
