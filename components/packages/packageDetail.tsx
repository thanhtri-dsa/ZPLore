'use client'

import React, { useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Crown, Star, Share2, Heart, CheckCircle2, ShieldCheck, ChevronRight, Leaf, Compass, Utensils, Award, Navigation, Play, Square, RefreshCcw, TreeDeciduous, Package as PackageIcon, Info } from "lucide-react"
import { motion } from 'framer-motion'
import { computeDistanceKm, computeLegKgCo2e, normalizeMode, transportModeLabels, haversineDistanceKm, TransportMode } from '@/lib/emissions'
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

export default function PackageDestination({ package: travelPackage }: PackageDestinationProps) {
  const [bookingDate, setBookingDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [showMapPanel, setShowMapPanel] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLiked, setIsLiked] = useState(false)
  const [travelerCount, setTravelerCount] = useState(1)
  const [showTripSummary, setShowTripSummary] = useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  // Local state for itinerary leg modes (to allow real-time changes)
  const [itineraryModes, setItineraryModes] = useState<Record<string, TransportMode>>({})

  // Initialize itinerary modes
  React.useEffect(() => {
    if (travelPackage.itinerary) {
      const modes: Record<string, TransportMode> = {}
      travelPackage.itinerary.forEach(leg => {
        modes[leg.id] = normalizeMode(leg.mode)
      })
      setItineraryModes(modes)
    }
  }, [travelPackage.itinerary])

  // Live Tracking States
  const [isTracking, setIsTracking] = useState(false)
  const [trackedDistance, setTrackedDistance] = useState(0)
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [trackingMode, setTrackingMode] = useState<TransportMode>('BUS')

  // Live Tracking Effect
  React.useEffect(() => {
    let watchId: number | null = null;
    if (isTracking && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const newCoords = { lat, lng };

          if (lastCoords) {
            const distance = haversineDistanceKm(lastCoords, newCoords);
            // Only add distance if it's more than 5 meters to avoid GPS noise
            if (distance > 0.005) {
              setTrackedDistance(prev => prev + distance);
              setLastCoords(newCoords);
            }
          } else {
            setLastCoords(newCoords);
          }
        },
        (error) => {
          console.error("Tracking error:", error);
          let errorMsg = "Lỗi định vị: Không thể theo dõi vị trí của bạn.";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Bạn đã chặn quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt để sử dụng tính năng này.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Không tìm thấy tín hiệu vị trí. Vui lòng kiểm tra GPS hoặc kết nối mạng của bạn.";
              break;
            case error.TIMEOUT:
              errorMsg = "Hết thời gian chờ lấy vị trí. Vui lòng thử lại.";
              break;
          }
          
          toast.error(errorMsg, {
            duration: 6000,
            action: {
              label: "Hướng dẫn",
              onClick: () => window.open("https://support.google.com/chrome/answer/142065", "_blank")
            }
          });
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, lastCoords]);

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
      
      // Calculate potential savings (compared to average CAR emission)
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
      const last = pts[pts.length - 1]
      if (last && Math.abs(last.lat - lat) < 0.000001 && Math.abs(last.lng - lng) < 0.000001) return
      pts.push({ lat, lng, label })
    }
    for (const leg of itinerarySummary.legs) {
      pushIfValid(leg.fromLat ?? null, leg.fromLng ?? null, leg.fromName)
      pushIfValid(leg.toLat ?? null, leg.toLng ?? null, leg.toName)
    }
    return pts.length >= 2 ? pts : undefined
  }, [itinerarySummary.legs])

  const emissionsByMode = useMemo(() => {
    const byMode = new Map<string, { km: number; kg: number }>()
    for (const leg of itinerarySummary.legs) {
      const key = leg.mode
      const current = byMode.get(key) ?? { km: 0, kg: 0 }
      byMode.set(key, {
        km: current.km + (leg.distanceKm ?? 0),
        kg: current.kg + (leg.kgCo2e ?? 0),
      })
    }
    return Array.from(byMode.entries()).sort((a, b) => b[1].kg - a[1].kg)
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

  const getLegTravelMode = (mode: string) => {
    if (mode === 'WALK') return 'walking'
    if (mode === 'BIKE') return 'bicycling'
    if (mode === 'BUS' || mode === 'TRAIN') return 'transit'
    if (mode === 'PLANE' || mode === 'BOAT') return 'transit'
    return 'driving'
  }

  const getLegGoogleUrl = (leg: (typeof itinerarySummary.legs)[number]) => {
    const enc = (v: string) => encodeURIComponent(v)
    const coord = (lat?: number | null, lng?: number | null) =>
      typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : null

    const origin = coord(leg.fromLat, leg.fromLng) ?? leg.fromName
    const destination = coord(leg.toLat, leg.toLng) ?? leg.toName
    const travelmode = getLegTravelMode(leg.mode)
    return `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(destination)}&travelmode=${enc(travelmode)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Đã copy link')
    } catch {
      toast.error('Không copy được link trên trình duyệt này')
    }
  }

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {}
    
    // First Name validation
    const firstname = formData.get('firstname') as string
    if (!firstname || firstname.trim().length < 2) {
      errors.firstname = 'First name must be at least 2 characters'
    }

    // Last Name validation
    const lastname = formData.get('lastname') as string
    if (!lastname || lastname.trim().length < 2) {
      errors.lastname = 'Last name must be at least 2 characters'
    }

    // Email validation
    const email = formData.get('email') as string
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phone = formData.get('phone') as string
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (!phone || !phoneRegex.test(phone)) {
      errors.phone = 'Please enter a valid phone number (min 10 digits)'
    }

    // Number of guests validation
    const guests = parseInt(formData.get('guests') as string, 10)
    if (isNaN(guests) || guests < 1) {
      errors.numberOfGuests = 'Number of guests must be at least 1'
    }

    // Booking date validation
    if (!bookingDate) {
      errors.bookingDate = 'Please select a booking date'
    } else {
      const today = new Date()
      if (bookingDate < today) {
        errors.bookingDate = 'Booking date cannot be in the past'
      }
    }

    return errors
  }

  const clearForm = () => {
    if (formRef.current) {
      formRef.current.reset()
      setBookingDate(undefined)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      toast.error('Please correct the errors in the form')
      return
    }

    const bookingData = {
      firstname: formData.get('firstname') as string,
      lastname: formData.get('lastname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      numberOfGuests: parseInt(formData.get('guests') as string, 10),
      bookingDate: bookingDate?.toISOString(),
      specialRequests: formData.get('special-requests') as string,
      destinationName: travelPackage.name,
      price: travelPackage.price
    }

    try {
      const response = await fetch('/api/packages/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      toast.success('Booking Successful', {
        description: 'Your package booking has been sent!',
        duration: 5000,
      })
      
      // Clear form after successful submission
      clearForm()
      setErrors({})
      
    } catch (error) {
      console.error('Error submitting booking:', error)
      toast.error('Booking Failed', {
        description: 'Unable to process your booking. Please try again.',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section Upgrade */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image 
            src={typeof travelPackage.imageUrl === 'string' && travelPackage.imageUrl.trim().length > 0 && travelPackage.imageUrl !== '/images/saigon.jpg' ? travelPackage.imageUrl : "/images/travel_detsinations.jpg"} 
            alt={travelPackage.name} 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#f8fafc]" />
        </motion.div>

        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/packages">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-6 md:mb-8 backdrop-blur-md border border-white/30 rounded-full px-4 md:px-6 h-10 md:h-11">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
              </Button>
            </Link>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <span className="bg-secondary text-secondary-foreground px-3 md:px-4 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                <Crown size={12} /> Gói Tour VIP
              </span>
              {itinerarySummary.totalSavings > 0 && (
                <span className="bg-primary text-primary-foreground px-3 md:px-4 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl animate-pulse">
                  <Leaf size={12} /> Giảm {itinerarySummary.totalSavings.toFixed(1)}kg CO2
                </span>
              )}
              <div className="flex items-center gap-1 text-secondary">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
              </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-serif font-black text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl">
              {travelPackage.name}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-medium italic mb-6 md:mb-8 max-w-2xl drop-shadow-lg">
              &quot;Du hành xanh, Dấu chân sạch&quot;
            </p>
            
            <div className="flex flex-wrap items-center gap-8 text-white/90">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
                <MapPin className="text-secondary h-5 w-5" />
                <span className="font-bold tracking-wide">{travelPackage.location}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-full backdrop-blur-md border border-white/30 transition-all ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Info Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Clock, label: "Thời lượng", value: travelPackage.duration, color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Users, label: "Số lượng", value: travelPackage.groupSize, color: "text-green-500", bg: "bg-green-50" },
                { icon: DollarSign, label: "Giá gói", value: `${travelPackage.price.toLocaleString()} VNĐ`, color: "text-secondary", bg: "bg-secondary/10" },
                { icon: ShieldCheck, label: "Bảo hiểm", value: "Gói Cao Cấp", color: "text-purple-500", bg: "bg-purple-50" },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500`}>
                  <div className={`${item.color} mb-3 md:mb-4 p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} className="md:w-6 md:h-6" />
                  </div>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                  <p className="font-bold text-xs md:text-base text-gray-900">{item.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Description Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-6 md:p-14 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-[0.03] vn-pattern w-64 h-64 rotate-12" />
              <h2 className="text-2xl md:text-3xl font-serif font-black mb-6 md:mb-8 flex items-center gap-3 md:gap-4 text-primary">
                <div className="h-6 md:h-8 w-1.5 bg-secondary rounded-full" />
                Về gói hành trình
              </h2>
              <div className="mb-6 md:mb-8">
                <p className="text-lg md:text-2xl font-serif font-bold text-gray-800 mb-2 italic">
                  &quot;Sài Gòn năng động qua góc nhìn bền vững&quot;
                </p>
                <div className="h-1 w-16 md:w-20 bg-secondary rounded-full" />
              </div>
              <div className="prose prose-sm md:prose-lg max-w-none text-gray-600 leading-relaxed italic mb-8 md:mb-10">
                &quot;{travelPackage.description}&quot;
              </div>

              <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 uppercase tracking-wider text-gray-400">Trải nghiệm Eco-Tour đặc sắc:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { 
                    icon: <Leaf className="w-6 h-6" />, 
                    emoji: "🌿",
                    title: "Di chuyển xanh", 
                    desc: "Toàn bộ bằng VinBus, xe đạp điện và đường thủy.",
                    color: "text-green-600",
                    bg: "bg-green-50",
                    border: "border-green-100"
                  },
                  { 
                    icon: <Compass className="w-6 h-6" />, 
                    emoji: "🗺️",
                    title: "Hành trình cá nhân", 
                    desc: "Tùy chỉnh điểm dừng theo sở thích thực tế.",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    border: "border-blue-100"
                  },
                  { 
                    icon: <Utensils className="w-6 h-6" />, 
                    emoji: "🍽️",
                    title: "Eco-Treat", 
                    desc: "Voucher trải nghiệm ẩm thực thực vật tại các quán đối tác.",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                    border: "border-emerald-100"
                  },
                  { 
                    icon: <Award className="w-6 h-6" />, 
                    emoji: "🏅",
                    title: "Chứng nhận Net-Zero", 
                    desc: "Nhận chứng chỉ giảm thải số (E-Certificate) sau chuyến đi.",
                    color: "text-secondary",
                    bg: "bg-secondary/10",
                    border: "border-secondary/20"
                  }
                ].map((item, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`${item.bg} ${item.border} border p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col gap-4 md:gap-5 transition-all duration-300 hover:shadow-xl relative overflow-hidden group`}
                    >
                      <div className="absolute top-4 right-6 text-2xl md:text-4xl opacity-20 group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0">
                        {item.emoji}
                      </div>
                      <div className={`${item.color} p-3 md:p-4 bg-white rounded-xl md:rounded-2xl w-fit shadow-sm group-hover:rotate-12 transition-transform`}>
                        <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                          {item.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-lg md:text-xl text-gray-900 mb-1 md:mb-2">{item.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed italic">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>

              {travelPackage.included.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h3 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-gray-400">Tiện ích đi kèm khác:</h3>
                  <div className="flex flex-wrap gap-3">
                    {travelPackage.included.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <CheckCircle2 className="text-secondary h-3 w-3 shrink-0" />
                        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-500">{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tour Map Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-serif font-black flex items-center gap-4 text-primary">
                    <div className="h-8 w-1.5 bg-secondary rounded-full" />
                    Lộ trình hành trình
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2 italic">Bản đồ mô phỏng lộ trình di chuyển của bạn</p>
                </div>
                <div className="flex items-center gap-4">
                  {googleTripUrl && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white px-6 h-10 text-xs font-bold transition-all"
                    >
                      <a href={googleTripUrl} target="_blank" rel="noreferrer">
                        Google Maps
                      </a>
                    </Button>
                  )}
                  {googleTripUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white px-6 h-10 text-xs font-bold transition-all"
                      onClick={() => copyToClipboard(googleTripUrl)}
                    >
                      Copy link
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowMapPanel(!showMapPanel)}
                    variant="outline"
                    className={`rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white px-6 h-10 text-xs font-bold transition-all ${showMapPanel ? 'bg-primary text-white' : ''}`}
                  >
                    {showMapPanel ? 'Đóng chỉnh sửa' : 'Chỉnh sửa lộ trình'}
                  </Button>
                  <div className="hidden sm:flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Tracking</span>
                  </div>
                </div>
              </div>

              <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative group bg-gray-50">
                <RouteMapLoader 
                  location={travelPackage.location} 
                  name={travelPackage.name} 
                  showPanel={showMapPanel}
                  points={mapPoints}
                />
                <div className="absolute top-4 right-4 z-20 glass-morphism px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">Tọa độ VIP</span>
                </div>
                
                {!showMapPanel && (
                  <div className="absolute bottom-6 left-6 z-20 glass-morphism p-4 rounded-2xl border border-white/50 max-w-[220px] hidden sm:block">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Mẹo dẫn đường</p>
                    <p className="text-[11px] text-gray-600 leading-tight italic">Kéo thả các điểm để khám phá lộ trình. Nhấn &quot;Chỉnh sửa&quot; để nhập địa chỉ cụ thể.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-[2.5rem] border border-primary/10 bg-primary/5 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Live Tracker</div>
                    <div className="text-xl font-black text-primary">Theo dõi hành trình thực tế</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isTracking ? (
                      <Button 
                        onClick={() => {
                          if (!window.isSecureContext && window.location.hostname !== 'localhost') {
                            toast.error("Trình duyệt yêu cầu kết nối HTTPS để sử dụng định vị GPS.");
                            return;
                          }
                          setIsTracking(true);
                          setLastCoords(null); // Reset starting point for new tracking session
                        }} 
                        className="rounded-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
                      >
                        <Play size={16} /> Bắt đầu theo dõi
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setIsTracking(false)} 
                        variant="destructive"
                        className="rounded-full font-bold flex items-center gap-2"
                      >
                        <Square size={16} /> Dừng theo dõi
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setTrackedDistance(0);
                        setLastCoords(null);
                      }}
                      className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white"
                      title="Reset quãng đường"
                    >
                      <RefreshCcw size={16} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="rounded-2xl bg-white p-5 border border-white/70 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Quãng đường</div>
                    <div className="text-2xl font-black text-primary flex items-baseline gap-1">
                      {trackedDistance.toFixed(2)} <span className="text-xs">km</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-5 border border-white/70 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Khí thải thực tế</div>
                    <div className="text-2xl font-black text-secondary flex items-baseline gap-1">
                      {trackedEmissions.toFixed(2)} <span className="text-xs">kg CO2e</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-5 border border-white/70 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Phương tiện</div>
                    <select 
                      value={trackingMode}
                      onChange={(e) => setTrackingMode(e.target.value as TransportMode)}
                      className="text-sm font-bold text-primary bg-transparent focus:outline-none w-full"
                    >
                      {Object.entries(transportModeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isTracking && (
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest mb-6"
                  >
                    <span className="w-2 h-2 bg-green-600 rounded-full" />
                    Đang theo dõi vị trí trực tiếp...
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="rounded-2xl bg-white p-6 border border-primary/10 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                      <TreeDeciduous size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase">Tương đương</div>
                      <div className="text-lg font-black text-gray-900">Trồng {Math.ceil(itinerarySummary.totalSavings / 0.5)} cây xanh</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-6 border border-primary/10 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                      <PackageIcon size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase">Tránh sử dụng</div>
                      <div className="text-lg font-black text-gray-900">{Math.ceil(itinerarySummary.totalSavings * 40)} túi nilon</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-[2rem] p-6 text-white mb-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Star size={24} fill="currentColor" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Green Points</h4>
                        <p className="text-xs text-white/80">Bạn nhận được {Math.floor(itinerarySummary.totalSavings * 10)} điểm cho tour này</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full border-white/40 text-white bg-transparent hover:bg-white hover:text-secondary">
                      Đổi quà ngay
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {['#NetZeroTravel', '#SustainableLiving', '#PersonalizedExperience', '#GreenCredit'].map(tag => (
                    <span key={tag} className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6 pt-6 border-t border-primary/10">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Eco Impact</div>
                    <div className="text-xl font-black text-primary">Ước tính khí thải cho lộ trình dự kiến</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-gray-600">
                      Số khách: <span className="text-primary">{travelerCount}</span>
                    </div>
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowTripSummary(true)}>
                      Kết thúc chuyến đi
                    </Button>
                  </div>
                </div>

                {itinerarySummary.legs.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic">
                    Tour này chưa có lộ trình chi tiết để tính CO2e. Admin có thể thêm các chặng (legs) trong trang quản trị.
                  </div>
                ) : (
                  <div className="relative pl-8 border-l-2 border-dashed border-primary/20 space-y-12 py-4">
                    {itinerarySummary.legs.map((leg, index) => (
                      <div key={leg.id} className="relative">
                        {/* Vertical Timeline Dot/Icon */}
                        <div className="absolute -left-[41px] top-0 bg-white p-2 rounded-full border-2 border-primary shadow-sm z-10">
                          {leg.mode === 'WALK' ? <Navigation size={16} className="text-primary" /> : 
                           leg.mode === 'BIKE' ? <Leaf size={16} className="text-green-600" /> : 
                           <PackageIcon size={16} className="text-blue-600" />}
                        </div>
                        
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                                  Chặng {index + 1}
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                  {leg.distanceKm != null ? `${leg.distanceKm.toFixed(1)} km` : ''}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">
                                {leg.fromName} → {leg.toName}
                              </h4>
                              <p className="text-sm text-gray-500 italic mb-4">
                                {leg.mode === 'BUS' ? "Tận hưởng sự mát mẻ trên bus điện" : 
                                 leg.mode === 'WALK' ? "Thong dong đi bộ ngắm cảnh" : 
                                 leg.mode === 'BIKE' ? "Đạp xe rèn luyện sức khỏe" : "Di chuyển linh hoạt"}
                                {leg.kgCo2e != null && ` • Giảm ${(leg.savings || 0).toFixed(2)}kg CO2`}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-3">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-full h-8 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary hover:text-white">
                                      <RefreshCcw size={12} className="mr-1" /> Đổi phương tiện
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48 p-2 rounded-2xl">
                                    <div className="space-y-1">
                                      {Object.entries(transportModeLabels).map(([key, label]) => (
                                        <button
                                          key={key}
                                          onClick={() => setItineraryModes(prev => ({ ...prev, [leg.id]: key as TransportMode }))}
                                          className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                            itineraryModes[leg.id] === key ? 'bg-primary text-white' : 'hover:bg-gray-100'
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                
                                <a
                                  className="text-[10px] font-bold text-gray-400 hover:text-primary underline underline-offset-4"
                                  href={getLegGoogleUrl(leg)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Google Maps
                                </a>
                              </div>
                            </div>
                            
                            <div className="bg-primary/5 rounded-2xl p-4 text-center min-w-[100px]">
                              <div className="text-[9px] font-black uppercase text-gray-400 mb-1">Phát thải</div>
                              <div className="text-xl font-black text-primary">
                                {leg.kgCo2e != null ? leg.kgCo2e.toFixed(2) : '--'}
                              </div>
                              <div className="text-[9px] font-bold text-primary/60">kg CO2e</div>
                            </div>
                          </div>
                          {leg.note && (
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-start gap-2">
                              <Info size={14} className="text-gray-400 mt-0.5" />
                              <p className="text-xs text-gray-500 italic">{leg.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <AlertDialog open={showTripSummary} onOpenChange={setShowTripSummary}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tổng kết chuyến đi</AlertDialogTitle>
                <AlertDialogDescription>
                  Tổng kết CO2e dựa trên lộ trình và số khách hiện tại.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {itinerarySummary.legs.length === 0 && trackedDistance === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có lộ trình chi tiết hoặc dữ liệu theo dõi để tổng kết.</div>
              ) : (
                <div className="space-y-4">
                  {trackedDistance > 0 && (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4 mb-4">
                      <div className="text-sm font-black text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Navigation size={14} /> Hành trình thực tế
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] text-green-600 uppercase font-bold">Quãng đường di chuyển</div>
                          <div className="text-xl font-black text-green-800">{trackedDistance.toFixed(2)} km</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-green-600 uppercase font-bold">Khí thải thực tế ({transportModeLabels[trackingMode]})</div>
                          <div className="text-xl font-black text-green-800">{trackedEmissions.toFixed(2)} kg</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Số khách</div>
                      <div className="text-lg font-semibold">{travelerCount}</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Lộ trình dự kiến</div>
                      <div className="text-lg font-semibold">{itinerarySummary.totalDistanceKm.toFixed(1)} km</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Dự kiến CO2e</div>
                      <div className="text-lg font-semibold">{itinerarySummary.totalKgCo2e.toFixed(2)} kg</div>
                    </div>
                  </div>

                  {itinerarySummary.legs.length > 0 && (
                    <div className="rounded-xl border p-3">
                      <div className="text-sm font-semibold mb-2">Dự kiến theo phương tiện</div>
                      <div className="space-y-2">
                        {emissionsByMode.map(([mode, v]) => (
                          <div key={mode} className="flex items-center justify-between text-sm">
                            <div className="font-medium">{transportModeLabels[mode as keyof typeof transportModeLabels] ?? mode}</div>
                            <div className="text-muted-foreground">{v.km.toFixed(1)} km • {v.kg.toFixed(2)} kg CO2e</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel>Đóng</AlertDialogCancel>
                <AlertDialogAction onClick={() => setShowTripSummary(false)}>Xong</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Booking Sidebar */}
          <div id="booking-section" className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32"
            >
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
                
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-serif font-black text-primary mb-2">Đặt Gói Ngay</h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Khởi đầu hành trình xanh của bạn</p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-2 text-gray-400" htmlFor="firstname">Tên</Label>
                      <Input 
                        id="firstname" 
                        name="firstname" 
                        placeholder="VD: Anh" 
                        className={`rounded-2xl h-14 bg-gray-50 border-none focus:ring-2 focus:ring-secondary ${errors.firstname ? 'ring-2 ring-red-500' : ''}`}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-2 text-gray-400" htmlFor="lastname">Họ</Label>
                      <Input 
                        id="lastname" 
                        name="lastname" 
                        placeholder="VD: Nguyễn" 
                        className={`rounded-2xl h-14 bg-gray-50 border-none focus:ring-2 focus:ring-secondary ${errors.lastname ? 'ring-2 ring-red-500' : ''}`}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase ml-2 text-gray-400" htmlFor="email">Email liên hệ</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="example@gmail.com" 
                      className={`rounded-2xl h-14 bg-gray-50 border-none focus:ring-2 focus:ring-secondary ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase ml-2 text-gray-400" htmlFor="phone">Số điện thoại</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="+84 ..." 
                      className={`rounded-2xl h-14 bg-gray-50 border-none focus:ring-2 focus:ring-secondary ${errors.phone ? 'ring-2 ring-red-500' : ''}`}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-2 text-gray-400">Ngày khởi hành</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full h-14 rounded-2xl bg-gray-50 border-none justify-start text-left font-normal ${
                              errors.bookingDate ? 'ring-2 ring-red-500' : ''
                            }`}
                          >
                            <Calendar className="mr-2 h-4 w-4 text-secondary" />
                            {bookingDate ? format(bookingDate, 'dd/MM/yyyy', { locale: vi }) : <span className="text-gray-400">Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                          <CalendarComponent
                            mode="single"
                            selected={bookingDate}
                            onSelect={setBookingDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase ml-2 text-gray-400" htmlFor="guests">Số khách</Label>
                      <Input 
                        id="guests" 
                        name="guests" 
                        type="number" 
                        min="1" 
                        max="50"
                        placeholder="2" 
                        defaultValue={travelerCount}
                        className={`rounded-2xl h-14 bg-gray-50 border-none focus:ring-2 focus:ring-secondary ${errors.numberOfGuests ? 'ring-2 ring-red-500' : ''}`}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          setTravelerCount(Number.isFinite(n) && n > 0 ? Math.floor(n) : 1)
                        }}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase ml-2 text-gray-400" htmlFor="special-requests">Yêu cầu đặc biệt</Label>
                    <Textarea 
                      id="special-requests" 
                      name="special-requests" 
                      placeholder="Ghi chú thêm cho chúng tôi..." 
                      className="rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-secondary min-h-[100px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-gray-900 text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Clock size={20} />
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-3">
                        Xác nhận đặt ngay
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                  
                  <p className="text-[9px] text-center text-gray-400 px-4">
                    Bằng cách nhấn xác nhận, bạn đồng ý với các <Link href="/terms" className="text-secondary underline">điều khoản dịch vụ</Link> của Eco-Tour Việt Nam.
                  </p>
                </form>
              </div>

              {/* Support Badge */}
              <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Thanh toán an toàn</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-200" />
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Hỗ trợ 24/7</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Mobile Sticky Booking Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 pb-8"
      >
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-gray-400">Giá chỉ từ</span>
            <span className="text-lg font-black text-primary">{travelPackage.price.toLocaleString()} VNĐ</span>
          </div>
          <Button 
            onClick={() => {
              const element = document.getElementById('booking-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 bg-primary hover:bg-gray-900 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group"
          >
            Đặt Tour Ngay
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
