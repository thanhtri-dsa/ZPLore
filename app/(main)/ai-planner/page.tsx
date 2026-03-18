'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight, 
  Sparkles,
  Share2,
  Heart,
  Crown,
  Bus,
  Zap,
  Footprints,
  Wallet,
  Paperclip,
  List,
  Copy
} from "lucide-react"
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { toast } from 'sonner'
import RouteMapLoader from '@/components/ui/RouteMapLoader'

type RoutePoint = { lat: number; lng: number; label?: string }

type PlannerTab = 'itinerary' | 'reservations' | 'budget'

type StoredTrip = {
  token: string
  startLocation: string
  endLocation: string
  transportMode: string
  distanceKm?: number | null
  co2Kg?: number | null
  bookingDate?: string | null
  createdAt: number
}

const TRIPS_KEY = 'ecoTour.trips.v1'
const MAX_TRIPS = 20

function readStoredList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeStoredList<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function upsertTrip(items: StoredTrip[], item: StoredTrip) {
  const next = [item, ...items.filter((x) => x.token !== item.token)]
  return next.slice(0, MAX_TRIPS)
}

const DANANG_BOUNDS = {
  latMin: 15.9,
  latMax: 16.2,
  lngMin: 107.9,
  lngMax: 108.35,
}

const DEFAULT_DANANG_ROUTE: RoutePoint[] = [
  { lat: 16.0603, lng: 108.2227, label: 'Cầu Rồng' },
  { lat: 16.0594, lng: 108.2457, label: 'Bãi biển Mỹ Khê' },
  { lat: 15.9959, lng: 108.2636, label: 'Ngũ Hành Sơn' },
  { lat: 16.1099, lng: 108.2647, label: 'Bán đảo Sơn Trà' },
  { lat: 16.0437, lng: 108.1994, label: 'Sân bay Đà Nẵng' },
]

