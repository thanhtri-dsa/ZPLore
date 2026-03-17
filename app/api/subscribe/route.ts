import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';

// Define the schema for the request body
const subscribeSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const result = subscribeSchema.safeParse(body);
    
    if (!result.success) {
      // If validation fails, return a 400 error with the validation issues
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email } = result.data;

    // Here you would typically:
    // 1. Check if the email already exists in your database
    // 2. Add the email to your newsletter list (database or external service)

    // Send confirmation email
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Newsletter!',
      html: `
        <h1>Mazingira Tours and Travel Newsletter!</h1>
        <p>Thank you for subscribing to our newsletter. We're excited to share our latest eco-friendly travel tips and sustainable destinations with you.</p>
        <p>Stay tuned for our upcoming newsletters!</p>
      `
    };

    await transporter.sendMail(confirmationMailOptions);

    console.log(`Subscribed and sent confirmation to: ${email}`);

    return NextResponse.json({ message: 'Subscription successful. Please check your email for confirmation.' }, { status: 200 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}