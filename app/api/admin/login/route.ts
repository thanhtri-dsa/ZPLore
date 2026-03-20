import crypto from 'crypto'
import { NextResponse } from 'next/server'

function expectedCookieValue() {
  const secret = (process.env.ADMIN_TOOL_SECRET || process.env.ADMIN_TOOL_PASSWORD || '').trim()
  return crypto.createHmac('sha256', secret).update('ecoTourAdmin.v1').digest('hex')
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export async function POST(req: Request) {
  const password = process.env.ADMIN_TOOL_PASSWORD?.trim()
  if (!password) return NextResponse.json({ error: 'Admin tool disabled' }, { status: 404 })

  const body = (await req.json().catch(() => null)) as { password?: string } | null
  const provided = (body?.password || '').trim()
  if (!provided) return NextResponse.json({ error: 'Missing password' }, { status: 400 })

  if (!timingSafeEqual(provided, password)) {
    return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('ecoTourAdmin', expectedCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}

