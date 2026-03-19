"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPinned, Clock3, Leaf, Footprints, Bus, Palette, Soup, LocateFixed, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Destination } from "@/types/destinations"

type ExperienceFilter = "near_me" | "green_travel" | "walking" | "public_transport" | "craft_village" | "food"

type EnrichedDestination = Destination & {
  experienceTags: ExperienceFilter[]
  durationLabel: string
  emotionalBlurb: string
  distanceKm?: number
}

function normalizeText(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean)
  if (typeof tags === "string") return tags.split(",").map((t) => t.trim()).filter(Boolean)
  return []
}

function toVnd(amount: number) {
  try {
    return `${amount.toLocaleString("vi-VN")} VNĐ`
  } catch {
    return `${amount} VNĐ`
  }
}

function calcDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
  return R * c
}

function buildBaseExperienceTags(d: Destination): ExperienceFilter[] {
  const tags = parseTags(d.tags).map(normalizeText)
  const has = (word: string) => tags.some((t) => t.includes(word))

  const result = new Set<ExperienceFilter>()
  if (has("eco") || has("green") || has("ben vung") || has("sustain")) result.add("green_travel")
  if (has("walk") || has("di bo") || has("trek") || d.daysNights <= 1) result.add("walking")
  if (has("bus") || has("public") || has("xe buyt") || has("train")) result.add("public_transport")
  if (has("gom") || has("craft") || has("lang nghe") || has("silk") || has("moc")) result.add("craft_village")
  if (has("food") || has("am thuc") || has("banh") || has("mon")) result.add("food")

  if (result.size === 0) {
    result.add("craft_village")
    result.add("green_travel")
  }
  return Array.from(result)
}

function durationLabel(d: Destination) {
  if (d.daysNights <= 0) return "2-3 giờ"
  if (d.daysNights === 1) return "Nửa ngày - 1 ngày"
  return `${d.daysNights} ngày`
}

function emotionalBlurb(d: Destination) {
  const base = String(d.description || "").trim()
  if (base.length > 20) return base.slice(0, 120) + (base.length > 120 ? "..." : "")
  return `Đi chậm qua ${d.city}, cảm nhận văn hóa bản địa, dừng ở các điểm thủ công và ẩm thực đặc trưng.`
}

function itinerarySteps(d: EnrichedDestination) {
  const tags = new Set(d.experienceTags)
  const steps = [
    { title: `Điểm check-in tại ${d.city}`, note: "Khởi động nhẹ và chụp ảnh.", eta: "20-30 phút" },
    { title: tags.has("craft_village") ? "Trải nghiệm làng nghề" : "Khám phá điểm văn hóa", note: "Quan sát quy trình thủ công, thử hoạt động ngắn.", eta: "60-90 phút" },
    { title: tags.has("food") ? "Dừng ẩm thực địa phương" : "Dừng nghỉ + cà phê địa phương", note: "Nạp năng lượng trước chặng cuối.", eta: "45-60 phút" },
    { title: "Kết thúc hành trình", note: "Quay lại trung tâm hoặc đi tiếp điểm lân cận.", eta: "30 phút" },
  ]
  return steps
}

