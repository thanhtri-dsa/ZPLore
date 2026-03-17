import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
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
    
    // Create the booking in your database
    const booking = await prisma.booking.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        numberOfGuests,
        bookingDate: bookingDate ? new Date(bookingDate) : null,
        specialRequests,
        destinationName,
        price: price ? parseFloat(price) : null,
        status: 'PENDING'
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