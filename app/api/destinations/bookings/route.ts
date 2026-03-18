import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length ? digits : null
}

export async function POST(request: NextRequest) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    let clerkUserId: string | null = null
    if (clerkEnabled) {
      try {
        clerkUserId = getAuth(request).userId
      } catch {
        clerkUserId = null
      }
    }

    const { 
      firstname,
      lastname,
      email,
      phone,
      numberOfGuests,
      bookingDate,
      specialRequests,
      destinationName,
      price
    } = await request.json()
    
    // Validate required fields
    if (!firstname || !lastname || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailNormalized = normalizeEmail(email)
    const phoneNormalized = normalizePhone(phone)
    const fullName = `${firstname} ${lastname}`.trim()

    const customer = await prisma.customer.upsert({
      where: { emailNormalized },
      create: {
        email,
        emailNormalized,
        phone,
        phoneNormalized,
        firstName: firstname,
        lastName: lastname,
        fullName,
        lastSeenAt: new Date(),
      },
      update: {
        email,
        phone,
        phoneNormalized,
        firstName: firstname,
        lastName: lastname,
        fullName,
        lastSeenAt: new Date(),
      },
      select: { id: true },
    })
    
    // Create the booking in your database
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        userId: clerkUserId,
        firstname,
        lastname,
        email,
        phone,
        numberOfGuests,
        bookingDate: bookingDate ? new Date(bookingDate) : null,
        specialRequests,
        destinationName,
        price: price ? parseFloat(price) : null,
        status: 'PENDING',
        statusV2: 'PENDING',
      },
    })
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
