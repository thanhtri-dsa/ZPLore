'use client'

import { useEffect } from 'react'
import { UserProfile } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import config from "@/config"
import dynamic from 'next/dynamic'
import { useClerkEnabled } from '@/components/clerk-enabled'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Shield, User, Globe, Lock, Key, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

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
            <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-none saas-glass rounded-[2.5rem] p-8">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto bg-amber-50 p-4 rounded-3xl w-fit">
                            <Shield className="h-8 w-8 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Authentication Required</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Identity services are currently offline.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="text-center pt-4">
                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                Please enable Clerk by setting <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">FORCE_CLERK_AUTH=true</span> and configuring valid API keys in your environment.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1 opacity-80">
                        <Shield className="h-3 w-3" />
                        <span>Identity & Security</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        Account Studio
                    </h1>
                    <p className="text-sm text-slate-500 font-bold max-w-xl leading-relaxed">
                        Manage your administrative profile, security credentials, and preferences.
                    </p>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
            >
                <div className="w-full max-w-5xl saas-card p-1 overflow-hidden">
                    <div className="clerk-user-profile-wrapper">
                        <style jsx global>{`
                            .clerk-user-profile-wrapper .cl-card {
                                border: none !important;
                                box-shadow: none !important;
                                background: transparent !important;
                                width: 100% !important;
                                max-width: 100% !important;
                            }
                            .clerk-user-profile-wrapper .cl-navbar {
                                border-right: 1px solid #f1f5f9 !important;
                                padding: 2rem !important;
                            }
                            .clerk-user-profile-wrapper .cl-scrollBox {
                                padding: 2rem !important;
                            }
                            .clerk-user-profile-wrapper .cl-headerTitle {
                                font-weight: 900 !important;
                                letter-spacing: -0.025em !important;
                            }
                            .clerk-user-profile-wrapper .cl-navbarButton {
                                font-weight: 700 !important;
                                border-radius: 0.75rem !important;
                                transition: all 0.2s !important;
                            }
                            .clerk-user-profile-wrapper .cl-navbarButton:hover {
                                background: #f8fafc !important;
                            }
                            .clerk-user-profile-wrapper .cl-navbarButton[data-active="true"] {
                                background: #f0fdf4 !important;
                                color: #059669 !important;
                            }
                        `}</style>
                        <UserProfile 
                            routing="hash" 
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "w-full shadow-none",
                                    navbar: "hidden md:flex",
                                    pageScrollBox: "p-8",
                                }
                            }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

// Disable SSR for this page to prevent Clerk useSession hydration errors during build
export default dynamic(() => Promise.resolve(UserProfileComponent), { ssr: false })
