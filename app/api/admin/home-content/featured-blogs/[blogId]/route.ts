import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { assertAdminOrThrow } from '../../_utils'

export async function DELETE(_req: Request, { params }: { params: { blogId: string } }) {
  try {
    assertAdminOrThrow()
    const blogId = params.blogId
    await prisma.homeFeaturedBlog.delete({ where: { blogId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 })
  }
}

