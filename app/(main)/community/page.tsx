"use client"

import * as React from "react"
import Image from "next/image"
import { Heart, MessageCircle, Bookmark, Plus, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type CommunityPost = {
  id: string
  authorName: string
  title: string | null
  content: string
  imageData: string | null
  location: string | null
  tags: string | null
  likesCount: number
  savesCount: number
  createdAt: string
}

type CommunityComment = {
  id: string
  postId: string
  authorName: string
  content: string
  createdAt: string
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return iso
  }
}

export default function CommunityPage() {
  const [posts, setPosts] = React.useState<CommunityPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")

  const [openComposer, setOpenComposer] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [form, setForm] = React.useState({ authorName: "", title: "", location: "", tags: "", content: "", imageData: "" })

  const [activePostId, setActivePostId] = React.useState<string | null>(null)
  const [comments, setComments] = React.useState<Record<string, CommunityComment[]>>({})
  const [commentDraft, setCommentDraft] = React.useState<Record<string, string>>({})
  const [loadingComments, setLoadingComments] = React.useState<Record<string, boolean>>({})

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch(`/api/community/posts?limit=30&q=${encodeURIComponent(q.trim())}`)
      const data = (await res.json()) as unknown
      setPosts(Array.isArray(data) ? (data as CommunityPost[]) : [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function like(postId: string) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p)))
    try {
      await fetch(`/api/community/posts/${postId}/like`, { method: "POST" })
    } catch {
      // noop
    }
  }

  async function save(postId: string) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, savesCount: p.savesCount + 1 } : p)))
    try {
      await fetch(`/api/community/posts/${postId}/save`, { method: "POST" })
    } catch {
      // noop
    }
  }

  async function openComments(postId: string) {
    setActivePostId(postId)
    if (comments[postId]) return
    setLoadingComments((m) => ({ ...m, [postId]: true }))
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`)
      const data = (await res.json()) as unknown
      setComments((m) => ({ ...m, [postId]: Array.isArray(data) ? (data as CommunityComment[]) : [] }))
    } catch {
      setComments((m) => ({ ...m, [postId]: [] }))
    } finally {
      setLoadingComments((m) => ({ ...m, [postId]: false }))
    }
  }

  async function addComment(postId: string) {
    const content = (commentDraft[postId] ?? "").trim()
    if (!content) return
    setCommentDraft((m) => ({ ...m, [postId]: "" }))

    const optimistic: CommunityComment = {
      id: `tmp-${Math.random().toString(16).slice(2)}`,
      postId,
      authorName: "Bạn",
      content,
      createdAt: new Date().toISOString(),
    }
    setComments((m) => ({ ...m, [postId]: [optimistic, ...(m[postId] ?? [])] }))

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: "Bạn", content }),
      })
      const data = (await res.json()) as CommunityComment
      if (data?.id) {
        setComments((m) => ({
          ...m,
          [postId]: (m[postId] ?? []).map((c) => (c.id === optimistic.id ? data : c)),
        }))
      }
    } catch {
      // noop
    }
  }

  async function createPost() {
    const content = form.content.trim()
    if (!content) return
    setCreating(true)
    try {
      await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: form.authorName || "Ẩn danh",
          title: form.title || null,
          location: form.location || null,
          tags: form.tags || null,
          content,
          imageData: form.imageData || null,
        }),
      })
      setOpenComposer(false)
      setForm({ authorName: "", title: "", location: "", tags: "", content: "", imageData: "" })
      await loadPosts()
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="bg-background overflow-x-hidden">
      {/* Header */}
      <section className="relative">
        <div className="absolute inset-0 vn-pattern opacity-[0.06]" />
        <div className="container mx-auto px-4 pt-24 md:pt-28 pb-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
                🤝 Cộng đồng
              </div>
              <h1 className="vn-title text-3xl md:text-5xl font-black mt-4">Feed hành trình xanh</h1>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Chia sẻ trải nghiệm, lưu lại khoảnh khắc và tương tác cùng mọi người.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm bài viết..."
                className="h-12 rounded-2xl bg-white/70 backdrop-blur-xl border-white/70"
              />
              <Button onClick={loadPosts} className="h-12 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                Tìm
              </Button>
              <Sheet open={openComposer} onOpenChange={setOpenComposer}>
                <SheetTrigger asChild>
                  <Button className="h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Chia sẻ hành trình
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:w-[520px] bg-background">
                  <div className="h-full flex flex-col">
                    <div className="p-6 border-b">
                      <div className="text-lg font-black text-primary">Chia sẻ hành trình</div>
                      <div className="text-sm text-muted-foreground">Viết bài, thêm ảnh, tag địa điểm.</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} placeholder="Tên hiển thị (tuỳ chọn)" className="h-11 rounded-2xl" />
                      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề (tuỳ chọn)" className="h-11 rounded-2xl" />
                      <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Địa điểm (vd: Hội An)" className="h-11 rounded-2xl" />
                      <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Tags (vd: eco, bike, food)" className="h-11 rounded-2xl" />
                      <Input value={form.imageData} onChange={(e) => setForm((f) => ({ ...f, imageData: e.target.value }))} placeholder="Link ảnh (tuỳ chọn)" className="h-11 rounded-2xl" />
                      <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Hôm nay bạn đã đi đâu? Trải nghiệm xanh thế nào?" className="min-h-[140px] rounded-2xl" />
                    </div>
                    <div className="p-6 border-t">
                      <Button
                        onClick={createPost}
                        disabled={creating || !form.content.trim()}
                        className="w-full h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]"
                      >
                        {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Đăng bài
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <Card className="vn-card">
                  <CardContent className="p-6">Đang tải feed...</CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card className="vn-card">
                  <CardContent className="p-6">Chưa có bài viết. Hãy là người đầu tiên chia sẻ.</CardContent>
                </Card>
              ) : (
                posts.map((p) => {
                  const img = p.imageData && p.imageData.trim() ? p.imageData : null
                  const isData = !!img && img.startsWith("data:")
                  return (
                    <Card key={p.id} className="vn-card overflow-hidden">
                      {img ? (
                        <div className="relative w-full h-64">
                          <Image src={img} alt={p.title ?? "Bài đăng"} fill className="object-cover" {...(isData ? { unoptimized: true } : {})} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </div>
                      ) : null}

                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-black text-primary">{p.authorName}</div>
                            <div className="text-xs text-muted-foreground">{fmtDate(p.createdAt)}</div>
                          </div>
                          {p.location ? (
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                              {p.location}
                            </div>
                          ) : null}
                        </div>
                        {p.title ? <div className="mt-3 text-xl font-black text-primary">{p.title}</div> : null}
                        <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.content}</div>
                        {p.tags ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {p.tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .slice(0, 8)
                              .map((t) => (
                                <span key={t} className="text-[10px] font-black uppercase tracking-[0.22em] bg-secondary/20 text-primary px-3 py-1.5 rounded-full">
                                  {t}
                                </span>
                              ))}
                          </div>
                        ) : null}
                      </CardHeader>

                      <CardFooter className="p-6 pt-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={() => like(p.id)} className="rounded-2xl hover:bg-primary/10">
                            <Heart className="w-5 h-5 mr-2 text-primary" />
                            <span className="font-black text-primary">{p.likesCount}</span>
                          </Button>
                          <Button variant="ghost" onClick={() => openComments(p.id)} className="rounded-2xl hover:bg-primary/10">
                            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                            <span className="font-black text-primary">Comment</span>
                          </Button>
                          <Button variant="ghost" onClick={() => save(p.id)} className="rounded-2xl hover:bg-primary/10">
                            <Bookmark className="w-5 h-5 mr-2 text-primary" />
                            <span className="font-black text-primary">{p.savesCount}</span>
                          </Button>
                        </div>
                      </CardFooter>

                      {/* Comments panel */}
                      {activePostId === p.id ? (
                        <div className="border-t border-white/60 bg-white/40">
                          <div className="p-6">
                            <div className="flex items-center justify-between gap-4">
                              <div className="font-black text-primary">Bình luận</div>
                              <Button variant="ghost" className="rounded-2xl" onClick={() => setActivePostId(null)}>
                                Đóng
                              </Button>
                            </div>

                            <div className="mt-4 flex gap-3">
                              <Input
                                value={commentDraft[p.id] ?? ""}
                                onChange={(e) => setCommentDraft((m) => ({ ...m, [p.id]: e.target.value }))}
                                placeholder="Viết bình luận..."
                                className="h-11 rounded-2xl bg-white/70"
                              />
                              <Button onClick={() => addComment(p.id)} className="h-11 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black">
                                Gửi
                              </Button>
                            </div>

                            <div className="mt-5 space-y-3">
                              {loadingComments[p.id] ? (
                                <div className="text-sm text-muted-foreground">Đang tải bình luận...</div>
                              ) : (comments[p.id] ?? []).length === 0 ? (
                                <div className="text-sm text-muted-foreground">Chưa có bình luận.</div>
                              ) : (
                                (comments[p.id] ?? []).map((c) => (
                                  <div key={c.id} className="rounded-2xl bg-white/70 border border-white/60 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="font-black text-primary text-sm">{c.authorName}</div>
                                      <div className="text-[10px] text-muted-foreground">{fmtDate(c.createdAt)}</div>
                                    </div>
                                    <div className="mt-2 text-sm text-muted-foreground">{c.content}</div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </Card>
                  )
                })
              )}
            </div>

            {/* Right rail */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="vn-card">
                <CardContent className="p-6">
                  <div className="text-sm font-black text-primary">Gợi ý</div>
                  <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    - Chia sẻ địa điểm, cách bạn giảm rác thải, tips đi xanh.
                    <br />- Tag: eco, bike, walk, local-food...
                  </div>
                </CardContent>
              </Card>
              <Card className="vn-card-vip">
                <CardContent className="p-6">
                  <div className="text-sm font-black text-primary">Thử ngay</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Đăng 1 bài review ngắn về tour bạn thích để cộng đồng cùng tham khảo.
                  </div>
                  <Button onClick={() => setOpenComposer(true)} className="mt-5 w-full h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Chia sẻ hành trình
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

