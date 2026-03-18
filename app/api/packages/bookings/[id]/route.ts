import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

const PACKAGE_BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CONFIRMED', 'CANCELLED'] as const
type PackageBookingStatus = typeof PACKAGE_BOOKING_STATUSES[number]

function isPackageBookingStatus(value: unknown): value is PackageBookingStatus {
  return typeof value === 'string' && (PACKAGE_BOOKING_STATUSES as readonly string[]).includes(value)
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

type PackageBookingWithEmail = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country: string | null;
  bookingDate: string | null;
  numberOfGuests: number;
  destinationName: string | null;
  specialRequests: string | null;
  price: number | null;
  status: PackageBookingStatus;
}

async function sendPackageStatusEmail(booking: PackageBookingWithEmail) {
  const emailContent = {
    APPROVED: {
      subject: 'Package Booking Confirmation - Làng Nghề Travel',
      text: `Dear ${booking.firstname} ${booking.lastname},

Thank you for choosing Làng Nghề Travel. We are delighted to confirm your package booking.

Booking Details:
---------------
Booking Reference: ${booking.id}
Package: ${booking.destinationName || 'Custom Package'}
Travel Date: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'To be confirmed'}
Number of Guests: ${booking.numberOfGuests}
Destination: ${booking.destinationName || 'Multiple Destinations'}
${booking.country ? `Country: ${booking.country}` : ''}
${booking.price ? `Total Package Price: KES ${booking.price.toLocaleString()}` : ''}
${booking.specialRequests ? `\nSpecial Requests: ${booking.specialRequests}` : ''}

Next Steps:
-----------
1. Please review all booking details carefully
2. Keep this email for your records
3. If you need to modify your booking, please contact us immediately
4. Our team will reach out shortly with additional information about your itinerary

For any queries, please contact us at:
Phone: ${process.env.COMPANY_PHONE || '+84 XXX XXX XXX'}
Email: ${process.env.EMAIL_USER}

We're excited to help you create unforgettable travel memories!

Best regards,
Làng Nghề Travel Team`,
    },
    REJECTED: {
      subject: 'Package Booking Update - Làng Nghề Travel',
      text: `Dear ${booking.firstname} ${booking.lastname},

Thank you for your interest in booking a package with Làng Nghề Travel.

We regret to inform you that we are unable to confirm your package booking request at this time for the following destination: ${booking.destinationName || 'requested package'}.

This could be due to various factors such as:
- Package availability during your requested dates
- Capacity constraints
- Seasonal limitations
- Technical constraints

We would be happy to:
1. Suggest alternative dates for the same package
2. Recommend similar packages that might interest you
3. Work with you to create a custom package that better suits your needs

Please feel free to contact us to discuss alternatives or for any clarification:
Phone: ${process.env.COMPANY_PHONE || '+84 XXX XXX XXX'}
Email: ${process.env.EMAIL_USER}

We appreciate your understanding and hope to serve you in the future.

Best regards,
Làng Nghề Travel Team`,
    }
  }

  try {
    if (booking.status !== 'APPROVED' && booking.status !== 'REJECTED') {
      return
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: emailContent[booking.status].subject,
      text: emailContent[booking.status].text
    })
  } catch (error) {
    console.error('Error sending package booking email:', error)
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const bookingId = url.searchParams.get('id')
    const { status } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Validate status
    if (!isPackageBookingStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status
      }
    })

    // Send email notification
    await sendPackageStatusEmail(updatedBooking as PackageBookingWithEmail)

    return NextResponse.json({
      message: 'Booking status updated and notification sent',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Error updating package booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
