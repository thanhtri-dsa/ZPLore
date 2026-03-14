import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

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
    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        tags,
        imageData,
        description,
        daysNights: parseInt(daysNights),
        tourType,
      },
    })

    return NextResponse.json(destination)
  } catch (error) {
    console.error('Error creating destination:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
