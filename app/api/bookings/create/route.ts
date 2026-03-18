import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length ? digits : null
}

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();
    
    // Validate required fields
    const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'numberOfGuests'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(bookingData.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate number of guests
    if (bookingData.numberOfGuests < 1) {
      return NextResponse.json(
        { error: 'Number of guests must be at least 1' },
        { status: 400 }
      );
    }

    // Create the booking without requiring user authentication
    const emailNormalized = normalizeEmail(bookingData.email)
    const phoneNormalized = normalizePhone(bookingData.phone)
    const fullName = `${bookingData.firstname} ${bookingData.lastname}`.trim()

    const customer = await prisma.customer.upsert({
      where: { emailNormalized },
      create: {
        email: bookingData.email,
        emailNormalized,
        phone: bookingData.phone,
        phoneNormalized,
        country: bookingData.country || null,
        firstName: bookingData.firstname,
        lastName: bookingData.lastname,
        fullName,
        lastSeenAt: new Date(),
      },
      update: {
        email: bookingData.email,
        phone: bookingData.phone,
        phoneNormalized,
        country: bookingData.country || null,
        firstName: bookingData.firstname,
        lastName: bookingData.lastname,
        fullName,
        lastSeenAt: new Date(),
      },
      select: { id: true },
    })

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        firstname: bookingData.firstname,
        lastname: bookingData.lastname,
        email: bookingData.email,
        phone: bookingData.phone,
        status: 'PENDING',
        numberOfGuests: bookingData.numberOfGuests,
        bookingDate: bookingData.bookingDate ? new Date(bookingData.bookingDate) : null,
        specialRequests: bookingData.specialRequests || null,
        destinationName: bookingData.destinationName || null,
        price: bookingData.price ? parseFloat(bookingData.price.toString()) : null,
        country: bookingData.country || null,
      },
    });

    // Optional: Send confirmation email to the customer
    // await sendConfirmationEmail(booking);

    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Error creating booking' },
      { status: 500 }
    );
  }
}

