import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url))
  res.cookies.set('ecoTourAdmin', '', { path: '/', maxAge: 0 })
  return res
}
