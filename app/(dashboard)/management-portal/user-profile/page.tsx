'use client'

import { useEffect } from 'react'
import { UserProfile } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import config from "@/config"
import dynamic from 'next/dynamic'
import { useClerkEnabled } from '@/components/clerk-enabled'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function UserProfileComponent() {
    const router = useRouter()
    const clerkEnabled = useClerkEnabled()

    useEffect(() => {
        if (!config?.auth?.enabled) {
            router.back()
        }
    }, [router])

    if (!config?.auth?.enabled) {
        return null
    }

    if (!clerkEnabled) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6">
                <Card className="max-w-lg w-full">
                    <CardHeader>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>Trang này cần bật đăng nhập Clerk.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Bật Clerk bằng cách set <span className="font-mono">FORCE_CLERK_AUTH=true</span> và cấu hình key hợp lệ.
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <UserProfile routing="hash" />
            </div>
        </div>
    )
}

// Disable SSR for this page to prevent Clerk useSession hydration errors during build
export default dynamic(() => Promise.resolve(UserProfileComponent), { ssr: false })