export default function AIPlannerPage() {
  const searchParams = useSearchParams()
  const start = searchParams.get('start') || ''
  const end = searchParams.get('end') || ''
  const transport = searchParams.get('transport') || 'Xe điện'

  const [bookingDate, setBookingDate] = useState<Date>()
  const [travelerCount, setTravelerCount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [aiRoutePoints, setAiRoutePoints] = useState<RoutePoint[]>([])
  const [emissionsInfo, setEmissionsInfo] = useState<{ total_emissions: number; transport_breakdown: Record<string, unknown>; } | null>(null)
  const [ecoPoints, setEcoPoints] = useState<{ lat: number; lng: number; label: string; type: string; }[]>([])
  const [expertInsights, setExpertInsights] = useState<{ title: string; content: string; }[]>([])
  const [activeTab, setActiveTab] = useState<PlannerTab>('itinerary')
  const [mapCollapsed, setMapCollapsed] = useState(false)
  const [tripUrl, setTripUrl] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)

  const isDaNangTrip = useMemo(() => {
    const fullPrompt = searchParams.get('fullPrompt') || ''
    const s = `${start} ${end} ${fullPrompt}`.toLowerCase()
    return s.includes('đà nẵng') || s.includes('da nang') || s.includes('danang')
  }, [searchParams, start, end])

  useEffect(() => {
    if (start && end) {
      // Add a small delay to ensure AIAssistant is ready to listen
      const timer = setTimeout(() => {
        const fullPrompt = searchParams.get('fullPrompt')
        const prompt =
          fullPrompt ||
          (isDaNangTrip
            ? `Hãy vẽ một lịch trình tham quan xanh CHỈ TRONG THÀNH PHỐ ĐÀ NẴNG (Việt Nam) từ ${start} đến ${end} bằng phương tiện ${transport}. BẮT BUỘC: Mọi điểm (lat,lng) phải nằm trong Đà Nẵng, không đi ra ngoài Đà Nẵng. Gợi ý điểm: Cầu Rồng (16.0603,108.2227), Mỹ Khê (16.0594,108.2457), Ngũ Hành Sơn (15.9959,108.2636), Sơn Trà (16.1099,108.2647), Bà Nà (15.9951,107.9966).`
            : `Hãy vẽ một hành trình ước mơ xanh TẠI VIỆT NAM từ ${start} đến ${end} bằng phương tiện ${transport}. BẮT BUỘC: Nếu khởi hành từ miền Bắc, lộ trình phải đi qua ĐÀ NẴNG (16.0544, 108.2022) bằng TÀU HỎA qua đèo Hải Vân. Mọi địa điểm phải ở Việt Nam.`);
        window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { prompt } }));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [start, end, transport, searchParams, isDaNangTrip]);

  useEffect(() => {
    const isInsideDaNang = (lat: number, lng: number) =>
      lat >= DANANG_BOUNDS.latMin &&
      lat <= DANANG_BOUNDS.latMax &&
      lng >= DANANG_BOUNDS.lngMin &&
      lng <= DANANG_BOUNDS.lngMax

    const handleAiMapCommand = (e: Event) => {
      const { detail } = e as CustomEvent<{
        action: string
        points?: RoutePoint[]
        emissions_info?: { total_emissions: number; transport_breakdown: Record<string, unknown> }
        eco_points?: { lat: number; lng: number; label: string; type: string }[]
        expert_insights?: { title: string; content: string }[]
      }>

      if (!detail) return
      const { action, points, emissions_info, eco_points, expert_insights } = detail
      if (action === 'draw_route' && Array.isArray(points)) {
        const nextPoints = isDaNangTrip
          ? points.filter((p) => isInsideDaNang(p.lat, p.lng))
          : points

        if (isDaNangTrip) {
          if (nextPoints.length < points.length) {
            toast.warning('Đã lọc các điểm nằm ngoài khu vực Đà Nẵng.')
          }
          if (nextPoints.length < 2) {
            toast.error('Lộ trình AI không hợp lệ trong Đà Nẵng. Đã dùng lộ trình mẫu trong Đà Nẵng.')
            setAiRoutePoints(DEFAULT_DANANG_ROUTE)
          } else {
            setAiRoutePoints(nextPoints)
          }
        } else {
          setAiRoutePoints(points)
        }

        if (emissions_info) setEmissionsInfo(emissions_info)
        if (eco_points) {
          const nextEco = isDaNangTrip
            ? eco_points.filter((p) => isInsideDaNang(p.lat, p.lng))
            : eco_points
          setEcoPoints(nextEco)
        }
        if (expert_insights) setExpertInsights(expert_insights)
      }
    }

    window.addEventListener('ai-map-command', handleAiMapCommand)
    return () => window.removeEventListener('ai-map-command', handleAiMapCommand)
  }, [isDaNangTrip])

  const transportIcon = useMemo(() => {
    const t = transport.toLowerCase()
    if (t.includes('bus')) return <Bus size={14} className="text-blue-500" />
    if (t.includes('điện') || t.includes('dien') || t.includes('electric')) return <Zap size={14} className="text-amber-500" />
    return <Footprints size={14} className="text-emerald-500" />
  }, [transport])

  const itineraryStops = useMemo(() => {
    if (aiRoutePoints.length >= 2) {
      return aiRoutePoints.map((p, idx) => ({
        id: `${idx}-${p.lat.toFixed(5)}-${p.lng.toFixed(5)}`,
        title:
          p.label ||
          (idx === 0
            ? `Bắt đầu: ${start || 'Điểm xuất phát'}`
            : idx === aiRoutePoints.length - 1
              ? `Kết thúc: ${end || 'Điểm đến'}`
              : `Điểm dừng ${idx}`),
        lat: p.lat,
        lng: p.lng,
        meta: idx === 0 ? 'Start' : idx === aiRoutePoints.length - 1 ? 'End' : 'Stop',
      }))
    }

    if (start || end) {
      return [
        { id: 'start', title: `Bắt đầu: ${start || 'Điểm xuất phát'}`, meta: 'Start' as const },
        { id: 'end', title: `Kết thúc: ${end || 'Điểm đến'}`, meta: 'End' as const },
      ]
    }

    return []
  }, [aiRoutePoints, start, end])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error("Vui lòng chọn ngày khởi hành");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const bookingData = {
      firstname: formData.get('firstname'),
      lastname: formData.get('lastname'),
      email: formData.get('email'),
      bookingDate: bookingDate.toISOString(),
      numberOfGuests: travelerCount,
      startLocation: start,
      endLocation: end,
      transportMode: transport,
            distanceKm: emissionsInfo?.total_emissions || 0,
            co2Kg: emissionsInfo?.transport_breakdown || 0,
      routePoints: aiRoutePoints,
      ecoPoints: ecoPoints,
      expertInsights: expertInsights
    };

    try {
      const response = await fetch('/api/ai/planner-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Hành trình ước mơ của bạn đã được xác nhận và lưu lại!");
        if (typeof result.tripUrl === 'string' && result.tripUrl.trim().length > 0) {
          setTripUrl(result.tripUrl)
        }
        try {
          const token =
            typeof result?.booking?.publicToken === 'string' && result.booking.publicToken.trim().length > 0
              ? result.booking.publicToken.trim()
              : typeof result.tripUrl === 'string'
                ? result.tripUrl.split('/').filter(Boolean).pop() || ''
                : ''
          if (token) {
            const stored: StoredTrip = {
              token,
              startLocation: String(start || ''),
              endLocation: String(end || ''),
              transportMode: String(transport || ''),
              distanceKm: typeof result?.booking?.distanceKm === 'number' ? result.booking.distanceKm : null,
              co2Kg: typeof result?.booking?.co2Kg === 'number' ? result.booking.co2Kg : null,
              bookingDate: typeof bookingDate?.toISOString === 'function' ? bookingDate.toISOString() : null,
              createdAt: Date.now(),
            }
            const existing = readStoredList<StoredTrip>(TRIPS_KEY)
            writeStoredList(TRIPS_KEY, upsertTrip(existing, stored))
          }
        } catch {}
        // Optional: redirect or clear form
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Có lỗi xảy ra khi lưu hành trình. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-[calc(env(safe-area-inset-bottom)+90px)] pt-[calc(env(safe-area-inset-top)+96px)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-secondary mb-3">
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Trip Planner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-black text-primary leading-tight">
              Hành trình <span className="italic text-secondary">Ước mơ</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <MapPin size={14} className="text-secondary" />
                <span className="text-xs font-bold text-gray-600 truncate max-w-[70vw] sm:max-w-none">{start || 'Điểm xuất phát'} → {end || 'Điểm đến'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                {transportIcon}
                <span className="text-xs font-bold text-gray-600">{transport}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <Wallet size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-gray-600">₫0</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {tripUrl ? (
              <Link href={tripUrl}>
                <Button className="rounded-2xl h-11 px-5 bg-primary text-white hover:bg-primary/90 transition-all gap-2 text-xs font-bold">
                  <ChevronRight size={16} /> Xem hành trình
                </Button>
              </Link>
            ) : null}
            <Button variant="outline" className="rounded-2xl h-11 px-5 border-gray-200 hover:bg-white hover:border-secondary transition-all gap-2 text-xs font-bold">
              <Share2 size={16} /> Chia sẻ
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsLiked(!isLiked)}
              className={`rounded-2xl h-11 px-5 border-gray-200 transition-all gap-2 text-xs font-bold ${isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'hover:bg-white hover:border-red-200'}`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> Lưu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-white/70">
              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'itinerary' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <List size={14} /> Itinerary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reservations')}
                className={`flex-1 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'reservations' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Paperclip size={14} /> Reservations
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('budget')}
                className={`flex-1 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'budget' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Wallet size={14} /> Budget
              </button>
            </div>

            {activeTab === 'itinerary' && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-primary">Itinerary</div>
                  <button
                    type="button"
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 hover:text-primary transition-colors"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { prompt: `Tối ưu lịch trình từ ${start} đến ${end} (ngắn gọn, theo thứ tự di chuyển hợp lý).` } }))}
                  >
                    <Sparkles size={12} className="text-secondary" />
                    Hỏi AI tối ưu
                  </button>
                </div>

                <div className="space-y-3">
                  {itineraryStops.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                      <div className="text-sm font-bold text-gray-700">Chưa có itinerary</div>
                      <div className="text-xs text-gray-500 mt-1">Gõ prompt để AI vẽ lộ trình, bản đồ sẽ tự cập nhật.</div>
                    </div>
                  ) : (
                    itineraryStops.map((s, idx) => (
                      <div key={s.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                          <div className="text-xs font-black text-primary">{idx + 1}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black text-gray-900 truncate">{s.title}</div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span className="rounded-full bg-gray-100 px-2 py-1">{s.meta}</span>
                            {'lat' in s && 'lng' in s && typeof s.lat === 'number' && typeof s.lng === 'number' && (
                              <span className="truncate">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</span>
                            )}
                          </div>
                        </div>
                        {'lat' in s && 'lng' in s && typeof s.lat === 'number' && typeof s.lng === 'number' && (
                          <button
                            type="button"
                            className="w-10 h-10 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors flex items-center justify-center shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(`${s.lat},${s.lng}`).then(() => toast.success('Đã copy tọa độ'))
                            }}
                          >
                            <Copy size={16} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-primary">Budgeting</div>
                  <div className="text-xs font-bold text-gray-500">₫0</div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                  <div className="text-sm font-bold text-gray-700">Bạn chưa thêm chi phí nào</div>
                  <div className="text-xs text-gray-500 mt-1">Đã dựng layout theo mô hình Wanderlog. Phần nhập chi phí sẽ bổ sung tiếp nếu bạn muốn.</div>
                </div>
                {emissionsInfo && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">CO2 (ước tính)</div>
                    <div className="text-2xl font-black text-primary mt-1">
                      {typeof emissionsInfo.total_emissions === 'number' && Number.isFinite(emissionsInfo.total_emissions)
                        ? `${emissionsInfo.total_emissions.toFixed(2)} kg`
                        : '—'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="p-4 sm:p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-primary">Reservations & attachments</div>
                  <Link href="/dream-journey" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                    Chỉnh sửa
                  </Link>
                </div>

                <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest mb-5 border border-secondary/20 w-fit">
                    <Crown size={12} /> Premium AI Planner
                  </div>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Tên</Label>
                        <Input name="firstname" placeholder="Tên" className="rounded-2xl h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Họ</Label>
                        <Input name="lastname" placeholder="Họ" className="rounded-2xl h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Email liên hệ</Label>
                      <Input name="email" type="email" placeholder="email@vi-du.com" className="rounded-2xl h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Ngày khởi hành</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 rounded-2xl bg-gray-50/50 border-gray-100 justify-start text-xs font-bold hover:bg-white transition-all">
                              <Calendar className="mr-2 h-4 w-4 text-secondary" />
                              {bookingDate ? format(bookingDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl z-[10001]">
                            <CalendarComponent 
                              mode="single" 
                              selected={bookingDate} 
                              onSelect={setBookingDate} 
                              disabled={(date) => date < new Date()}
                              className="p-4"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Số khách</Label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <Input 
                            name="guests" 
                            type="number" 
                            min="1" 
                            defaultValue={travelerCount} 
                            className="rounded-2xl h-12 bg-gray-50/50 border-gray-100 pl-12 focus:bg-white transition-all font-bold" 
                            required 
                            onChange={(e) => setTravelerCount(Number(e.target.value) || 1)} 
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-gray-900 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang xử lý..." : <>Xác nhận hành trình <ChevronRight size={16} /></>}
                      </Button>
                    </motion.div>

                    <p className="text-[9px] text-center text-gray-400 font-medium px-4">
                      Hành trình được tùy chỉnh riêng bởi AI dựa trên sở thích của bạn.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-[calc(env(safe-area-inset-top)+96px)] space-y-4">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 bg-secondary rounded-full" />
                  <div className="text-sm font-black text-primary">Bản đồ</div>
                </div>
                <button
                  type="button"
                  className="lg:hidden text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                  onClick={() => setMapCollapsed((v) => !v)}
                >
                  {mapCollapsed ? 'Mở' : 'Thu gọn'}
                </button>
              </div>

              {!mapCollapsed && (
                <div className="h-[340px] sm:h-[420px] lg:h-[calc(100vh-220px)] w-full">
                  <RouteMapLoader 
                    location={end} 
                    name={`Hành trình ${start} - ${end}`} 
                    points={aiRoutePoints.length >= 2 ? aiRoutePoints : undefined}
                    ecoPoints={ecoPoints}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
