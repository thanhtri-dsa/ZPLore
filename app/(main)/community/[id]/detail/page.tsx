/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import * as React from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MessageCircle, Bookmark, ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { safeImageSrc } from '@/lib/image'

type CommunityComment = {
  id: string
  postId: string
  authorName: string
  content: string
  createdAt: string
}

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
  comments?: CommunityComment[]
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function initialChar(name: string | null | undefined) {
  const s = String(name ?? '').trim()
  return s ? s.charAt(0).toUpperCase() : '?'
}

export default function CommunityDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const postId = params.id

  const [post, setPost] = React.useState<CommunityPost | null>(null)
  const [comments, setComments] = React.useState<CommunityComment[]>([])
  const [loading, setLoading] = React.useState(true)

  const [commentDraft, setCommentDraft] = React.useState('')
  const [loadingComments, setLoadingComments] = React.useState(false)
  const [busyAction, setBusyAction] = React.useState<'like' | 'save' | 'comment' | null>(null)

  const load = React.useCallback(async () => {
    if (!postId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/community/posts/${postId}`)
      if (!res.ok) throw new Error('Failed to load post')
      const data = (await res.json()) as CommunityPost
      setPost(data)
      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch (e) {
      console.error(e)
      toast({ title: 'Lỗi', description: 'Không tải được bài viết.', variant: 'destructive' })
      setPost(null)
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [postId, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  async function like(id: string) {
    if (!post) return
    setBusyAction('like')
    setPost((p) => (p ? { ...p, likesCount: p.likesCount + 1 } : p))
    try {
      await fetch(`/api/community/posts/${id}/like`, { method: 'POST' })
    } catch {
      // optimistic UI
    } finally {
      setBusyAction(null)
    }
  }

  async function save(id: string) {
    if (!post) return
    setBusyAction('save')
    setPost((p) => (p ? { ...p, savesCount: p.savesCount + 1 } : p))
    try {
      await fetch(`/api/community/posts/${id}/save`, { method: 'POST' })
    } catch {
      // optimistic UI
    } finally {
      setBusyAction(null)
    }
  }

  async function loadLatestComments() {
    if (!postId) return
    setLoadingComments(true)
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`)
      const data = (await res.json()) as CommunityComment[]
      setComments(Array.isArray(data) ? data : [])
    } catch {
      // keep current list
    } finally {
      setLoadingComments(false)
    }
  }

  async function addComment() {
    if (!postId) return
    const content = commentDraft.trim()
    if (!content) return

    const optimistic: CommunityComment = {
      id: `tmp-${Math.random().toString(16).slice(2)}`,
      postId,
      authorName: 'Bạn',
      content,
      createdAt: new Date().toISOString(),
    }

    setCommentDraft('')
    setComments((prev) => [optimistic, ...prev])
    setBusyAction('comment')

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: 'Bạn', content }),
      })
      if (res.ok) {
        // Refresh the list so ids/counts are consistent
        await loadLatestComments()
      }
    } catch {
      // optimistic UI remains
    } finally {
      setBusyAction(null)
    }
  }

  if (loading || !post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    )
  }

  const img = post.imageData && post.imageData.trim()
    ? safeImageSrc(post.imageData, '/images/travel_detsinations.jpg')
    : null
  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <main className="bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/community')} className="rounded-xl">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Quay lại
          </Button>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Chi tiết bài viết
          </div>
        </div>

        <Card className="vn-card overflow-hidden border-none shadow-sm">
          {img ? (
            <div className="relative w-full h-64">
              <Image
                src={img}
                alt={post.title ?? 'Bài đăng'}
                fill
                className="object-cover"
                {...(img?.startsWith('data:') ? { unoptimized: true } : {})}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : null}

          <CardHeader className="p-5 md:p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700 uppercase border border-emerald-200">
                {initialChar(post.authorName)}
              </div>
              <div>
                <div className="text-sm font-black text-primary">{post.authorName}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{fmtDate(post.createdAt)}</div>
              </div>
            </div>

            {post.title ? (
              <div className="mt-4 text-2xl md:text-3xl font-black text-primary tracking-tight leading-tight">{post.title}</div>
            ) : null}

            {post.location ? (
              <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 w-fit">
                {post.location}
              </div>
            ) : null}

            <div className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
              {post.content}
            </div>

            {tags.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="text-[9px] font-black uppercase tracking-[0.2em] bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100">
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </CardHeader>

          <CardFooter className="p-5 md:p-8 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => like(post.id)}
                disabled={busyAction !== null}
                className="rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors h-10 px-3 md:px-4">
                <Heart className="w-5 h-5 mr-2" />
                <span className="font-black">{post.likesCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const el = document.getElementById('comments')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                disabled={busyAction !== null}
                className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors h-10 px-3 md:px-4">
                <MessageCircle className="w-5 h-5 mr-2" />
                <span className="font-black">Bình luận</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => save(post.id)}
                disabled={busyAction !== null}
                className="rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors h-10 px-3 md:px-4">
                <Bookmark className="w-5 h-5 mr-2" />
                <span className="font-black">{post.savesCount}</span>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div id="comments" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Bình luận</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              {loadingComments ? 'Đang tải…' : `${comments.length} bình luận`}
            </div>
          </div>

          <div className="flex gap-2">
            <Textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="Chia sẻ cảm nghĩ của bạn..."
              className="min-h-[54px] rounded-2xl bg-white border-slate-200"
            />
            <Button
              onClick={() => void addComment()}
              disabled={busyAction !== null}
              className="h-12 rounded-2xl bg-primary px-6 font-black uppercase tracking-widest text-[10px]">
              {busyAction === 'comment' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi'}
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {loadingComments ? (
              <div className="text-center py-4 text-slate-400 font-bold">Đang tải bình luận…</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 font-bold">Hãy là người đầu tiên bình luận!</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center font-black text-[10px] uppercase">
                    {initialChar(c.authorName)}
                  </div>
                  <div className="flex-1 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="font-black text-primary text-xs">{c.authorName}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">{fmtDate(c.createdAt)}</div>
                    </div>
                    <div className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{c.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

