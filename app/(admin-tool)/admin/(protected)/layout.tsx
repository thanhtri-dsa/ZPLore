import type { ReactNode } from 'react'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'

function expectedCookieValue() {
  const secret = (process.env.ADMIN_TOOL_SECRET || process.env.ADMIN_TOOL_PASSWORD || '').trim()
  return crypto.createHmac('sha256', secret).update('ecoTourAdmin.v1').digest('hex')
}

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const cookie = cookies().get('ecoTourAdmin')?.value
  
  // Basic validation for the cookie
  if (!cookie || cookie !== expectedCookieValue()) {
    redirect('/admin/login')
  }

  return <AdminShell>{children}</AdminShell>
}
