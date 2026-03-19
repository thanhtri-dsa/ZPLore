import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { assertAdminOrThrow } from '../../_utils'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    assertAdminOrThrow()
    const id = params.id
    const body = (await req.json()) as unknown as {
      name?: string
      location?: string
      rating?: number
      content?: string
      isActive?: boolean
      order?: number
    }

    const patch: Record<string, unknown> = {}
    if (body.name != null) patch.name = String(body.name).trim()
    if (body.location != null) patch.location = String(body.location).trim()
    if (body.content != null) patch.content = String(body.content).trim()
    if (body.rating != null) {
      const r = Number(body.rating)
      patch.rating = Number.isFinite(r) ? Math.min(5, Math.max(1, Math.round(r))) : 5
    }
    if (body.isActive != null) patch.isActive = !!body.isActive
    if (body.order != null) {
      const o = Number(body.order)
      patch.order = Number.isFinite(o) ? Math.max(0, Math.round(o)) : 0
    }

    const updated = await prisma.homeReview.update({
      where: { id },
      data: patch,
    })
    return NextResponse.json({ review: updated })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    assertAdminOrThrow()
    const id = params.id
    await prisma.homeReview.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

