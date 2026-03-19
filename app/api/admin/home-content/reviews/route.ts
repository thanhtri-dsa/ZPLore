import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { assertAdminOrThrow } from '../_utils'

export async function GET() {
  try {
    assertAdminOrThrow()
    const rows = await prisma.homeReview.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ reviews: rows })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

export async function POST(req: Request) {
  try {
    assertAdminOrThrow()
    const body = (await req.json()) as unknown as {
      name?: string
      location?: string
      rating?: number
      content?: string
      isActive?: boolean
      order?: number
    }

    const name = String(body.name ?? '').trim()
    const location = String(body.location ?? '').trim()
    const content = String(body.content ?? '').trim()
    const ratingRaw = Number(body.rating ?? 5)
    const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, Math.round(ratingRaw))) : 5
    const isActive = body.isActive !== false
    const orderRaw = Number(body.order ?? 0)
    const order = Number.isFinite(orderRaw) ? Math.max(0, Math.round(orderRaw)) : 0

    if (!name || !location || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const created = await prisma.homeReview.create({
      data: { name, location, content, rating, isActive, order },
    })
    return NextResponse.json({ review: created })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

