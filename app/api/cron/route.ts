import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verify that the request is coming from Vercel's cron job
    const headersList = headers();
    const cronSecret = headersList.get('x-vercel-cron-token');

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update all users' updatedAt timestamp
    const updateResult = await prisma.user.updateMany({
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Users timestamps updated successfully',
      updatedUsers: updateResult.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
