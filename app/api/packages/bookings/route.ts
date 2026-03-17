import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'] as const
type BookingStatus = typeof BOOKING_STATUSES[number]

function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && (BOOKING_STATUSES as readonly string[]).includes(value)
}

// GET endpoint - Protected with Clerk authentication
export async function GET(req: NextRequest) {
  console.log('GET request received'); // Debug log
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    if (clerkEnabled) {
      let userId: string | null = null
      try {
        userId = getAuth(req).userId
      } catch {
        userId = null
      }

      if (!userId) {
        console.log('Unauthorized access attempt'); // Debug log
        return NextResponse.json(
          { error: 'Unauthorized - Please login to access bookings' },
          { status: 401 }
        );
      }
    }

    // Parse query parameters
    const url = req.nextUrl;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status');

    console.log('Query parameters:', { page, limit, status }); // Debug log

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: { status?: BookingStatus } = {};
    if (isBookingStatus(status)) {
      where.status = status;
    }

    // Fetch bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          country: true,
          status: true,
          bookingDate: true,
          numberOfGuests: true,
          specialRequests: true,
          destinationName: true,
          price: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    console.log(`Found ${bookings.length} bookings`); // Debug log

    // Return bookings and pagination metadata
    return NextResponse.json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST endpoint - Create booking (no authentication required)
export async function POST(req: NextRequest) {
  console.log('POST request received'); // Debug log
  try {
    const bookingData = await req.json();
    console.log('Received booking data:', bookingData); // Debug log
    
    // Validate required fields
    const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'numberOfGuests', 'destinationName'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        console.log(`Missing required field: ${field}`); // Debug log
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      console.log('Invalid email format'); // Debug log
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(bookingData.phone)) {
      console.log('Invalid phone number format'); // Debug log
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate number of guests
    if (bookingData.numberOfGuests < 1) {
      console.log('Invalid number of guests'); // Debug log
      return NextResponse.json(
        { error: 'Number of guests must be at least 1' },
        { status: 400 }
      );
    }

    // Create the booking without requiring user authentication
    const booking = await prisma.booking.create({
      data: {
        firstname: bookingData.firstname,
        lastname: bookingData.lastname,
        email: bookingData.email,
        phone: bookingData.phone,
        country: bookingData.country || null,
        status: 'PENDING',
        numberOfGuests: bookingData.numberOfGuests,
        bookingDate: bookingData.bookingDate ? new Date(bookingData.bookingDate) : null,
        specialRequests: bookingData.specialRequests || null,
        destinationName: bookingData.destinationName,
        price: bookingData.price ? parseFloat(bookingData.price.toString()) : null,
      },
    });

    console.log('Booking created:', booking); // Debug log

    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Error creating booking', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT endpoint - Update booking status (authenticated)
export async function PUT(req: NextRequest) {
  console.log('PUT request received'); // Debug log
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    if (clerkEnabled) {
      let userId: string | null = null
      try {
        userId = getAuth(req).userId
      } catch {
        userId = null
      }

      if (!userId) {
        console.log('Unauthorized access attempt'); // Debug log
        return NextResponse.json(
          { error: 'Unauthorized - Please login to update bookings' },
          { status: 401 }
        );
      }
    }

    // Parse booking ID and updated data from request
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    const body = await req.json();
    console.log('Received PUT request:', { id, body }); // Debug log

    if (!id) {
      console.log('Missing booking ID'); // Debug log
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!isBookingStatus(body.status)) {
      console.log('Invalid status value:', body.status); // Debug log
      return NextResponse.json(
        { error: 'Invalid or missing status value' },
        { status: 400 }
      );
    }

    // Update the booking status
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
    });

    console.log('Updated booking:', booking); // Debug log

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
