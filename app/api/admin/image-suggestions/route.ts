import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function expectedCookieValue() {
  const secret = (process.env.ADMIN_TOOL_SECRET || process.env.ADMIN_TOOL_PASSWORD || '').trim()
  return crypto.createHmac('sha256', secret).update('ecoTourAdmin.v1').digest('hex')
}

function requireAdmin() {
  const cookie = cookies().get('ecoTourAdmin')?.value
  if (!cookie || cookie !== expectedCookieValue()) {
    return false
  }
  return true
}

type EntityType = 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST'

export async function POST(req: Request) {
  if (!process.env.ADMIN_TOOL_PASSWORD?.trim()) return NextResponse.json({ error: 'Admin tool disabled' }, { status: 404 })
  if (!requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  if (!entityType || !entityId || !newValue) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

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

  const id = crypto.randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "ImageEditSuggestion" (
      id,
      "entityType",
      "entityId",
      field,
      "oldValue",
      "newValue",
      note,
      status,
      "updatedAt"
    )
    VALUES (
      ${id},
      ${entityType}::"ImageEntityType",
      ${entityId},
      ${field},
      ${oldValue},
      ${newValue},
      ${note},
      'PENDING'::"ImageEditSuggestionStatus",
      NOW()
    )
  `

  return NextResponse.json({ ok: true, id })
}
