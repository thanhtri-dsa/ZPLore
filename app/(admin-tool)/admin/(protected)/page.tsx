import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminHomePage() {
  const [destCount, pkgCount, blogCount, postCount, pendingCountRow] = await Promise.all([
    prisma.destination.count(),
    prisma.package.count(),
    prisma.blog.count(),
    prisma.communityPost.count(),
    prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "ImageEditSuggestion" WHERE status = 'PENDING'`,
  ])
  const pendingCount = Number(pendingCountRow?.[0]?.count ?? 0)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-white">Tổng quan</CardTitle>
          <CardDescription className="text-white/70">Kết nối cùng database website.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Destinations</div>
            <div className="mt-2 text-3xl font-black">{destCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Packages</div>
            <div className="mt-2 text-3xl font-black">{pkgCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Blogs</div>
            <div className="mt-2 text-3xl font-black">{blogCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Community</div>
            <div className="mt-2 text-3xl font-black">{postCount}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-white">Đề xuất đang chờ</CardTitle>
          <CardDescription className="text-white/70">Duyệt hoặc áp dụng thay đổi hình ảnh.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Pending</div>
              <div className="mt-2 text-3xl font-black">{pendingCount}</div>
            </div>
            <Link href="/admin/suggestions">
              <Button className="rounded-2xl bg-white text-black hover:bg-white/90">Mở danh sách</Button>
            </Link>
          </div>
          <Link href="/admin/images">
            <Button variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              Tạo đề xuất chỉnh sửa hình ảnh
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
