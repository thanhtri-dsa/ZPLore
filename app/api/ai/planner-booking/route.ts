import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string | null | undefined) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.length ? digits : null
}

function defaultItemsUsed(transportMode: string) {
  const mode = String(transportMode || '').toLowerCase()
  const base = [
    'Bình nước tái sử dụng',
    'Túi vải / túi tote',
    'Áo mưa / áo khoác mỏng',
    'Kem chống nắng thân thiện với môi trường',
    'Hộp đựng / bộ muỗng nĩa cá nhân',
  ]

  if (mode.includes('xe') || mode.includes('bus')) {
    return [...base, 'Sạc dự phòng', 'Khăn lau nhỏ']
  }
  if (mode.includes('đi bộ') || mode.includes('walking') || mode.includes('foot')) {
    return [...base, 'Giày/dep êm', 'Nón/ mũ', 'Băng cá nhân']
  }
  return base
}

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
      expertInsights,
      itemsUsed
    } = body;

    const emailNormalized = normalizeEmail(email)
    const phoneNormalized = normalizePhone(phone)
    const fullName = `${firstname} ${lastname}`.trim()

    const customer = await prisma.customer.upsert({
      where: { emailNormalized },
      create: {
        email,
        emailNormalized,
        phone: phone ? String(phone) : null,
        phoneNormalized,
        firstName: firstname,
        lastName: lastname,
        fullName,
        lastSeenAt: new Date(),
      },
      update: {
        email,
        phone: phone ? String(phone) : null,
        phoneNormalized,
        firstName: firstname,
        lastName: lastname,
        fullName,
        lastSeenAt: new Date(),
      },
      select: { id: true },
    })

    const booking = await prisma.aIPlannerBooking.create({
      data: {
        customerId: customer.id,
        publicToken: crypto.randomUUID(),
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
        itemsUsed: Array.isArray(itemsUsed)
          ? JSON.stringify(itemsUsed)
          : typeof itemsUsed === 'string' && itemsUsed.trim().length
            ? itemsUsed
            : JSON.stringify(defaultItemsUsed(transportMode)),
      },
    });

    const tripUrl = booking.publicToken ? `/trip/${booking.publicToken}` : null
    return NextResponse.json({ success: true, booking, tripUrl });
  } catch (error) {
    console.error('Error creating AI planner booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
