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
  if (!cookie || cookie !== expectedCookieValue()) return false
  return true
}

type EntityType = 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST'
type SuggestionRow = {
  id: string
  entityType: EntityType
  entityId: string
  field: string
  newValue: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

async function applyImage(
  tx: typeof prisma,
  entityType: EntityType,
  entityId: string,
  field: string,
  newValue: string
) {
  if (field !== 'imageData') return
  if (entityType === 'DESTINATION') {
    await tx.destination.update({ where: { id: entityId }, data: { imageData: newValue } })
    return
  }
  if (entityType === 'PACKAGE') {
    await tx.package.update({ where: { id: entityId }, data: { imageData: newValue } })
    return
  }
  if (entityType === 'BLOG') {
    await tx.blog.update({ where: { id: entityId }, data: { imageData: newValue } })
    return
  }
  await tx.communityPost.update({ where: { id: entityId }, data: { imageData: newValue } })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!process.env.ADMIN_TOOL_PASSWORD?.trim()) return NextResponse.json({ error: 'Admin tool disabled' }, { status: 404 })
  if (!requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = params.id
  const body = (await req.json().catch(() => null)) as { action?: 'approve' | 'reject'; apply?: boolean } | null
  const action = body?.action
  const apply = !!body?.apply

  if (action !== 'approve' && action !== 'reject') return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const suggestionRows = await prisma.$queryRaw<SuggestionRow[]>`
    SELECT
      id,
      "entityType" AS "entityType",
      "entityId" AS "entityId",
      field,
      "newValue" AS "newValue",
      status
    FROM "ImageEditSuggestion"
    WHERE id = ${id}
    LIMIT 1
  `
  const suggestion = suggestionRows[0]
  if (!suggestion) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (suggestion.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 409 })

  if (action === 'reject') {
    const affected = await prisma.$executeRaw`
      UPDATE "ImageEditSuggestion"
      SET status = 'REJECTED'::"ImageEditSuggestionStatus", "updatedAt" = NOW()
      WHERE id = ${id} AND status = 'PENDING'::"ImageEditSuggestionStatus"
    `
    if (Number(affected) === 0) return NextResponse.json({ error: 'Already processed' }, { status: 409 })
    return NextResponse.json({ ok: true })
  }

  try {
    await prisma.$transaction(async (tx) => {
      const affected = await tx.$executeRaw`
        UPDATE "ImageEditSuggestion"
        SET
          status = 'APPROVED'::"ImageEditSuggestionStatus",
          "appliedAt" = ${apply ? new Date() : null},
          "updatedAt" = NOW()
        WHERE id = ${id} AND status = 'PENDING'::"ImageEditSuggestionStatus"
      `
      if (Number(affected) === 0) {
        throw new Error('Already processed')
      }
      if (apply) {
        await applyImage(tx as typeof prisma, suggestion.entityType, suggestion.entityId, suggestion.field, suggestion.newValue)
      }
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Already processed')) return NextResponse.json({ error: 'Already processed' }, { status: 409 })
    throw e
  }

  return NextResponse.json({ ok: true })
}
