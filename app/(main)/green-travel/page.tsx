"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Bike, Footprints, Leaf, Trees, Wind, Droplets, Recycle, ArrowUpRight, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

function formatNumber(n: number) {
  try {
    return n.toLocaleString("vi-VN")
  } catch {
    return String(n)
  }
}

export default function GreenTravelPage() {
  const [metrics, setMetrics] = React.useState<{
    co2SavedKg: number
    plasticSavedKg: number
    treesEquivalent: number
    greenBookingsCount: number
    greenGuests: number
    greenKm: number
  } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/green-metrics")
        const data = (await res.json()) as unknown
        if (cancelled) return
        if (data && typeof data === "object") setMetrics(data as typeof metrics)
      } catch {
        if (!cancelled) setMetrics(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const co2Kg = useCountUp(metrics?.co2SavedKg ?? 0)
  const plasticKg = useCountUp(Math.round((metrics?.plasticSavedKg ?? 0) * 10))
  const trees = useCountUp(metrics?.treesEquivalent ?? 0)

  return (
    <main className="bg-background overflow-x-hidden">
      {/* 🌿 Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/forest.jpg"
            alt="Du lịch xanh"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/55 to-background" />
          <div className="absolute inset-0 vn-pattern opacity-[0.10]" />
        </div>

        <div className="container mx-auto px-4 pt-28 md:pt-32 pb-16 md:pb-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-[10px] md:text-xs font-black text-white uppercase tracking-[0.22em] border border-white/15 backdrop-blur-xl"></div>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-[1.05] drop-shadow-2xl">
              Du lịch không phát thải
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed max-w-2xl">
              Chọn cách di chuyển & trải nghiệm ít carbon: đi bộ, xe đạp, sinh thái. Vừa đẹp cho hành trình, vừa tốt cho môi trường.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/explore" className="w-full sm:w-auto">
                <Button className="w-full h-12 rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[11px] bg-secondary text-primary hover:bg-secondary/90">
                  Khám phá trên bản đồ <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/packages" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[11px] border-white/30 text-white bg-white/10 hover:bg-white/20"
                >
                  Xem gói tour xanh
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 Danh mục */}
      <section className="py-14 md:py-20 bg-white/40 backdrop-blur-sm border-y border-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
                <Trees className="w-4 h-4 text-secondary" />
                Danh mục du lịch xanh
              </div>
              <h2 className="vn-title text-3xl md:text-4xl font-black mt-4">Chọn hành trình phù hợp</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Mỗi danh mục là một “cách xanh” khác nhau: giảm phát thải, ưu tiên trải nghiệm địa phương và bảo tồn hệ sinh thái.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "🚶 Đi bộ",
                desc: "Chậm mà sâu: văn hoá, ẩm thực, con người.",
                icon: Footprints,
                href: "/packages?type=walking",
                img: "/images/hoian.jpg",
              },
              {
                title: "🚴 Xe đạp",
                desc: "Vui – khoẻ – ít carbon: đi xa hơn nhưng vẫn xanh.",
                icon: Bike,
                href: "/packages?type=bike",
                img: "/images/danang.jpg",
              },
              {
                title: "🌳 Sinh thái",
                desc: "Gắn với thiên nhiên: bảo tồn, giáo dục, trải nghiệm bền vững.",
                icon: Leaf,
                href: "/packages?type=eco",
                img: "/images/forest.jpg",
              },
            ].map((c) => (
              <Link key={c.title} href={c.href} className="vn-card group overflow-hidden">
                <div className="relative h-44">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
                </div>
                <div className="p-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                      <c.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-primary">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.18em]">
                        Xem tour <ArrowUpRight className="w-4 h-4 text-secondary" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 📊 Info (ăn điểm đồ án) */}
      <section className="py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 vn-pattern-gold opacity-[0.04]" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
                <BarChart3 className="w-4 h-4" />
                Impact
              </div>
              <h2 className="vn-title text-3xl md:text-4xl font-black mt-4">
                CO₂ tiết kiệm & lợi ích môi trường
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Chỉ số được tính trực tiếp từ database dựa trên booking gói tour có itinerary “WALK/BIKE” và distanceKm.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Wind, title: "CO₂ tiết kiệm", value: `${formatNumber(co2Kg)} kg`, note: loading ? "đang tính..." : `từ ${formatNumber(metrics?.greenKm ?? 0)} km xanh`, color: "bg-primary/10" },
                  { icon: Recycle, title: "Nhựa giảm", value: `${formatNumber(plasticKg / 10)} kg`, note: loading ? "đang tính..." : `từ ${formatNumber(metrics?.greenBookingsCount ?? 0)} booking xanh`, color: "bg-secondary/20" },
                  { icon: Trees, title: "Cây tương đương", value: `${formatNumber(trees)}`, note: loading ? "đang tính..." : "quy đổi hấp thụ CO₂/năm", color: "bg-primary/10" },
                  { icon: Droplets, title: "Khách xanh", value: `${formatNumber(metrics?.greenGuests ?? 0)}`, note: loading ? "đang tính..." : "tổng khách trong tour xanh", color: "bg-secondary/20" },
                ].map((s) => (
                  <div key={s.title} className={`vn-card p-6 ${s.color}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/70 border border-white/70 flex items-center justify-center">
                        <s.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                          {s.title}
                        </div>
                        <div className="mt-2 text-2xl font-black text-primary">{s.value}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{s.note}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="vn-card-vip overflow-hidden">
                <div className="relative h-[340px] md:h-[420px]">
                  <Image
                    src="/images/travel_detsinations.jpg"
                    alt="Green impact"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="glass-morphism-dark rounded-[2.5rem] p-6 border border-white/10">
                      <div className="text-white font-black text-2xl md:text-3xl font-serif">
                        “Mỗi bước chân là một đóng góp xanh.”
                      </div>
                      <p className="mt-3 text-white/70 text-sm md:text-base leading-relaxed">
                        Ưu tiên đi bộ/xe đạp, hỗ trợ địa phương, nói không với nhựa dùng một lần, và tôn trọng thiên nhiên.
                      </p>
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <Link href="/explore" className="w-full sm:w-auto">
                          <Button className="w-full h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                            Xem bản đồ xanh <ArrowUpRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Link href="/dream-journey" className="w-full sm:w-auto">
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl bg-white/10 text-white border-white/20 hover:bg-white/20 font-black uppercase tracking-[0.18em] text-[11px]"
                          >
                            Tạo hành trình
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white/40 backdrop-blur-sm border-t border-white">
        <div className="container mx-auto px-4">
          <div className="vn-card p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h3 className="text-3xl md:text-5xl font-serif font-black text-primary leading-tight">
                  Bắt đầu hành trình xanh ngay
                </h3>
                <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
                  Chọn danh mục phù hợp và khám phá các tour bền vững dành riêng cho bạn.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link href="/packages" className="w-full sm:w-auto">
                  <Button className="w-full h-12 rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[11px] bg-primary text-white hover:bg-primary/90">
                    Xem gói tour
                  </Button>
                </Link>
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button className="w-full h-12 rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[11px] bg-secondary text-primary hover:bg-secondary/90">
                    Mở bản đồ <ArrowUpRight className="w-4 h-4 ml-2" />
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

