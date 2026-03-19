import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { assertAdminOrThrow } from '../_utils'

export async function GET() {
  try {
    assertAdminOrThrow()
    const rows = await prisma.homeFeaturedBlog.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ featured: rows })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

export async function POST(req: Request) {
  try {
    assertAdminOrThrow()
    const body = (await req.json()) as unknown as { blogId?: string; order?: number; isActive?: boolean }
    const blogId = String(body.blogId ?? '').trim()
    if (!blogId) return NextResponse.json({ error: 'Missing blogId' }, { status: 400 })

    const orderRaw = Number(body.order ?? 0)
    const order = Number.isFinite(orderRaw) ? Math.max(0, Math.round(orderRaw)) : 0
    const isActive = body.isActive !== false

    // Validate blog exists
    const exists = await prisma.blog.findUnique({ where: { id: blogId }, select: { id: true } })
    if (!exists) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    const created = await prisma.homeFeaturedBlog.upsert({
      where: { blogId },
      create: { blogId, order, isActive },
      update: { order, isActive },
    })
    return NextResponse.json({ featured: created })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

