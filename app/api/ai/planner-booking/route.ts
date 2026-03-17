import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstname,
      lastname,
      email,
      phone,
      bookingDate,
      numberOfGuests,
      startLocation,
      endLocation,
      transportMode,
      distanceKm,
      co2Kg,
      routePoints,
      ecoPoints,
      expertInsights
    } = body;

    const booking = await prisma.aIPlannerBooking.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        bookingDate: bookingDate ? new Date(bookingDate) : null,
        numberOfGuests: parseInt(numberOfGuests) || 1,
        startLocation,
        endLocation,
        transportMode,
        distanceKm: parseFloat(distanceKm) || 0,
        co2Kg: parseFloat(co2Kg) || 0,
        routePoints: routePoints ? JSON.stringify(routePoints) : null,
        ecoPoints: ecoPoints ? JSON.stringify(ecoPoints) : null,
        expertInsights: expertInsights ? JSON.stringify(expertInsights) : null,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error creating AI planner booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
