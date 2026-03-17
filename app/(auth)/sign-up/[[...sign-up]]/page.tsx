'use client'

import { SignUp } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useClerkEnabled } from '@/components/clerk-enabled'

export default function Page() {
  const clerkEnabled = useClerkEnabled()
  if (!clerkEnabled) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-green-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <div className="text-lg font-black mb-2 text-primary">Đăng ký đang tắt (dev)</div>
          <div className="text-sm text-muted-foreground mb-6">
            Trang admin đang chạy chế độ dev không cần Clerk. Vào thẳng dashboard để tạo tour.
          </div>
          <a
            href="/management-portal/dashboard"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-primary text-white font-bold"
          >
            Mở Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <SignUpWithClerk />
}

function SignUpWithClerk() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/management-portal/dashboard')
    }
  }, [isSignedIn, router])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-green-100 p-4">
      <div className="w-full max-w-md">
        <SignUp 
          fallbackRedirectUrl="/" 
          signInFallbackRedirectUrl="/management-portal/dashboard" 
        />
      </div>
    </div>
  )
}
