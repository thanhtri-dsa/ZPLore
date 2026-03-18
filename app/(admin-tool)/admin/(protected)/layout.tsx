import type { ReactNode } from 'react'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function expectedCookieValue() {
  const secret = (process.env.ADMIN_TOOL_SECRET || process.env.ADMIN_TOOL_PASSWORD || '').trim()
  return crypto.createHmac('sha256', secret).update('ecoTourAdmin.v1').digest('hex')
}

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const cookie = cookies().get('ecoTourAdmin')?.value
  if (!cookie || cookie !== expectedCookieValue()) redirect('/admin/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Admin Studio</div>
          <div className="text-2xl font-black">Quản lý hình ảnh</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              Tổng quan
            </Button>
          </Link>
          <Link href="/admin/images">
            <Button variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              Hình ảnh
            </Button>
          </Link>
          <Link href="/admin/suggestions">
            <Button variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              Đề xuất
            </Button>
          </Link>
          <form action="/api/admin/logout" method="post">
            <Button type="submit" className="rounded-2xl bg-white text-black hover:bg-white/90">
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>
      {children}
    </div>
  )
}

