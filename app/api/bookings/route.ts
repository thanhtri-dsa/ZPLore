// Import necessary modules from Next.js, Prisma, and Clerk
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import crypto from 'crypto'

const prisma = new PrismaClient();

const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CONFIRMED', 'CANCELLED'] as const
type BookingStatus = typeof BOOKING_STATUSES[number]

function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && (BOOKING_STATUSES as readonly string[]).includes(value)
}

function expectedAdminCookieValue() {
  const secret = (process.env.ADMIN_TOOL_SECRET || process.env.ADMIN_TOOL_PASSWORD || '').trim()
  return crypto.createHmac('sha256', secret).update('ecoTourAdmin.v1').digest('hex')
}

function isValidAdminCookie(req: NextRequest) {
  const cookie = req.cookies.get('ecoTourAdmin')?.value
  return !!cookie && cookie === expectedAdminCookieValue()
}

// GET endpoint - Protected with Clerk authentication
export async function GET(req: NextRequest) {
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

      const isAdmin = isValidAdminCookie(req)
      if (!userId && !isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login to access bookings' },
          { status: 401 }
        );
      }
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status');

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
          status: true,
          bookingDate: true,
          numberOfGuests: true,
          specialRequests: true,
          destinationName: true,
          price: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

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

// PUT endpoint - Update booking status
export async function PUT(req: NextRequest) {
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

      const isAdmin = isValidAdminCookie(req)
      if (!userId && !isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login to access bookings' },
          { status: 401 }
        );
      }
    }

    // Parse booking ID and updated data from request
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { updatedData } = await req.json() as { updatedData: { status?: string } };

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (updatedData.status && !isBookingStatus(updatedData.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update the booking status
    const booking = await prisma.booking.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
