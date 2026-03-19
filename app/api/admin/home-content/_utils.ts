import crypto from 'crypto'
import { cookies } from 'next/headers'

function expectedCookieValue() {
  const secret = (process.env.ADMIN_TOOL_SECRET || process.env.ADMIN_TOOL_PASSWORD || '').trim()
  return crypto.createHmac('sha256', secret).update('ecoTourAdmin.v1').digest('hex')
}

export function assertAdminOrThrow() {
  const cookie = cookies().get('ecoTourAdmin')?.value
  if (!cookie || cookie !== expectedCookieValue()) {
    throw new Error('Unauthorized')
  }
}

