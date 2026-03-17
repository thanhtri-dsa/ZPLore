'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Crown, Share2, Heart, ShieldCheck, ChevronRight, Leaf, Compass, Utensils, Award, Navigation, Play, Square, Info, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { computeDistanceKm, computeLegKgCo2e, normalizeMode, transportModeLabels, haversineDistanceKm, TransportMode } from '@/lib/emissions'
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { vi } from "date-fns/locale"

const RouteMapLoader = dynamic(
  () => import('@/components/ui/RouteMapLoader'),
  { 
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-[2.5rem] flex items-center justify-center">Đang tải bản đồ hành trình...</div>,
    ssr: false
  }
)

interface PackageDestinationProps {
  package: {
    id: string
    name: string
    location: string
    imageUrl: string
    duration: string
    groupSize: string
    price: number
    description: string
    included: { id: string; item: string }[]
    itinerary?: Array<{
      id: string
      order: number
      mode: string
      fromName: string
      toName: string
      distanceKm: number | null
      fromLat: number | null
      fromLng: number | null
      toLat: number | null
      toLng: number | null
      note: string | null
    }>
  }
}

interface FormErrors {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  numberOfGuests?: string
  bookingDate?: string
}

// --- Sub-components moved outside to ensure stability ---

const InfoTabContent = ({ travelPackage }: { travelPackage: PackageDestinationProps['package'] }) => (
  
    <div className="bg-white/80 backdrop-blur-md p-8 md:p-16 rounded-[3rem] shadow-sm border border-white relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-[0.05] vn-pattern w-64 h-64 rotate-12 -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 opacity-[0.05] vn-pattern w-48 h-48 -ml-10 -mb-10 rotate-45" />
    </div>
)

