"use client"

import * as React from "react"
import { useUser, useClerk, SignInButton } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useClerkEnabled } from "@/components/clerk-enabled"

type EcoPointLog = {
  id: string
  actionType: string
  pointsChange: number
  description: string
  createdAt: string
  reward?: {
    id: string
    title: string
  } | null
}

export default function MePage() {
  const clerkEnabled = useClerkEnabled()
  if (!clerkEnabled) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-24">
        <Card className="vn-card">
          <CardContent className="p-6 space-y-3">
            <div className="text-xl font-black text-primary">Tính năng tài khoản đang tắt (dev)</div>
            <div className="text-sm text-muted-foreground">
              Bật Clerk để dùng trang <b>/me</b>. Bạn vẫn có thể xem tour/đặt dịch vụ như khách.
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/packages">
                <Button className="rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                  Xem gói tour
                </Button>
              </Link>
              <a href="/admin/dashboard">
                <Button variant="outline" className="rounded-2xl font-black uppercase tracking-[0.18em] text-[11px]">
                  Mở Dashboard
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <MeWithClerk />
}

function MeWithClerk() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const [ecoPoints, setEcoPoints] = React.useState(0)
  const [pointLogs, setPointLogs] = React.useState<EcoPointLog[]>([])
  const [loadingPoints, setLoadingPoints] = React.useState(true)

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoadingPoints(false)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        setLoadingPoints(true)
        const res = await fetch("/api/eco/points", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        setEcoPoints(typeof data.ecoPoints === "number" ? data.ecoPoints : 0)
        setPointLogs(Array.isArray(data.pointLogs) ? data.pointLogs : [])
      } finally {
        if (mounted) setLoadingPoints(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-24">
        <Card className="vn-card">
          <CardContent className="p-6">Đang tải...</CardContent>
        </Card>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-24">
        <Card className="vn-card">
          <CardContent className="p-6 space-y-4">
            <div className="text-xl font-black text-primary">Bạn chưa đăng nhập</div>
            <div className="text-sm text-muted-foreground">Đăng nhập để đăng khoảnh khắc và sử dụng dịch vụ.</div>
            <SignInButton mode="modal">
              <Button className="rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                Đăng nhập
              </Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    "Bạn"
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "Chưa có email"
  const phone = user?.primaryPhoneNumber?.phoneNumber || "Chưa có số điện thoại"
  const redeemLogs = pointLogs.filter((log) => log.actionType === "SPEND_REDEEM")

  return (
    <div className="container mx-auto px-4 pt-28 pb-24">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
        Tài khoản
      </div>
      <h1 className="vn-title text-3xl md:text-5xl font-black mt-4">Xin chào, {user?.firstName ?? "bạn"}!</h1>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card className="vn-card">
          <CardContent className="p-6 space-y-4">
            <div className="text-lg font-black text-primary">Thông tin tài khoản</div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-black text-primary/70 uppercase tracking-widest text-[10px]">Họ tên</span>
                <div className="text-primary font-bold">{fullName}</div>
              </div>
              <div>
                <span className="font-black text-primary/70 uppercase tracking-widest text-[10px]">Email</span>
                <div className="text-primary font-bold break-all">{primaryEmail}</div>
              </div>
              <div>
                <span className="font-black text-primary/70 uppercase tracking-widest text-[10px]">Số điện thoại</span>
                <div className="text-primary font-bold">{phone}</div>
              </div>
              <div>
                <span className="font-black text-primary/70 uppercase tracking-widest text-[10px]">Điểm eco hiện tại</span>
                <div className="text-primary font-bold">{loadingPoints ? "Đang tải..." : ecoPoints}</div>
              </div>
            </div>
            <div className="pt-1">
              <Button
                variant="destructive"
                disabled={isSigningOut}
                onClick={async () => {
                  try {
                    setIsSigningOut(true)
                    await signOut({ redirectUrl: "/" })
                  } finally {
                    setIsSigningOut(false)
                  }
                }}
                className="rounded-2xl font-black uppercase tracking-[0.18em] text-[11px]"
              >
                {isSigningOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="vn-card">
          <CardContent className="p-6 space-y-3">
            <div className="text-lg font-black text-primary">Khoảnh khắc của tôi</div>
            <div className="text-sm text-muted-foreground">Xem & quản lý bài đăng cộng đồng của bạn.</div>
            <Link href="/community">
              <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                Đi tới Cộng đồng
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="vn-card md:col-span-2">
          <CardContent className="p-6 space-y-3">
            <div className="text-lg font-black text-primary">Lịch sử phần thưởng đã đổi</div>
            {loadingPoints ? (
              <div className="text-sm text-muted-foreground">Đang tải lịch sử...</div>
            ) : redeemLogs.length === 0 ? (
              <div className="text-sm text-muted-foreground">Bạn chưa đổi phần thưởng nào.</div>
            ) : (
              <div className="space-y-3">
                {redeemLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="font-black text-primary text-sm">
                      {log.reward?.title || log.description || "Đổi phần thưởng"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Trừ {Math.abs(log.pointsChange)} điểm •{" "}
                      {new Date(log.createdAt).toLocaleString("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="vn-card-vip md:col-span-2">
          <CardContent className="p-6 space-y-3">
            <div className="text-lg font-black text-primary">Đặt tour</div>
            <div className="text-sm text-muted-foreground">Chọn gói tour và đặt dịch vụ nhanh.</div>
            <Link href="/packages">
              <Button className="rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                Xem gói tour
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