function mapsUrl(d: Destination) {
  if (typeof d.latitude === "number" && typeof d.longitude === "number") {
    return `https://www.google.com/maps?q=${d.latitude},${d.longitude}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name}, ${d.city}, ${d.country}`)}`
}

const FILTERS: Array<{ id: ExperienceFilter; label: string; icon: React.ElementType }> = [
  { id: "near_me", label: "Near me", icon: LocateFixed },
  { id: "green_travel", label: "Green travel 🌱", icon: Leaf },
  { id: "walking", label: "Walking 🚶", icon: Footprints },
  { id: "public_transport", label: "Public transport 🚌", icon: Bus },
  { id: "craft_village", label: "Craft village 🏺", icon: Palette },
  { id: "food", label: "Food 🍜", icon: Soup },
]

type OnboardingChoice = {
  id: string
  title: string
  desc: string
  query?: string
  filters: ExperienceFilter[]
}

const ONBOARDING_CHOICES: OnboardingChoice[] = [
  {
    id: "group_weekend",
    title: "Đi cùng nhóm cuối tuần",
    desc: "Ưu tiên điểm gần, dễ đi và có trải nghiệm thủ công.",
    query: "làng nghề",
    filters: ["craft_village", "walking"],
  },
  {
    id: "green_trip",
    title: "Đi xanh, ít phát thải",
    desc: "Ưu tiên hành trình đi bộ và public transport.",
    filters: ["green_travel", "public_transport"],
  },
  {
    id: "food_culture",
    title: "Ẩm thực và văn hóa",
    desc: "Khám phá điểm ăn uống và câu chuyện địa phương.",
    query: "ẩm thực",
    filters: ["food"],
  },
]

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const DestinationsMap = React.useMemo(
    () =>
      dynamic(() => import("@/components/ui/DestinationsMap"), {
        ssr: false,
        loading: () => (
          <div className="h-full w-full animate-pulse bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
            Đang tải map...
          </div>
        ),
      }),
    []
  )

  const [destinations, setDestinations] = React.useState<Destination[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ExperienceFilter[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showMap, setShowMap] = React.useState(false)
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  const [onboardingApplied, setOnboardingApplied] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/destinations", { cache: "no-store" })
        if (!res.ok) throw new Error("Không thể tải dữ liệu điểm đến")
        const data = (await res.json()) as unknown[]
        if (!Array.isArray(data)) throw new Error("Dữ liệu điểm đến không hợp lệ")

        const normalized = data.map((raw) => {
          const d = raw as Record<string, unknown>
          return {
            id: String(d.id || ""),
            name: String(d.name || ""),
            country: String(d.country || ""),
            city: String(d.city || ""),
            amount: Number(d.amount || 0),
            tags: parseTags(d.tags),
            imageData: String(d.imageData || ""),
            description: String(d.description || ""),
            daysNights: Number(d.daysNights || 1),
            tourType: (String(d.tourType || "DAYS") as "DAYS" | "NIGHTS"),
            latitude: typeof d.latitude === "number" ? d.latitude : undefined,
            longitude: typeof d.longitude === "number" ? d.longitude : undefined,
          } satisfies Destination
        })
        if (!cancelled) setDestinations(normalized)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Không thể tải dữ liệu")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    const firstVisit = localStorage.getItem("explore_onboarding_done") !== "1"
    const force = searchParams.get("onboarding") === "1"
    setShowOnboarding(firstVisit || force)
  }, [searchParams])

  const experiences = React.useMemo<EnrichedDestination[]>(() => {
    return destinations.map((d) => {
      const baseTags = buildBaseExperienceTags(d)
      let distanceKm: number | undefined
      const finalTags = new Set<ExperienceFilter>(baseTags)
      if (userLocation && typeof d.latitude === "number" && typeof d.longitude === "number") {
        distanceKm = calcDistanceKm(userLocation.lat, userLocation.lng, d.latitude, d.longitude)
        if (distanceKm <= 30) finalTags.add("near_me")
      }

      return {
        ...d,
        durationLabel: durationLabel(d),
        emotionalBlurb: emotionalBlurb(d),
        experienceTags: Array.from(finalTags),
        distanceKm,
      }
    })
  }, [destinations, userLocation])

  const filtered = React.useMemo(() => {
    const q = normalizeText(query.trim())
    return experiences.filter((d) => {
      const hay = normalizeText(`${d.name} ${d.city} ${d.country} ${parseTags(d.tags).join(" ")} ${d.emotionalBlurb}`)
      const queryOk = !q || hay.includes(q)
      const filterOk = activeFilters.every((f) => d.experienceTags.includes(f))
      return queryOk && filterOk
    })
  }, [activeFilters, experiences, query])

  const selected = React.useMemo(() => filtered.find((d) => d.id === selectedId) ?? null, [filtered, selectedId])

  React.useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id)
    if (selectedId && !filtered.some((d) => d.id === selectedId)) setSelectedId(filtered[0]?.id ?? null)
  }, [filtered, selectedId])

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Thiết bị không hỗ trợ định vị")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationError(null)
      },
      () => setLocationError("Không lấy được vị trí, vui lòng kiểm tra quyền truy cập vị trí.")
    )
  }

  const toggleFilter = (f: ExperienceFilter) => {
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  const applyOnboarding = (choice: OnboardingChoice) => {
    setActiveFilters(choice.filters)
    setQuery(choice.query ?? "")
    setShowMap(true)
    setOnboardingApplied(choice.title)
    setShowOnboarding(false)
    localStorage.setItem("explore_onboarding_done", "1")
  }

  const skipOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem("explore_onboarding_done", "1")
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#f8fffb] via-white to-[#f3faf5] pt-[calc(env(safe-area-inset-top)+108px)] md:pt-[calc(env(safe-area-inset-top)+120px)]">
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-2 pb-4">
        {showOnboarding ? (
          <div className="mb-4 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 md:p-5 shadow-[0_10px_30px_rgba(16,185,129,0.12)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Quick start</div>
                <h2 className="text-lg md:text-xl font-black text-emerald-950 mt-1">Bạn muốn bắt đầu kiểu hành trình nào?</h2>
                <p className="text-sm text-emerald-900/70 mt-1">Chọn 1 mục tiêu, hệ thống sẽ tự áp bộ lọc và gợi ý phù hợp.</p>
              </div>
              <Button variant="outline" className="rounded-xl text-xs font-black uppercase tracking-[0.14em]" onClick={skipOnboarding}>
                Bỏ qua
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {ONBOARDING_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => applyOnboarding(choice)}
                  className="rounded-2xl border border-emerald-200 bg-white p-4 text-left hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="text-sm font-black text-emerald-950">{choice.title}</div>
                  <div className="text-xs text-emerald-900/70 mt-1 leading-relaxed">{choice.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-xl p-5 md:p-8 shadow-[0_15px_40px_rgba(16,185,129,0.08)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Explore Vietnam</div>
              <h1 className="mt-2 text-2xl md:text-4xl font-black text-emerald-950 leading-tight">
                Hôm nay bạn muốn đi đâu để vừa vui, vừa xanh?
              </h1>
              <p className="mt-3 text-sm md:text-base text-emerald-900/70 max-w-2xl">
                Chọn trải nghiệm, xem lộ trình chi tiết, mở Google Maps và đi ngay. Không phức tạp đặt tour.
              </p>
              <div className="mt-4 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-700/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm trải nghiệm: làng nghề, đi bộ, food tour..."
                  className="w-full h-12 rounded-2xl border border-emerald-100 bg-white pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              {onboardingApplied ? (
                <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                  Đang dùng gợi ý: {onboardingApplied}
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 md:p-5">
              <div className="text-sm font-black text-emerald-900">Lộ trình gợi ý hôm nay</div>
              <div className="mt-2 text-xs text-emerald-900/70 leading-relaxed">
                {selected
                  ? `${selected.name} - ${selected.city}. ${selected.durationLabel}. Bắt đầu bằng điểm check-in, trải nghiệm thủ công, rồi kết thúc bằng ẩm thực địa phương.`
                  : "Chọn một card bên dưới để xem lộ trình chi tiết."}
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-[0.14em]" onClick={() => setShowMap((v) => !v)}>
                  <MapPinned className="h-4 w-4 mr-2" />
                  {showMap ? "Ẩn Map" : "Xem Map"}
                </Button>
                <Button variant="outline" className="h-10 rounded-xl text-xs font-black uppercase tracking-[0.14em]" onClick={requestLocation}>
                  <LocateFixed className="h-4 w-4 mr-2" />
                  Near me
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl text-xs font-black uppercase tracking-[0.14em]"
                  onClick={() => router.push("/community")}
                >
                  Tạo nhóm
                </Button>
              </div>
              {locationError ? <p className="mt-2 text-[11px] text-red-600">{locationError}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-wrap gap-2 pb-4">
          {FILTERS.map((f) => {
            const active = activeFilters.includes(f.id)
            const Icon = f.icon
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFilter(f.id)}
                className={[
                  "h-9 px-4 rounded-full border inline-flex items-center gap-1.5 text-xs font-bold transition-colors",
                  active
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-emerald-100 text-emerald-900 hover:bg-emerald-50",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            )
          })}
        </div>

        {showMap ? (
          <div className="mb-6 rounded-2xl overflow-hidden border border-emerald-100 bg-white shadow-sm">
            <div className="h-[260px] md:h-[360px]">
              <DestinationsMap destinations={filtered} />
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="py-16 text-center text-sm text-emerald-900/70">Đang tải trải nghiệm...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
            <div className="xl:col-span-8 space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
                  <div className="text-emerald-900 font-black">Không có trải nghiệm phù hợp</div>
                  <div className="mt-2 text-sm text-emerald-900/70">Thử bỏ bớt filter hoặc đổi từ khóa.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((d, idx) => {
                    const img = d.imageData?.trim() ? d.imageData : "/images/travel_detsinations.jpg"
                    const isData = img.startsWith("data:")
                    const isActive = selected?.id === d.id
                    return (
                      <article
                        key={d.id}
                        className={[
                          "group rounded-3xl border bg-white overflow-hidden shadow-sm transition-all",
                          isActive
                            ? "border-emerald-300 ring-2 ring-emerald-100"
                            : "border-emerald-100 hover:shadow-md hover:-translate-y-0.5",
                        ].join(" ")}
                      >
                        <button type="button" onClick={() => setSelectedId(d.id)} className="w-full text-left">
                          <div className={`relative ${idx % 3 === 0 ? "h-56" : "h-48"} w-full`}>
                            <Image src={img} alt={d.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" {...(isData ? { unoptimized: true } : {})} />
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-black text-emerald-950 text-lg leading-snug">{d.name}</h3>
                              <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{toVnd(d.amount)}</span>
                            </div>
                            <div className="mt-1 text-sm text-emerald-900/70 flex items-center gap-3">
                              <span className="inline-flex items-center gap-1"><Navigation className="h-3.5 w-3.5" />{d.city}</span>
                              <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{d.durationLabel}</span>
                            </div>
                            <p className="mt-3 text-sm text-emerald-900/75 leading-relaxed">{d.emotionalBlurb}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {d.experienceTags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] uppercase tracking-[0.15em] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                  {FILTERS.find((f) => f.id === tag)?.label ?? tag}
                                </span>
                              ))}
                              {typeof d.distanceKm === "number" ? (
                                <span className="text-[10px] uppercase tracking-[0.15em] font-black px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
                                  {d.distanceKm.toFixed(1)} km
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-4">
                              <span className="inline-flex items-center text-sm font-black text-emerald-700 group-hover:text-emerald-800">
                                View itinerary
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

            <aside className="xl:col-span-4">
              <div className="xl:sticky xl:top-24 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                {selected ? (
                  <>
                    <div className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-700">Itinerary</div>
                    <h2 className="mt-2 text-xl font-black text-emerald-950">{selected.name}</h2>
                    <p className="mt-1 text-sm text-emerald-900/70">{selected.city}, {selected.country}</p>
                    <div className="mt-4 space-y-3">
                      {itinerarySteps(selected).map((step, i) => (
                        <div key={step.title} className="flex gap-3">
                          <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black inline-flex items-center justify-center">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-black text-emerald-950">{step.title}</div>
                            <div className="text-xs text-emerald-900/70">{step.note}</div>
                            <div className="text-[11px] mt-0.5 text-emerald-700 font-semibold">{step.eta}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <a href={mapsUrl(selected)} target="_blank" rel="noreferrer" className="flex-1">
                        <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-[0.14em]">
                          Open in Google Maps
                        </Button>
                      </a>
                      <Button variant="outline" className="h-11 rounded-xl text-xs font-black uppercase tracking-[0.14em]" onClick={() => setShowMap(true)}>
                        <MapPinned className="h-4 w-4 mr-1.5" />
                        Map
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-emerald-900/70">Chọn một trải nghiệm để xem lộ trình chi tiết.</div>
                )}
              </div>
            </aside>
          </div>
        )}
      </section>

      {selected ? (
        <div className="xl:hidden fixed bottom-4 left-4 right-4 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.16em] text-[11px]">
                View itinerary - {selected.name}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0 bg-white">
              <div className="p-4 border-b">
                <div className="text-lg font-black text-emerald-950">{selected.name}</div>
                <div className="text-sm text-emerald-900/70">{selected.city}, {selected.country}</div>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto h-[calc(80vh-140px)]">
                {itinerarySteps(selected).map((step, i) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black inline-flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-black text-emerald-950">{step.title}</div>
                      <div className="text-xs text-emerald-900/70">{step.note}</div>
                      <div className="text-[11px] mt-0.5 text-emerald-700 font-semibold">{step.eta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <a href={mapsUrl(selected)} target="_blank" rel="noreferrer">
                  <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.14em] text-[11px]">
                    Open in Google Maps
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : null}
    </main>
  )
}

