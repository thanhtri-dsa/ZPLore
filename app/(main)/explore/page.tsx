"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Search, SlidersHorizontal, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Destination } from "@/types/destinations"

type PlaceType = "all" | "eco" | "beach" | "mountain"

function normalizeText(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

function guessTypeFromTags(tags: string[]): PlaceType {
  const t = tags.map((x) => normalizeText(x))
  const has = (needle: string) => t.some((x) => x.includes(needle))

  if (has("eco") || has("sinh thai") || has("ben vung") || has("bao ton")) return "eco"
  if (has("bien") || has("dao") || has("beach") || has("island")) return "beach"
  if (has("nui") || has("mountain") || has("trek") || has("hiking")) return "mountain"
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

  const [q, setQ] = React.useState("")
  const [type, setType] = React.useState<PlaceType>("all")
  const [maxPrice, setMaxPrice] = React.useState<number>(0)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        // Lock Explore to Vietnam by default (vibe like "Google Maps - Vietnam only")
        const res = await fetch("/api/destinations?country=Vietnam")
        if (!res.ok) throw new Error("Failed to load destinations")
        const data = (await res.json()) as unknown
        const list = Array.isArray(data) ? (data as Destination[]) : []
        if (cancelled) return
        setDestinations(list)

        const max = list.reduce((m, d) => Math.max(m, Number(d.amount) || 0), 0)
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
              Khám phá
            </div>
            <div className="text-xl font-black text-primary truncate">Bản đồ địa điểm</div>
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
              placeholder="Tìm địa điểm..."
              className="w-full h-12 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                <SlidersHorizontal className="w-4 h-4 text-secondary" />
                Loại
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PlaceType)}
                className="mt-2 w-full bg-transparent text-sm font-black text-primary outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="eco">Eco</option>
                <option value="beach">Biển</option>
                <option value="mountain">Núi</option>
              </select>
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
          <div className="rounded-2xl border border-white/10 bg-white/40 p-4 text-sm text-muted-foreground">
            Không tìm thấy địa điểm phù hợp.
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

