"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MapPin, Search, Leaf, Footprints, Bike, Trees, Star, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HomeMapSection } from "@/components/home/home-map-section"
import { PackageCard } from "@/components/packages/package-card"
import BlogCard from "@/components/blogs-card"
import type { Package } from "@/types/packages"
import type { BlogPost } from "@/types/blogs"

type Review = {
  id: string
  name: string
  location: string
  rating: number
  content: string
}

export default function HomePage() {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [packages, setPackages] = React.useState<Package[]>([])
  const [blogs, setBlogs] = React.useState<BlogPost[]>([])
  const [loadingPackages, setLoadingPackages] = React.useState(true)
  const [loadingBlogs, setLoadingBlogs] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetchPackages() {
      try {
        setLoadingPackages(true)
        const res = await fetch("/api/packages")
        const data = (await res.json()) as unknown
        if (cancelled) return
        setPackages(Array.isArray(data) ? (data as Package[]) : [])
      } catch {
        if (!cancelled) setPackages([])
      } finally {
        if (!cancelled) setLoadingPackages(false)
      }
    }

    async function fetchBlogs() {
      try {
        setLoadingBlogs(true)
        const res = await fetch("/api/blogs")
        const data = (await res.json()) as unknown
        if (cancelled) return
        setBlogs(Array.isArray(data) ? (data as BlogPost[]) : [])
      } catch {
        if (!cancelled) setBlogs([])
      } finally {
        if (!cancelled) setLoadingBlogs(false)
      }
    }

    fetchPackages()
    fetchBlogs()
    return () => {
      cancelled = true
    }
  }, [])

  const reviews: Review[] = [
    {
      id: "r1",
      name: "Minh Anh",
      location: "Hà Nội",
      rating: 5,
      content: "Tour làng nghề rất hay: gặp nghệ nhân, được tự tay làm thử và mang sản phẩm về làm kỷ niệm.",
    },
    {
      id: "r2",
      name: "Quang Huy",
      location: "Đà Nẵng",
      rating: 5,
      content: "Map gợi ý điểm đến rõ ràng, đặt tour nhanh. Team support nhiệt tình.",
    },
    {
      id: "r3",
      name: "Thảo Vy",
      location: "TP.HCM",
      rating: 4,
      content: "Rất thích phần cộng đồng và review — chọn tour làng nghề tự tin hơn.",
    },
  ]

  const hotTours = packages.slice(0, 6)
  const featuredPosts = blogs.slice(0, 3)

  const onSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const query = q.trim()
    if (!query) {
      router.push("/packages")
      return
    }
    router.push(`/packages?search=${encodeURIComponent(query)}`)
  }

  return (
    <main className="bg-background overflow-x-hidden">
      {/* 🔝 Hero */}
      <section className="relative min-h-[85vh] flex items-center pt-24 md:pt-32 pb-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-white/40" />
        <div className="absolute inset-0 vn-pattern opacity-[0.06] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-secondary/10 blur-3xl opacity-50" />
        <div className="absolute top-40 -left-32 w-[520px] h-[520px] rounded-full bg-primary/10 blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left max-w-3xl mx-auto lg:max-w-none">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em] border border-white/60 shadow-sm mb-6"
              >
                <Leaf className="w-4 h-4" />
                Hành trình làng nghề
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-black tracking-tight text-primary leading-[1.05]"
              >
                Khám phá <span className="text-secondary italic">Làng Nghề</span> <br className="hidden lg:block" />
                Việt Nam
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Tìm làng nghề, chọn tour trải nghiệm, xem review cộng đồng — và bắt đầu hành trình về nguồn cội ngay hôm nay.
              </motion.p>

              {/* Desktop Search Form */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:block mt-10"
              >
                <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 w-5 h-5" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      inputMode="search"
                      placeholder="Tìm làng nghề / tour trải nghiệm..."
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-sm outline-none focus:ring-2 focus:ring-secondary/40"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="h-14 rounded-2xl px-8 font-black uppercase tracking-[0.18em] text-[11px] bg-primary text-white hover:bg-primary/90"
                    >
                      Tìm kiếm
                    </Button>
                    <Link href="/dream-journey">
                      <Button className="h-14 rounded-2xl px-8 font-black uppercase tracking-[0.18em] text-[11px] bg-secondary text-primary hover:bg-secondary/90 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                        <span className="flex items-center gap-2">
                          Tạo hành trình
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </form>
              </motion.div>

              {/* Mobile Search Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:hidden mt-10 max-w-md mx-auto"
              >
                <form onSubmit={onSearch} className="p-2 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-emerald-100/50 backdrop-blur-xl flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-5 text-emerald-600/50 w-5 h-5" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      inputMode="search"
                      placeholder="Bạn muốn đi đâu?"
                      className="w-full h-14 pl-14 pr-4 rounded-3xl bg-transparent text-lg font-medium outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 h-14 rounded-[1.5rem] font-black uppercase text-[11px] bg-primary text-white">
                      Tìm kiếm
                    </Button>
                    <Link href="/dream-journey" className="flex-1">
                      <Button className="w-full h-14 rounded-[1.5rem] font-black uppercase text-[11px] bg-secondary text-primary">
                        Tạo chuyến đi
                      </Button>
                    </Link>
                  </div>
                </form>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center lg:justify-start items-center gap-3 text-xs"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-1 hidden lg:block">Phổ biến:</span>
                {["Lê Minh Xuân","Thái Mỹ", "Tân Thông Hội"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQ(tag)
                      router.push(`/packages?search=${encodeURIComponent(tag)}`)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/70 hover:bg-white transition-all text-primary font-bold shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    {tag}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Right Content (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="vn-card-vip overflow-hidden"
              >
                <div className="relative h-[480px] xl:h-[560px]">
                  <Image
                    src="/images/manh-truc.jpg"
                    alt="Điểm đến nổi bật"
                    fill
                    priority
                    className="object-cover"
                    sizes="520px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent" />
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      Điểm đến nổi bật
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      5.0
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass-morphism-dark rounded-3xl p-6 border border-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-white font-black text-xl">Mành trúc Tân Thông Hội</div>
                          <div className="text-white/70 text-sm mt-1">Làng nghề • Trải nghiệm • Di sản</div>
                        </div>
                        <Link href="/packages" className="shrink-0">
                          <Button className="h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px] px-6">
                            Xem tour <ArrowUpRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {[
                          { k: "Lịch trình", v: "Trong Ngày" },
                          { k: "Chủ đề", v: "Làng nghề" },
                          { k: "Phù hợp", v: "Gia đình" },
                        ].map((m) => (
                          <div key={m.k} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                            <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{m.k}</div>
                            <div className="text-white font-black text-xs xl:text-sm mt-1">{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 grid grid-cols-3 gap-4"
              >
                {[
                  { src: "/images/nhan-lmx.jpg", alt: "Làng nhang" },
                  { src: "/images/lang-dan-lat.jpg", alt: "Làng đan lát" },
                  { src: "/images/lo-banh-trang.jpg", alt: "Làng bánh tráng" },
                ].map((img, idx) => (
                  <div key={idx} className="vn-card h-24 overflow-hidden group">
                    <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗺️ Map preview */}
      <div id="map-preview" className="relative z-20 -mt-10 lg:-mt-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.12)] border-4 md:border-8 border-white bg-white relative">
            <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-30 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Khám phá trực quan</span>
            </div>
            <HomeMapSection />
          </div>
        </div>
      </div>

      {/* 🌾 Trải nghiệm làng nghề nổi bật */}
      <section className="py-14 md:py-20 bg-white/40 backdrop-blur-sm border-y border-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
                <Leaf className="w-4 h-4" />
                Trải nghiệm làng nghề
              </div>
              <h2 className="vn-title text-3xl md:text-4xl font-black mt-4">Chọn đúng trải nghiệm bạn yêu</h2>
            </div>
          </div>

          <div className="grid gap-5 md:gap-8 grid-cols-1 md:grid-cols-3">
            {[
              {
                title: "Tour làng nghề",
                desc: "Gặp nghệ nhân, nghe chuyện nghề, tham quan xưởng thủ công.",
                icon: Footprints,
                href: "/packages?type=walking",
              },
              {
                title: "Workshop trải nghiệm",
                desc: "Tự tay làm gốm, dệt, mây tre đan… và mang sản phẩm về.",
                icon: Bike,
                href: "/packages?type=bike",
              },
              {
                title: "Ẩm thực & văn hóa",
                desc: "Thưởng thức món địa phương, khám phá văn hóa vùng miền.",
                icon: Trees,
                href: "/packages?type=eco",
              },
            ].map((c) => (
              <Link key={c.title} href={c.href} className="vn-card p-6 group">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-white/70">
                    <c.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-primary">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.18em]">
                      Xem gợi ý <ArrowUpRight className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🤝 Cộng đồng */}
      <section className="py-14 md:py-20 vn-pattern">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
                <Leaf className="w-4 h-4" />
                Cộng đồng
              </div>
              <h2 className="vn-title text-3xl md:text-4xl font-black mt-4">Bài chia sẻ & Review</h2>
            </div>
            <Link href="/blogs" className="text-primary font-black uppercase tracking-[0.18em] text-xs hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {loadingBlogs ? (
                <div className="vn-card p-6">Đang tải bài viết...</div>
              ) : featuredPosts.length === 0 ? (
                <div className="vn-card p-6">Chưa có bài viết.</div>
              ) : (
                featuredPosts.map((b) => <BlogCard key={b.id} blog={b} />)
              )}
            </div>

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="vn-card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-black text-primary">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.location}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-secondary fill-secondary" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed italic">“{r.content}”</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🎁 Gói tour hot */}
      <section className="py-14 md:py-20 bg-white/40 backdrop-blur-sm border-y border-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
                <Leaf className="w-4 h-4" />
                Gói tour hot
              </div>
              <h2 className="vn-title text-3xl md:text-4xl font-black mt-4">Tour có sẵn (đẹp & dễ chọn)</h2>
            </div>
            <Link href="/packages" className="text-primary font-black uppercase tracking-[0.18em] text-xs hover:underline">
              Xem tất cả
            </Link>
          </div>

          {loadingPackages ? (
            <div className="vn-card p-6">Đang tải gói tour...</div>
          ) : hotTours.length === 0 ? (
            <div className="vn-card p-6">Chưa có gói tour.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {hotTours.map((p) => (
                <PackageCard key={p.id} package={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 📌 CTA cuối trang */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 vn-pattern-gold opacity-[0.04]" />
        <div className="container mx-auto px-4 relative">
          <div className="vn-card-vip p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-serif font-black text-primary leading-tight">
                  Bắt đầu hành trình về nguồn cội
                </h2>
                <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
                  Tạo hành trình riêng của bạn, tối ưu tuyến đi, chọn workshop trải nghiệm và lưu lại kỷ niệm đáng nhớ.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link href="/dream-journey" className="w-full sm:w-auto">
                  <Button className="w-full h-12 rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[11px] bg-secondary text-primary hover:bg-secondary/90">
                    <span className="flex items-center justify-center gap-2">
                      Tạo hành trình
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
                <Link href="/packages" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[11px] border-primary/20 text-primary bg-white/60 hover:bg-white"
                  >
                    Xem gói tour
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
