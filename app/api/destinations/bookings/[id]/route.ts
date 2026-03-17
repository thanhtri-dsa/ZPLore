import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

type BookingWithEmail = {
  firstname: string;
  bookingDate: string | null;
  numberOfGuests: number;
  destinationName: string | null;
  specialRequests: string | null;
  price: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  email: string;
}

async function sendStatusEmail(booking: BookingWithEmail) {
  const emailContent = {
    APPROVED: {
        subject: 'Booking Update - Forestline Tours and Travels',
      text: `Dear ${booking.firstname},

We are pleased to inform you that your booking has been confirmed. Here are your booking details:

Date: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Not specified'}
Number of Guests: ${booking.numberOfGuests}
${booking.destinationName ? `Destination: ${booking.destinationName}` : ''}
${booking.specialRequests ? `Special Requests: ${booking.specialRequests}` : ''}
${booking.price ? `Total Amount: KES ${booking.price.toLocaleString()}` : ''}

We're looking forward to hosting you!

Best regards,
Forestline Tours and Travels Team`
    },
    REJECTED: {
      subject: 'Booking Update - Forestline Tours and Travels',
      text: `Dear ${booking.firstname},

We regret to inform you that we are unable to accommodate your booking request at this time.

If you have any questions or would like to explore alternative options, please don't hesitate to contact us.

Best regards,
Forestline Tours and Travels Team` 
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
    console.error('Error sending email:', error)
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    
    // Validate status
    if (!status || !['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: {
        id: params.id
      },
      data: {
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
      }
    })

    // Send email notification
    await sendStatusEmail(updatedBooking as BookingWithEmail)
    
    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}