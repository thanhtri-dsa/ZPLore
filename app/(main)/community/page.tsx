"use client"

import * as React from "react"
import Image from "next/image"
import { Heart, MessageCircle, Bookmark, Plus, Send, Loader2, Gift, ShieldAlert, Leaf, Trophy, History, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

type EcoReward = {
  id: string
  title: string
  description: string
  pointsRequired: number
  stock: number
  imageData: string | null
}

type EcoPointLog = {
  id: string
  actionType: string
  pointsChange: number
  description: string
  createdAt: string
  reward?: EcoReward
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return iso
  }
}

export default function CommunityPage() {
  const { toast } = useToast()
  const [posts, setPosts] = React.useState<CommunityPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")

  // Eco Features State
  const [ecoPoints, setEcoPoints] = React.useState<number>(0)
  const [pointLogs, setPointLogs] = React.useState<EcoPointLog[]>([])
  const [rewards, setRewards] = React.useState<EcoReward[]>([])
  const [loadingEco, setLoadingEco] = React.useState(true)
  const [redeeming, setRedeeming] = React.useState<string | null>(null)

  // Report State
  const [openReport, setOpenReport] = React.useState(false)
  const [reporting, setReporting] = React.useState(false)
  const [reportForm, setReportForm] = React.useState({ description: "", proofImageData: "" })

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

  async function loadEcoData() {
    setLoadingEco(true)
    try {
      // Load points and logs
      const pointsRes = await fetch("/api/eco/points")
      if (pointsRes.ok) {
        const pointsData = await pointsRes.json()
        setEcoPoints(pointsData.ecoPoints || 0)
        setPointLogs(pointsData.pointLogs || [])
      }

      // Load rewards
      const rewardsRes = await fetch("/api/eco/rewards")
      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json()
        setRewards(Array.isArray(rewardsData) ? rewardsData : [])
      }
    } catch (error) {
      console.error("Error loading eco data:", error)
    } finally {
      setLoadingEco(false)
    }
  }

  React.useEffect(() => {
    loadPosts()
    loadEcoData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function redeemReward(rewardId: string) {
    setRedeeming(rewardId)
    try {
      const res = await fetch("/api/eco/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Thành công", description: "Bạn đã đổi thưởng thành công!" })
        setEcoPoints(data.ecoPoints)
        loadEcoData()
      } else {
        toast({ title: "Lỗi", description: data.error || "Không thể đổi thưởng", variant: "destructive" })
      }
    } catch {
      toast({ title: "Lỗi", description: "Đã có lỗi xảy ra", variant: "destructive" })
    } finally {
      setRedeeming(null)
    }
  }

  async function submitReport() {
    if (!reportForm.description.trim()) return
    setReporting(true)
    try {
      const res = await fetch("/api/eco/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      })
      if (res.ok) {
        toast({ title: "Đã gửi báo cáo", description: "Cảm ơn bạn đã góp phần bảo vệ môi trường." })
        setOpenReport(false)
        setReportForm({ description: "", proofImageData: "" })
      } else {
        toast({ title: "Lỗi", description: "Không thể gửi báo cáo", variant: "destructive" })
      }
    } catch {
      toast({ title: "Lỗi", description: "Đã có lỗi xảy ra", variant: "destructive" })
    } finally {
      setReporting(false)
    }
  }

... (rest of original functions like like, save, openComments, addComment, createPost)

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
      {/* Header - Mobile Optimized */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 vn-pattern opacity-[0.04]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
        <div className="container mx-auto px-4 pt-24 md:pt-32 pb-8 md:pb-12 relative">
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] border border-emerald-100 w-fit"
            >
              <Leaf className="w-3.5 h-3.5" />
              Eco Community
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-6xl font-serif font-black text-primary leading-tight"
            >
              Hành trình <br className="md:hidden" /> <span className="text-emerald-600 italic">Di sản xanh</span>
            </motion.h1>
            
            {/* Mobile Point Summary Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="md:hidden mt-2 p-4 rounded-3xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-emerald-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Điểm tích lũy</div>
                  <div className="text-xl font-black text-primary leading-none">{ecoPoints}</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="rounded-xl h-9 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50">
                Chi tiết <ArrowUpRight className="ml-1 w-3 h-3" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content with Tabs - Sticky for Mobile */}
      <section className="pb-24 relative">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="feed" className="space-y-6 md:space-y-10">
            <div className="sticky top-[72px] z-40 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-slate-100 md:static md:bg-transparent md:border-none md:p-0 md:m-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 h-auto flex w-full md:w-fit overflow-x-auto no-scrollbar">
                  <TabsTrigger value="feed" className="flex-1 md:flex-none rounded-xl px-4 md:px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap">
                    Feed
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="flex-1 md:flex-none rounded-xl px-4 md:px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all whitespace-nowrap">
                    Quà tặng
                  </TabsTrigger>
                  <TabsTrigger value="impact" className="flex-1 md:flex-none rounded-xl px-4 md:px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all whitespace-nowrap">
                    Tác động
                  </TabsTrigger>
                </TabsList>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    onClick={() => setOpenReport(true)} 
                    variant="outline" 
                    className="flex-1 md:flex-none h-11 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-black uppercase tracking-[0.1em] text-[10px] bg-white shadow-sm"
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Báo cáo
                  </Button>
                  <Button 
                    onClick={() => setOpenComposer(true)}
                    className="flex-1 md:flex-none h-11 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.1em] text-[10px] shadow-lg shadow-secondary/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Đăng bài
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="feed" className="m-0 focus-visible:outline-none">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4 md:space-y-8">
                  {/* Search Bar Mobile */}
                  <div className="md:hidden relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Tìm hành trình xanh..."
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none font-medium text-sm"
                    />
                  </div>
... (existing posts mapping with mobile refinements)

                          {activePostId === p.id ? (
                            <div className="bg-slate-50/50 border-t border-slate-100">
                              <div className="p-6">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">Tất cả bình luận</div>
                                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest" onClick={() => setActivePostId(null)}>
                                    Đóng
                                  </Button>
                                </div>

                                <div className="flex gap-2">
                                  <Input
                                    value={commentDraft[p.id] ?? ""}
                                    onChange={(e) => setCommentDraft((m) => ({ ...m, [p.id]: e.target.value }))}
                                    placeholder="Viết phản hồi của bạn..."
                                    className="h-11 rounded-xl bg-white border-slate-200"
                                  />
                                  <Button onClick={() => addComment(p.id)} className="h-11 rounded-xl bg-primary px-6 font-black uppercase tracking-widest text-[10px]">
                                    Gửi
                                  </Button>
                                </div>

                                <div className="mt-6 space-y-4">
                                  {loadingComments[p.id] ? (
                                    <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-300" /></div>
                                  ) : (comments[p.id] ?? []).length === 0 ? (
                                    <div className="text-center py-8 text-sm text-slate-400 font-bold">Hãy là người đầu tiên bình luận!</div>
                                  ) : (
                                    (comments[p.id] ?? []).map((c) => (
                                      <div key={c.id} className="flex gap-3">
                                        <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center font-black text-[10px] uppercase">
                                          {c.authorName.charAt(0)}
                                        </div>
                                        <div className="flex-1 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                                          <div className="flex items-center justify-between gap-3 mb-1">
                                            <div className="font-black text-primary text-xs">{c.authorName}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase">{fmtDate(c.createdAt)}</div>
                                          </div>
                                          <div className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</div>
                                        </div>
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

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Eco Status Card */}
                  <Card className="vn-card-vip bg-emerald-600 text-white border-none shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <Leaf className="w-32 h-32" />
                    </div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Điểm xanh của bạn</div>
                          <div className="text-4xl font-black tracking-tighter">{ecoPoints}</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/10 border border-white/10">
                          <div className="text-xs font-bold leading-relaxed">
                            Mỗi hành động xanh (đi bộ, không dùng nhựa, report đúng...) đều tích lũy điểm thưởng!
                          </div>
                        </div>
                        <Button variant="secondary" onClick={() => {}} className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] bg-white text-emerald-700 hover:bg-emerald-50">
                          Xem bảng xếp hạng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="vn-card border-none shadow-sm">
                    <CardHeader className="p-6">
                      <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Gợi ý cộng đồng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-4">
                      {[
                        "Chia sẻ cách bạn giảm rác thải khi du lịch.",
                        "Review tour làng nghề dưới góc độ bảo tồn.",
                        "Báo cáo hành vi gây hại môi trường để nhận điểm.",
                      ].map((txt, i) => (
                        <div key={i} className="flex gap-3 text-sm text-muted-foreground font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {txt}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loadingEco ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="vn-card h-80 animate-pulse bg-slate-100" />
                  ))
                ) : rewards.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <Gift className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                    <div className="text-lg font-black text-slate-400">Chưa có phần thưởng khả dụng.</div>
                  </div>
                ) : (
                  rewards.map((r) => (
                    <Card key={r.id} className="vn-card overflow-hidden border-none shadow-sm flex flex-col group">
                      <div className="relative h-48 bg-slate-100">
                        {r.imageData ? (
                          <Image src={r.imageData} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Gift className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                          {r.pointsRequired} Điểm
                        </div>
                      </div>
                      <CardHeader className="p-6 flex-1">
                        <CardTitle className="text-lg font-black text-primary leading-tight">{r.title}</CardTitle>
                        <CardDescription className="text-xs font-medium line-clamp-2 mt-2">{r.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-6 pt-0">
                        <Button
                          disabled={ecoPoints < r.pointsRequired || r.stock <= 0 || redeeming === r.id}
                          onClick={() => redeemReward(r.id)}
                          className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-white hover:bg-primary/90"
                        >
                          {redeeming === r.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                          {r.stock <= 0 ? 'Hết kho' : (ecoPoints < r.pointsRequired ? 'Thiếu điểm' : 'Đổi ngay')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="impact" className="m-0">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <Card className="vn-card border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        Lịch sử điểm xanh
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {pointLogs.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-bold">Chưa có hoạt động nào.</div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {pointLogs.map((log) => (
                            <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.pointsChange > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                  {log.pointsChange > 0 ? <Plus className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="text-sm font-black text-primary">{log.description}</div>
                                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{fmtDate(log.createdAt)}</div>
                                </div>
                              </div>
                              <div className={`text-lg font-black ${log.pointsChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {log.pointsChange > 0 ? '+' : ''}{log.pointsChange}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4">
                  <Alert className="bg-amber-50 border-amber-100 text-amber-900 rounded-3xl p-6">
                    <Info className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-black text-sm uppercase tracking-widest mb-2 ml-2">Lưu ý bảo mật</AlertTitle>
                    <AlertDescription className="text-xs font-bold leading-relaxed ml-2">
                      Hệ thống Eco-Tour khuyến khích các hành vi văn minh. Mọi báo cáo sai sự thật có thể bị trừ điểm nặng hoặc khóa tài khoản vĩnh viễn.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Report Modal */}
      <Sheet open={openReport} onOpenChange={setOpenReport}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] h-auto max-h-[90vh] p-0 overflow-hidden bg-white border-none shadow-2xl">
          <div className="max-w-2xl mx-auto flex flex-col h-full">
            <SheetHeader className="p-8 text-center border-b border-slate-50">
              <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <SheetTitle className="text-2xl font-black text-primary tracking-tight">Báo cáo vi phạm quy tắc Eco</SheetTitle>
              <div className="text-sm text-muted-foreground font-medium">Giúp chúng tôi giữ gìn làng nghề xanh bằng cách báo cáo các hành vi sai lệch.</div>
            </SheetHeader>
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mô tả vi phạm</label>
                <Textarea 
                  value={reportForm.description}
                  onChange={(e) => setReportForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Vui lòng mô tả chi tiết sự việc (địa điểm, thời gian, hành vi...)" 
                  className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ảnh bằng chứng (URL)</label>
                <Input 
                  value={reportForm.proofImageData}
                  onChange={(e) => setReportForm(f => ({ ...f, proofImageData: e.target.value }))}
                  placeholder="https://... hoặc link ảnh đính kèm" 
                  className="h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
              <Button variant="ghost" onClick={() => setOpenReport(false)} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                Hủy bỏ
              </Button>
              <Button 
                onClick={submitReport}
                disabled={reporting || !reportForm.description.trim()}
                className="flex-[2] h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-black uppercase tracking-widest text-[10px]"
              >
                {reporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                Gửi báo cáo ngay
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}

