"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Search, SlidersHorizontal, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Destination } from "@/types/destinations"

type PlaceType = "all" | "pottery" | "silk" | "bamboo" | "food" | "wood"

function normalizeText(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

function guessTypeFromTags(tags: string[]): PlaceType {
  const t = tags.map((x) => normalizeText(x))
  const has = (needle: string) => t.some((x) => x.includes(needle))

  if (has("gom") || has("ceramic") || has("pottery") || has("bat trang")) return "pottery"
  if (has("lua") || has("silk") || has("van phuc") || has("det")) return "silk"
  if (has("may") || has("tre") || has("bamboo") || has("dan")) return "bamboo"
  if (has("am thuc") || has("food") || has("banh") || has("mon")) return "food"
  if (has("go") || has("moc") || has("wood") || has("carving")) return "wood"
  return "all"
}

function formatVnd(amount: number) {
  try {
    return amount.toLocaleString("vi-VN") + " VNĐ"
  } catch {
    return `${amount} VNĐ`
  }
}

export default function ExplorePage() {
  const DestinationsMap = React.useMemo(
    () =>
      dynamic(() => import("@/components/ui/DestinationsMap"), {
        ssr: false,
        loading: () => (
          <div className="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center">
            Đang tải bản đồ...
          </div>
        ),
      }),
    []
  )

  const [destinations, setDestinations] = React.useState<Destination[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [regionLabel, setRegionLabel] = React.useState("Việt Nam")

  const [q, setQ] = React.useState("")
  const [type, setType] = React.useState<PlaceType>("all")
  const [maxPrice, setMaxPrice] = React.useState<number>(0)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/destinations")
        if (!res.ok) throw new Error("Failed to load destinations")
        const data = (await res.json()) as unknown
        const list = Array.isArray(data) ? (data as Destination[]) : []
        if (cancelled) return
        const vn = list.filter((d) => normalizeText(d.country || "").includes("viet"))
        const scoped = vn.length > 0 ? vn : list
        setDestinations(scoped)
        setRegionLabel(vn.length > 0 ? "Việt Nam" : "Tất cả")

        const max = scoped.reduce((m, d) => Math.max(m, Number(d.amount) || 0), 0)
        setMaxPrice(max || 0)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load destinations")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = React.useMemo(() => {
    const query = normalizeText(q.trim())
    return destinations.filter((d) => {
      const priceOk = maxPrice <= 0 ? true : (Number(d.amount) || 0) <= maxPrice
      const typeOk =
        type === "all"
          ? true
          : guessTypeFromTags(Array.isArray(d.tags) ? d.tags : []) === type

      if (!query) return priceOk && typeOk

      const hay = normalizeText(`${d.name} ${d.city} ${d.country} ${(d.tags || []).join(" ")}`)
      return priceOk && typeOk && hay.includes(query)
    })
  }, [destinations, maxPrice, q, type])

  const Sidebar = (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
              Làng Nghề Travel
            </div>
            <div className="text-xl font-black text-primary truncate">Bản đồ làng nghề</div>
            <div className="mt-1 text-xs text-muted-foreground font-medium truncate">
              Tìm làng nghề, workshop và trải nghiệm văn hóa ({regionLabel})
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
            <MapPin className="w-4 h-4 text-secondary" />
            {filtered.length}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputMode="search"
              placeholder="Tìm làng nghề (Bát Tràng, Vạn Phúc...)"
              className="w-full h-12 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Bát Tràng",
              "Vạn Phúc",
              "Kim Bồng",
              "Thanh Hà",
              "Phú Vinh",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQ(tag)}
                className="inline-flex items-center rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary hover:bg-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                <SlidersHorizontal className="w-4 h-4 text-secondary" />
                Chủ đề
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { v: "all" as const, label: "Tất cả" },
                  { v: "pottery" as const, label: "Gốm" },
                  { v: "silk" as const, label: "Lụa" },
                  { v: "bamboo" as const, label: "Mây tre" },
                  { v: "wood" as const, label: "Mộc" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setType(opt.v)}
                    className={[
                      "h-8 px-3 rounded-full border text-[10px] font-black uppercase tracking-[0.18em] transition-colors",
                      type === opt.v
                        ? "bg-primary text-white border-primary"
                        : "bg-white/70 text-primary border-white/70 hover:bg-white",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                Giá tối đa
              </div>
              <div className="mt-2 text-sm font-black text-primary truncate">
                {maxPrice > 0 ? formatVnd(maxPrice) : "—"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl px-4 py-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, destinations.reduce((m, d) => Math.max(m, Number(d.amount) || 0), 0))}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-primary/60">
              <span>0</span>
              <span>Max</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/40 p-4 text-sm text-muted-foreground">
            Đang tải danh sách...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/60 p-5 text-sm text-muted-foreground backdrop-blur-xl">
            <div className="font-black text-primary mb-1">Không có kết quả phù hợp</div>
            <div className="text-xs leading-relaxed">
              Thử đổi từ khóa, chọn lại chủ đề, hoặc tăng mức giá tối đa để thấy nhiều điểm hơn.
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQ("")
                  setType("all")
                }}
                className="h-10 px-4 rounded-2xl border border-white/70 bg-white text-primary text-[11px] font-black uppercase tracking-[0.18em] hover:bg-white/90"
              >
                Xóa lọc
              </button>
              <Link href="/packages" className="flex-1">
                <Button className="w-full h-10 rounded-2xl font-black uppercase tracking-[0.18em] text-[11px] bg-secondary text-primary hover:bg-secondary/90">
                  Xem gói tour
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filtered.map((d) => {
            const img = typeof d.imageData === "string" && d.imageData.trim() ? d.imageData : "/images/travel_detsinations.jpg"
            const isData = typeof img === "string" && img.startsWith("data:")
            const href = `/destinations/${d.country.toLowerCase()}/${d.id}`
            return (
              <Link
                key={d.id}
                href={href}
                className="group block rounded-2xl border border-white/10 bg-white/60 hover:bg-white/80 transition-colors backdrop-blur-xl overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/50">
                    <Image
                      src={img}
                      alt={d.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      {...(isData ? { unoptimized: true } : {})}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-primary truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {d.city}, {d.country}
                    </div>
                    <div className="mt-1 text-xs font-black text-primary">{formatVnd(d.amount)}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-secondary group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )
          })
        )}
      </div>

      <div className="px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+18px)] border-t border-white/10 bg-white/40 backdrop-blur-xl">
        <Link href="/packages" className="block">
          <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-[0.18em] text-[12px] bg-secondary text-primary hover:bg-secondary/90">
            Xem gói tour
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <main className="relative h-[calc(100vh-64px)] overflow-hidden">
      {/* FULL MAP */}
      {/* Offset down to sit nicely under the fixed navbar */}
      <div className="absolute left-0 right-0 bottom-0 top-[76px] md:top-[88px]">
        <DestinationsMap
          destinations={filtered}
          highlightCountry="Vietnam"
          // Vietnam viewport (a bit wider for better context)
          fixedBounds={{ south: 7.2, west: 101.6, north: 23.8, east: 110.8 }}
          lockToBounds
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <div className="hidden lg:flex absolute top-6 right-6 z-[60] pointer-events-none">
        <div className="pointer-events-none rounded-[2rem] border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.12)] px-6 py-5 max-w-[420px]">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">Trang khám phá</div>
          <div className="mt-1 text-xl font-black text-primary">Khám phá làng nghề trên bản đồ</div>
          <div className="mt-2 text-sm text-muted-foreground font-medium leading-relaxed">
            Click vào marker để xem chi tiết điểm đến, hình ảnh và giá tham khảo.
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block absolute left-5 top-5 bottom-5 w-[380px] z-[60]">
        <div className="h-full rounded-[2rem] border border-white/20 bg-white/30 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-hidden">
          {Sidebar}
        </div>
      </div>

      {/* Mobile: bottom sheet trigger */}
      <div className="lg:hidden absolute left-0 right-0 top-[calc(env(safe-area-inset-top)+76px)] z-[60] px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-2xl border border-white/20 bg-white/60 backdrop-blur-2xl px-4 py-3 shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
              Khám phá
            </div>
            <div className="text-sm font-black text-primary">Bản đồ địa điểm</div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px] shadow-lg">
                Danh sách ({filtered.length})
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-0 h-[85vh] rounded-t-[2.5rem] border-t-white/10 bg-white/70 backdrop-blur-2xl">
              {Sidebar}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </main>
  )
}

