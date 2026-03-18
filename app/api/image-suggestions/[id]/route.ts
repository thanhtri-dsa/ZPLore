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

async function applyImage(entityType: EntityType, entityId: string, field: string, newValue: string) {
  if (field !== 'imageData') return
  if (entityType === 'DESTINATION') {
    await prisma.destination.update({ where: { id: entityId }, data: { imageData: newValue } })
    return
  }
  if (entityType === 'PACKAGE') {
    await prisma.package.update({ where: { id: entityId }, data: { imageData: newValue } })
    return
  }
  if (entityType === 'BLOG') {
    await prisma.blog.update({ where: { id: entityId }, data: { imageData: newValue } })
    return
  }
  await prisma.communityPost.update({ where: { id: entityId }, data: { imageData: newValue } })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (clerkEnabled()) {
      const userId = getAuth(req).userId ?? null
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id
    const body = (await req.json().catch(() => null)) as { action?: 'approve' | 'reject'; apply?: boolean } | null
    const action = body?.action
    const apply = !!body?.apply

    if (action !== 'approve' && action !== 'reject') return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    const suggestion = await prisma.imageEditSuggestion.findUnique({
      where: { id },
      select: { id: true, status: true, entityType: true, entityId: true, field: true, newValue: true },
    })
    if (!suggestion) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (suggestion.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 409 })

    if (action === 'reject') {
      await prisma.imageEditSuggestion.update({ where: { id }, data: { status: 'REJECTED' } })
      return NextResponse.json({ ok: true })
    }

    await prisma.imageEditSuggestion.update({
      where: { id },
      data: { status: 'APPROVED', appliedAt: apply ? new Date() : null },
    })

    if (apply) {
      await applyImage(suggestion.entityType as EntityType, suggestion.entityId, suggestion.field, suggestion.newValue)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating image suggestion:', error)
    return NextResponse.json({ error: 'Failed to update image suggestion' }, { status: 500 })
  }
}