const ItineraryTabContent = ({ 
  travelPackage, 
  googleTripUrl, 
  showMapPanel, 
  setShowMapPanel, 
  mapPoints, 
  isTracking, 
  setIsTracking, 
  trackedDistance, 
  trackedEmissions, 
  trackingMode, 
  setTrackingMode, 
  itinerarySummary 
}: {
  travelPackage: PackageDestinationProps['package']
  googleTripUrl: string | null
  showMapPanel: boolean
  setShowMapPanel: (v: boolean) => void
  mapPoints: any
  isTracking: boolean
  setIsTracking: (v: boolean) => void
  trackedDistance: number
  trackedEmissions: number
  trackingMode: TransportMode
  setTrackingMode: (v: TransportMode) => void
  itinerarySummary: any
}) => (
  <div className="space-y-8 md:space-y-12">
    <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <h2 className="text-xl md:text-3xl font-serif font-black flex items-center gap-3 md:gap-4 text-primary">
          <div className="h-6 md:h-8 w-1.5 bg-secondary rounded-full" />
          Lộ trình di chuyển
        </h2>
        <div className="flex gap-2">
            <Button 
              onClick={() => {
                const event = new CustomEvent('ai-ask-route', { detail: { tourName: travelPackage.name } });
                window.dispatchEvent(event);
                toast.success("Đang hỏi AI về đường đi...");
              }} 
              variant="outline" 
              className="rounded-full h-8 md:h-10 px-4 text-[10px] font-bold bg-secondary/10 border-secondary/20 text-primary flex gap-2"
            >
              <Sparkles size={14} className="text-secondary" /> Hỏi AI đường đi
            </Button>
            {googleTripUrl && (
            <Button asChild variant="outline" className="rounded-full h-8 md:h-10 px-4 text-[10px] font-bold">
              <a href={googleTripUrl} target="_blank" rel="noreferrer">Google Maps</a>
            </Button>
          )}
          <Button onClick={() => setShowMapPanel(!showMapPanel)} variant="outline" className={`rounded-full h-8 md:h-10 px-4 text-[10px] font-bold ${showMapPanel ? 'bg-primary text-white' : ''}`}>
            {showMapPanel ? 'Đóng' : 'Chỉnh sửa'}
          </Button>
        </div>
      </div>
      <div className="h-[300px] md:h-[500px] w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border-2 border-white shadow-xl relative bg-gray-50">
        <RouteMapLoader location={travelPackage.location} name={travelPackage.name} showPanel={showMapPanel} points={mapPoints} />
      </div>

      <div className="mt-8 rounded-2xl md:rounded-[2.5rem] border border-primary/10 bg-primary/5 p-5 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg md:text-xl font-black text-primary">Live Tracker</div>
          {!isTracking ? (
            <Button onClick={() => setIsTracking(true)} className="bg-green-600 hover:bg-green-700 text-white rounded-full h-10 px-6 font-bold flex gap-2">
              <Play size={14} /> Bắt đầu
            </Button>
          ) : (
            <Button onClick={() => setIsTracking(false)} variant="destructive" className="rounded-full h-10 px-6 font-bold flex gap-2">
              <Square size={14} /> Dừng
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-white">
            <p className="text-[10px] font-black uppercase text-gray-400">Quãng đường</p>
            <p className="text-lg font-black text-primary">{trackedDistance.toFixed(2)} km</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-white">
            <p className="text-[10px] font-black uppercase text-gray-400">Khí thải</p>
            <p className="text-lg font-black text-secondary">{trackedEmissions.toFixed(2)} kg</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-white">
            <p className="text-[10px] font-black uppercase text-gray-400">Phương tiện</p>
            <select value={trackingMode} onChange={(e) => setTrackingMode(e.target.value as TransportMode)} className="w-full text-sm font-bold bg-transparent outline-none">
              {Object.entries(transportModeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        {isTracking && (
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
            Đang GPS Tracking...
          </motion.div>
        )}
        <div className="mt-8 space-y-6 relative pl-8 border-l-2 border-dashed border-primary/20">
          {itinerarySummary.legs.map((leg: any, index: number) => (
            <div key={leg.id} className="relative">
              <div className="absolute -left-[41px] top-0 bg-white p-2 rounded-full border-2 border-primary text-primary">
                <Navigation size={14} />
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-primary">Chặng {index + 1}</p>
                  <h4 className="font-bold text-gray-900">{leg.fromName} → {leg.toName}</h4>
                  <p className="text-xs text-gray-500 italic">{transportModeLabels[leg.mode as TransportMode]}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Khí thải</p>
                  <p className="text-lg font-black text-primary">{leg.kgCo2e?.toFixed(2) || '0.00'} kg</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const BookingForm = ({ 
  isMobile = false, 
  formRef, 
  handleSubmit, 
  bookingDate, 
  setBookingDate, 
  travelerCount, 
  setTravelerCount, 
  isLoading 
}: {
  isMobile?: boolean
  formRef: React.RefObject<HTMLFormElement>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  bookingDate: Date | undefined
  setBookingDate: (d: Date | undefined) => void
  travelerCount: number
  setTravelerCount: (n: number) => void
  isLoading: boolean
}) => (
  <div className={`bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden ${isMobile ? 'p-8' : 'p-10 sticky top-32'}`}>
    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
    
    <div className="mb-10 text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest mb-4 border border-secondary/20">
        <Crown size={12} /> Premium Concierge
      </div>
      <h3 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-serif font-black text-primary mb-2`}>Đặt Chỗ</h3>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Hành trình xanh của bạn</p>
    </div>

    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 relative z-10">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Tên</Label>
          <Input name="firstname" placeholder="Tên" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 focus:bg-white transition-all" required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Họ</Label>
          <Input name="lastname" placeholder="Họ" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 focus:bg-white transition-all" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Email liên hệ</Label>
        <Input name="email" type="email" placeholder="email@vi-du.com" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 focus:bg-white transition-all" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase ml-1 text-primary/60 tracking-wider">Ngày khởi hành</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-14 rounded-2xl bg-gray-50/50 border-gray-100 justify-start text-xs font-bold hover:bg-white transition-all">
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
              className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 pl-12 focus:bg-white transition-all font-bold" 
              required 
              onChange={(e) => setTravelerCount(Number(e.target.value) || 1)} 
            />
          </div>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-gray-900 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <>Xác nhận hành trình <ChevronRight size={16} /></>
          )}
        </Button>
      </motion.div>

      <p className="text-[9px] text-center text-gray-400 font-medium px-4">
        Bằng cách nhấn xác nhận, bạn đồng ý với các <span className="text-primary font-bold">Điều khoản & Chính sách</span> bảo mật của ZPLore VIP.
      </p>
    </form>
  </div>
)

// --- Main Component ---

export default function PackageDestination({ package: travelPackage }: PackageDestinationProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [bookingDate, setBookingDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [showMapPanel, setShowMapPanel] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLiked, setIsLiked] = useState(false)
  const [travelerCount, setTravelerCount] = useState(1)
  const [aiPoints, setAiPoints] = useState<any[] | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'info' | 'itinerary' | 'booking'>('info')

  // Local state for itinerary leg modes
  const [itineraryModes, setItineraryModes] = useState<Record<string, TransportMode>>({})

  // Live Tracking States
  const [isTracking, setIsTracking] = useState(false)
  const [trackedDistance, setTrackedDistance] = useState(0)
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [trackingMode, setTrackingMode] = useState<TransportMode>('BUS')

  // Computations
  const trackedEmissions = useMemo(() => {
    return computeLegKgCo2e({ mode: trackingMode, distanceKm: trackedDistance, travelers: travelerCount });
  }, [trackingMode, trackedDistance, travelerCount]);

  const itinerarySummary = useMemo(() => {
    const legs = (travelPackage.itinerary ?? []).slice().sort((a, b) => a.order - b.order)
    const computed = legs.map((l) => {
      const mode = itineraryModes[l.id] || normalizeMode(l.mode)
      const distanceKm = computeDistanceKm({
        distanceKm: l.distanceKm,
        fromLat: l.fromLat,
        fromLng: l.fromLng,
        toLat: l.toLat,
        toLng: l.toLng,
      })
      const kgCo2e = distanceKm != null ? computeLegKgCo2e({ mode, distanceKm, travelers: travelerCount }) : null
      const carKgCo2e = distanceKm != null ? computeLegKgCo2e({ mode: 'CAR', distanceKm, travelers: travelerCount }) : 0
      const savings = Math.max(0, carKgCo2e - (kgCo2e || 0))
      return { ...l, mode, distanceKm, kgCo2e, savings }
    })
    const totalDistanceKm = computed.reduce((sum, l) => sum + (l.distanceKm ?? 0), 0)
    const totalKgCo2e = computed.reduce((sum, l) => sum + (l.kgCo2e ?? 0), 0)
    const totalSavings = computed.reduce((sum, l) => sum + (l.savings ?? 0), 0)
    return { legs: computed, totalDistanceKm, totalKgCo2e, totalSavings }
  }, [travelPackage.itinerary, travelerCount, itineraryModes])

  const mapPoints = useMemo(() => {
    const pts: Array<{ lat: number; lng: number; label?: string }> = []
    const pushIfValid = (lat: number | null, lng: number | null, label?: string) => {
      if (typeof lat !== 'number' || typeof lng !== 'number') return
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
      pts.push({ lat, lng, label })
    }
    for (const leg of itinerarySummary.legs) {
      pushIfValid(leg.fromLat ?? null, leg.fromLng ?? null, leg.fromName)
      pushIfValid(leg.toLat ?? null, leg.toLng ?? null, leg.toName)
    }
    return pts.length >= 2 ? pts : undefined
  }, [itinerarySummary.legs])

  const googleTripUrl = useMemo(() => {
    if (itinerarySummary.legs.length === 0) return null
    const originLeg = itinerarySummary.legs[0]
    const destLeg = itinerarySummary.legs[itinerarySummary.legs.length - 1]
    const enc = (v: string) => encodeURIComponent(v)
    const coord = (lat?: number | null, lng?: number | null) =>
      typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : null
    const origin = coord(originLeg.fromLat, originLeg.fromLng) ?? originLeg.fromName
    const destination = coord(destLeg.toLat, destLeg.toLng) ?? destLeg.toName
    const waypoints = itinerarySummary.legs.slice(0, -1).map((l) => coord(l.toLat, l.toLng) ?? l.toName).filter(Boolean)
    const base = `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(destination)}&travelmode=driving`
    if (waypoints.length === 0) return base
    return `${base}&waypoints=${enc(waypoints.join('|'))}`
  }, [itinerarySummary.legs])

  // Listen for AI Map Commands
  useEffect(() => {
    const handleAiMapCommand = (e: any) => {
      if (e.detail && e.detail.action === 'draw_route' && e.detail.points) {
        setAiPoints(e.detail.points);
        setActiveTab('itinerary'); // Switch to itinerary tab to show map
      }
    };
    window.addEventListener('ai-map-command', handleAiMapCommand);
    return () => window.removeEventListener('ai-map-command', handleAiMapCommand);
  }, []);

  // Broadcast current tour info for AIAssistant
  useEffect(() => {
    if (hasMounted && travelPackage) {
      const event = new CustomEvent('current-tour-info', { 
        detail: {
          id: travelPackage.id,
          name: travelPackage.name,
          location: travelPackage.location,
          price: travelPackage.price,
          description: travelPackage.description,
          points: mapPoints
        }
      });
      window.dispatchEvent(event);
    }
  }, [hasMounted, travelPackage, mapPoints]);

  // Wake Lock state to keep screen on
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  useEffect(() => {
    setHasMounted(true)
    
    // Load saved tracking distance from localStorage
    const savedDistance = localStorage.getItem(`trackedDistance_${travelPackage.id}`);
    if (savedDistance) {
      setTrackedDistance(parseFloat(savedDistance));
    }

    // Initialize itinerary modes
    if (travelPackage.itinerary) {
      const modes: Record<string, TransportMode> = {}
      travelPackage.itinerary.forEach(leg => {
        modes[leg.id] = normalizeMode(leg.mode)
      })
      setItineraryModes(modes)
    }
  }, [travelPackage.id, travelPackage.itinerary]);

  // Save tracking distance whenever it changes
  useEffect(() => {
    if (hasMounted && trackedDistance > 0) {
      localStorage.setItem(`trackedDistance_${travelPackage.id}`, trackedDistance.toString());
    }
  }, [trackedDistance, travelPackage.id, hasMounted]);

  // Wake Lock effect
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isTracking) {
        try {
          const lock = await (navigator as any).wakeLock.request('screen');
          setWakeLock(lock);
        } catch (err) {
          console.error(`Wake Lock Error: ${err}`);
        }
      }
    };

    if (isTracking) {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release().then(() => setWakeLock(null));
    }

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => setWakeLock(null));
      }
    };
  }, [isTracking, wakeLock]);

  // Live Tracking Effect
  useEffect(() => {
    let watchId: number | null = null;
    if (isTracking && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          if (accuracy > 100) return;
          const newCoords = { lat, lng };
          if (lastCoords) {
            const distance = haversineDistanceKm(lastCoords, newCoords);
            if (distance > 0.01 && distance < 5) {
              setTrackedDistance(prev => prev + distance);
              setLastCoords(newCoords);
            }
          } else {
            setLastCoords(newCoords);
          }
        },
        (error) => {
          console.error("Tracking error:", error);
          toast.error("Lỗi định vị. Vui lòng kiểm tra GPS.");
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, lastCoords]);

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {}
    const firstname = formData.get('firstname') as string
    if (!firstname || firstname.trim().length < 2) errors.firstname = 'Tên không hợp lệ'
    const lastname = formData.get('lastname') as string
    if (!lastname || lastname.trim().length < 2) errors.lastname = 'Họ không hợp lệ'
    const email = formData.get('email') as string
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ'
    const phone = formData.get('phone') as string
    if (!phone || !/^\+?[\d\s-]{10,}$/.test(phone)) errors.phone = 'Số điện thoại không hợp lệ'
    if (!bookingDate) errors.bookingDate = 'Vui lòng chọn ngày'
    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }
    try {
      const response = await fetch('/api/packages/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: formData.get('firstname'),
          lastname: formData.get('lastname'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          numberOfGuests: travelerCount,
          bookingDate: bookingDate?.toISOString(),
          destinationName: travelPackage.name,
          price: travelPackage.price
        }),
      })
      if (!response.ok) throw new Error('Booking failed')
      toast.success('Đặt tour thành công!')
      formRef.current?.reset()
      setBookingDate(undefined)
      setErrors({})
    } catch (error) {
      toast.error('Đặt tour thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.2 }} 
          animate={{ scale: 1 }} 
          transition={{ duration: 2, ease: "easeOut" }} 
          className="absolute inset-0"
        >
          <Image 
            src={travelPackage.imageUrl || "/images/travel_detsinations.jpg"} 
            alt={travelPackage.name} 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#f8fafc]" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-12 md:pb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link href="/packages">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-8 backdrop-blur-xl border border-white/30 rounded-full h-10 px-6 text-[10px] font-black uppercase tracking-widest group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Quay lại khám phá
              </Button>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 1 }}
                className="bg-secondary text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-secondary/20"
              >
                <Crown size={12} /> Eco-VIP Experience
              </motion.span>
              {itinerarySummary.totalSavings > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 1.2 }}
                  className="bg-primary/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-white/20 shadow-xl shadow-primary/20"
                >
                  <Leaf size={12} className="text-secondary" /> -{itinerarySummary.totalSavings.toFixed(1)}kg CO2 Saved
                </motion.span>
              )}
            </div>

            <h1 className="text-4xl md:text-8xl font-serif font-black text-white mb-8 leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-4xl">
              {travelPackage.name.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? "text-secondary italic" : ""}>{word} </span>
              ))}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="text-primary h-4 w-4" />
                </div>
                <span className="font-black text-sm uppercase tracking-widest">{travelPackage.location}</span>
              </div>
              
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLiked(!isLiked)} 
                  className={`p-4 rounded-2xl backdrop-blur-xl border border-white/20 transition-all shadow-2xl ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-2xl"
                >
                  <Share2 size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent z-10" />
      </section>

      {/* Mobile Tab Navigation */}
      <div className="sticky top-[64px] z-40 lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-around">
          {[
            { id: 'info', label: 'Thông tin', icon: Info },
            { id: 'itinerary', label: 'Lộ trình', icon: Navigation },
            { id: 'booking', label: 'Đặt Tour', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center py-4 transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`}
            >
              <tab.icon size={20} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-secondary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 lg:-mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {!hasMounted ? (
              <div className="space-y-8"><InfoTabContent travelPackage={travelPackage} /></div>
            ) : (
              <div className="space-y-8 md:space-y-12">
                {window.innerWidth >= 1024 ? (
                  <>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                      <InfoTabContent travelPackage={travelPackage} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                      <ItineraryTabContent 
                        travelPackage={travelPackage}
                        googleTripUrl={googleTripUrl}
                        showMapPanel={showMapPanel}
                        setShowMapPanel={setShowMapPanel}
                        mapPoints={aiPoints || mapPoints}
                        isTracking={isTracking}
                        setIsTracking={setIsTracking}
                        trackedDistance={trackedDistance}
                        trackedEmissions={trackedEmissions}
                        trackingMode={trackingMode}
                        setTrackingMode={setTrackingMode}
                        itinerarySummary={itinerarySummary}
                      />
                    </motion.div>
                  </>
                ) : (
                  <AnimatePresence mode="wait">
                    {activeTab === 'info' && (
                      <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <InfoTabContent travelPackage={travelPackage} />
                      </motion.div>
                    )}
                    {activeTab === 'itinerary' && (
                      <motion.div key="itinerary" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <ItineraryTabContent 
                          travelPackage={travelPackage}
                          googleTripUrl={googleTripUrl}
                          showMapPanel={showMapPanel}
                          setShowMapPanel={setShowMapPanel}
                          mapPoints={aiPoints || mapPoints}
                          isTracking={isTracking}
                          setIsTracking={setIsTracking}
                          trackedDistance={trackedDistance}
                          trackedEmissions={trackedEmissions}
                          trackingMode={trackingMode}
                          setTrackingMode={setTrackingMode}
                          itinerarySummary={itinerarySummary}
                        />
                      </motion.div>
                    )}
                    {activeTab === 'booking' && (
                      <motion.div key="booking" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                        <BookingForm 
                          isMobile 
                          formRef={formRef}
                          handleSubmit={handleSubmit}
                          bookingDate={bookingDate}
                          setBookingDate={setBookingDate}
                          travelerCount={travelerCount}
                          setTravelerCount={setTravelerCount}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            <BookingForm 
              formRef={formRef}
              handleSubmit={handleSubmit}
              bookingDate={bookingDate}
              setBookingDate={setBookingDate}
              travelerCount={travelerCount}
              setTravelerCount={setTravelerCount}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-gray-400">Giá chỉ từ</span>
            <span className="text-lg font-black text-primary">{travelPackage.price.toLocaleString()} VNĐ</span>
          </div>
          <Button onClick={() => setActiveTab('booking')} className="flex-1 bg-primary text-white h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">
            Đặt Ngay <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
