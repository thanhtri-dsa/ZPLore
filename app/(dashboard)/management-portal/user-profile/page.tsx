'use client'

import { useEffect } from 'react'
import { UserProfile } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import config from "@/config"
import dynamic from 'next/dynamic'

function UserProfileComponent() {
    const router = useRouter()

    useEffect(() => {
        if (!config?.auth?.enabled) {
            router.back()
        }
    }, [router])

    if (!config?.auth?.enabled) {
        return null
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