"use client"

import * as React from "react"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useClerkEnabled } from "@/components/clerk-enabled"

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

  return (
    <div className="container mx-auto px-4 pt-28 pb-24">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
        Tài khoản
      </div>
      <h1 className="vn-title text-3xl md:text-5xl font-black mt-4">Xin chào, {user?.firstName ?? "bạn"}!</h1>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
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

        <Card className="vn-card-vip">
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

