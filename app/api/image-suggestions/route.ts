import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function clerkEnabled() {
  return (
    !!process.env.CLERK_SECRET_KEY?.trim() &&
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
    (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')
  )
}

type EntityType = 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST'

export async function GET(req: NextRequest) {
  try {
    if (clerkEnabled()) {
      const userId = getAuth(req).userId ?? null
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const status = (url.searchParams.get('status') || 'PENDING').toUpperCase()
    const take = Math.min(200, Math.max(20, parseInt(url.searchParams.get('limit') || '100', 10)))

    const where =
      status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED'
        ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' }
        : {}

    const suggestions = await prisma.imageEditSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        field: true,
        oldValue: true,
        newValue: true,
        note: true,
        status: true,
        appliedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching image suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch image suggestions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (clerkEnabled()) {
      const userId = getAuth(req).userId ?? null
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      entityType?: EntityType
      entityId?: string
      field?: string
      newValue?: string
      note?: string | null
    } | null

    const entityType = body?.entityType
    const entityId = (body?.entityId || '').trim()
    const field = (body?.field || 'imageData').trim()
    const newValue = (body?.newValue || '').trim()
    const note = body?.note ? String(body.note).trim() : null

    if (!entityType || !entityId || !newValue) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (field !== 'imageData') return NextResponse.json({ error: 'Unsupported field' }, { status: 400 })

    const oldValue = await (async () => {
      if (entityType === 'DESTINATION') {
        const d = await prisma.destination.findUnique({ where: { id: entityId }, select: { imageData: true } })
        return d?.imageData ?? null
      }
      if (entityType === 'PACKAGE') {
        const p = await prisma.package.findUnique({ where: { id: entityId }, select: { imageData: true } })
        return p?.imageData ?? null
      }
      if (entityType === 'BLOG') {
        const b = await prisma.blog.findUnique({ where: { id: entityId }, select: { imageData: true } })
        return b?.imageData ?? null
      }
      const post = await prisma.communityPost.findUnique({ where: { id: entityId }, select: { imageData: true } })
      return post?.imageData ?? null
    })()

    const created = await prisma.imageEditSuggestion.create({
      data: {
        entityType,
        entityId,
        field,
        oldValue,
        newValue,
        note,
        status: 'PENDING',
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating image suggestion:', error)
    return NextResponse.json({ error: 'Failed to create image suggestion' }, { status: 500 })
  }
}
