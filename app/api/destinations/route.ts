import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean)
  return []
}

function serializeTags(tags: unknown): string {
  return normalizeTags(tags).join(',')
}

export async function GET(request: Request) {
  // Remove authentication for GET request to allow public access to destinations
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')

  try {
    let destinations
    if (country) {
      destinations = await prisma.destination.findMany({
        where: {
          country
        }
      })
      if (destinations.length === 0) {
        const all = await prisma.destination.findMany()
        destinations = all.filter((d) => d.country.toLowerCase() === country.toLowerCase())
      }
    } else {
      destinations = await prisma.destination.findMany()
    }
    const normalized = destinations.map((d) => ({
      ...d,
      tags: normalizeTags(d.tags),
    }))
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    if (clerkEnabled) {
      const authRes = await auth()
      if (!authRes.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const {
      name,
      country,
      city,
      amount,
      tags,
      imageData,
      description,
      daysNights,
      tourType
    } = await request.json()

    if (!name || !country || !city || !amount || !description || !daysNights || !tourType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const destination = await prisma.destination.create({
      data: {
        name,
        country,
        city,
        amount: parseFloat(amount),
        tags: serializeTags(tags),
        imageData,
        description,
        daysNights: parseInt(daysNights),
        tourType,
      },
    })

    return NextResponse.json({ ...destination, tags: normalizeTags(destination.tags) })
  } catch (error) {
    console.error('Error creating destination:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
