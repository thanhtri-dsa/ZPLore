'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, RefreshCw, ExternalLink } from 'lucide-react'

type HomeReview = {
  id: string
  name: string
  location: string
  rating: number
  content: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

type FeaturedRow = {
  id: string
  blogId: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function HomeContentAdminPage() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true)

  const [reviews, setReviews] = React.useState<HomeReview[]>([])
  const [featured, setFeatured] = React.useState<FeaturedRow[]>([])

  const [newReview, setNewReview] = React.useState({
    name: '',
    location: '',
    rating: 5,
    order: 0,
    isActive: true,
    content: '',
  })

  const [newFeaturedBlogId, setNewFeaturedBlogId] = React.useState('')
  const [newFeaturedOrder, setNewFeaturedOrder] = React.useState(0)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, fRes] = await Promise.all([
        fetch('/api/admin/home-content/reviews'),
        fetch('/api/admin/home-content/featured-blogs'),
      ])
      if (!rRes.ok) throw new Error('Failed to load reviews')
      if (!fRes.ok) throw new Error('Failed to load featured blogs')
      const rJson = (await rRes.json()) as { reviews: HomeReview[] }
      const fJson = (await fRes.json()) as { featured: FeaturedRow[] }
      setReviews(Array.isArray(rJson.reviews) ? rJson.reviews : [])
      setFeatured(Array.isArray(fJson.featured) ? fJson.featured : [])
    } catch (e) {
      toast({
        title: 'Lỗi',
        description: e instanceof Error ? e.message : 'Không tải được dữ liệu home content',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    load()
  }, [load])

  const createReview = async () => {
    try {
      const res = await fetch('/api/admin/home-content/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Failed to create review')
      toast({ title: 'Thành công', description: 'Đã thêm review' })
      setNewReview({ name: '', location: '', rating: 5, order: 0, isActive: true, content: '' })
      await load()
    } catch (e) {
      toast({ title: 'Lỗi', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' })
    }
  }

  const updateReview = async (id: string, patch: Partial<HomeReview>) => {
    const res = await fetch(`/api/admin/home-content/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) throw new Error(json.error || 'Failed to update')
  }

  const deleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/home-content/reviews/${id}`, { method: 'DELETE' })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Failed to delete')
      toast({ title: 'Đã xóa', description: 'Review đã được xóa' })
      await load()
    } catch (e) {
      toast({ title: 'Lỗi', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' })
    }
  }

  const addFeatured = async () => {
    try {
      const res = await fetch('/api/admin/home-content/featured-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: newFeaturedBlogId, order: newFeaturedOrder, isActive: true }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Failed to add featured blog')
      toast({ title: 'Thành công', description: 'Đã thêm featured blog' })
      setNewFeaturedBlogId('')
      setNewFeaturedOrder(0)
      await load()
    } catch (e) {
      toast({ title: 'Lỗi', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' })
    }
  }

  const deleteFeatured = async (blogId: string) => {
    try {
      const res = await fetch(`/api/admin/home-content/featured-blogs/${blogId}`, { method: 'DELETE' })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Failed to delete featured blog')
      toast({ title: 'Đã xóa', description: 'Featured blog đã được gỡ' })
      await load()
    } catch (e) {
      toast({ title: 'Lỗi', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">Home Content</h2>
          <p className="text-sm text-slate-400 font-bold">Admin có thể tự thay đổi “Bài chia sẻ & Review” trên trang chủ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            className="h-9 border-white/10 bg-white/5 shadow-sm text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
          <Link href="/" target="_blank" rel="noreferrer">
            <Button size="sm" className="h-9 px-4 eco-gradient text-white text-xs font-black">
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Xem Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-slate-900">Reviews</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Thêm review</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên</Label>
                  <Input value={newReview.name} onChange={(e) => setNewReview((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Khu vực</Label>
                  <Input value={newReview.location} onChange={(e) => setNewReview((p) => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={newReview.rating}
                    onChange={(e) => setNewReview((p) => ({ ...p, rating: Number(e.target.value) || 5 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thứ tự</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newReview.order}
                    onChange={(e) => setNewReview((p) => ({ ...p, order: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Textarea value={newReview.content} onChange={(e) => setNewReview((p) => ({ ...p, content: e.target.value }))} />
              </div>
              <Button onClick={createReview} className="h-10 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" /> Thêm
              </Button>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-sm text-slate-500">Chưa có review nào.</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 truncate">
                          {r.name} <span className="text-slate-400 font-bold">•</span> {r.location}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-black">
                            {r.rating}/5
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] font-black ${r.isActive ? '' : 'opacity-50'}`}>
                            {r.isActive ? 'ACTIVE' : 'HIDDEN'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-black">
                            order {r.order}
                          </Badge>
                        </div>
                        <div className="mt-3 text-sm text-slate-600 leading-relaxed">{r.content}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl text-xs font-black"
                          onClick={async () => {
                            await updateReview(r.id, { isActive: !r.isActive })
                            await load()
                          }}
                        >
                          {r.isActive ? 'Ẩn' : 'Hiện'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => deleteReview(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-slate-900">Featured Articles (Blog IDs)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Thêm blog nổi bật</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blog ID</Label>
                  <Input value={newFeaturedBlogId} onChange={(e) => setNewFeaturedBlogId(e.target.value)} placeholder="vd: cmm..." />
                </div>
                <div className="space-y-2">
                  <Label>Thứ tự</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newFeaturedOrder}
                    onChange={(e) => setNewFeaturedOrder(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <Button onClick={addFeatured} className="h-10 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Thêm
              </Button>
              <div className="text-xs text-slate-500">
                Tip: lấy Blog ID từ trang quản lý blogs hoặc database. (Mình có thể làm dropdown chọn blog sau nếu bạn muốn.)
              </div>
            </div>

            <div className="space-y-3">
              {featured.length === 0 ? (
                <div className="text-sm text-slate-500">Chưa set featured blog.</div>
              ) : (
                featured.map((f) => (
                  <div key={f.id} className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">{f.blogId}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-black">
                          order {f.order}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] font-black ${f.isActive ? '' : 'opacity-50'}`}>
                          {f.isActive ? 'ACTIVE' : 'HIDDEN'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="destructive" size="icon" className="h-9 w-9 rounded-xl" onClick={() => deleteFeatured(f.blogId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

