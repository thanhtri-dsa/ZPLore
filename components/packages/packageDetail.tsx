'use client'

import React, { useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Crown, Share2, Heart, ShieldCheck, ChevronRight, Leaf, Compass, Utensils, Award, Navigation, Play, Square, Info } from "lucide-react"
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

export default function PackageDestination({ package: travelPackage }: PackageDestinationProps) {
  const [bookingDate, setBookingDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [showMapPanel, setShowMapPanel] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLiked, setIsLiked] = useState(false)
  const [travelerCount, setTravelerCount] = useState(1)
  const formRef = React.useRef<HTMLFormElement>(null)

  // Wake Lock state to keep screen on
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  // Live Tracking States
  const [isTracking, setIsTracking] = useState(false)
  const [trackedDistance, setTrackedDistance] = useState(0)
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [trackingMode, setTrackingMode] = useState<TransportMode>('BUS')

  // Load saved tracking distance from localStorage on mount
  React.useEffect(() => {
    const savedDistance = localStorage.getItem(`trackedDistance_${travelPackage.id}`);
    if (savedDistance) {
      setTrackedDistance(parseFloat(savedDistance));
    }
  }, [travelPackage.id]);

  // Save tracking distance whenever it changes
  React.useEffect(() => {
    if (trackedDistance > 0) {
      localStorage.setItem(`trackedDistance_${travelPackage.id}`, trackedDistance.toString());
    }
  }, [trackedDistance, travelPackage.id]);

  // Wake Lock effect to keep screen alive during tracking
  React.useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isTracking) {
        try {
          const lock = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
          setWakeLock(lock);
          console.log("Wake Lock is active");
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

  // Local state for itinerary leg modes (to allow real-time changes)
  const [itineraryModes, setItineraryModes] = useState<Record<string, TransportMode>>({})

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'info' | 'itinerary' | 'booking'>('info')

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

  // Live Tracking Effect
  React.useEffect(() => {
    let watchId: number | null = null;
    if (isTracking && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          
          // Ignore updates with accuracy worse than 100 meters (poor signal)
          if (accuracy > 100) return;

          const newCoords = { lat, lng };

          if (lastCoords) {
            const distance = haversineDistanceKm(lastCoords, newCoords);
            // Only add distance if it's more than 10 meters to avoid GPS noise
            // but also not too large (e.g. > 5km in one jump) which could be a GPS jump
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
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
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
      <section className="relative h-[55vh] md:h-[70vh] w-full overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#f8fafc]" />
        </motion.div>

        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-8 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/packages">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4 md:mb-8 backdrop-blur-md border border-white/30 rounded-full px-4 md:px-6 h-9 md:h-11 text-xs md:text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
            </Link>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-6">
              <span className="bg-secondary text-secondary-foreground px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl">
                <Crown size={10} className="md:w-3 md:h-3" /> Gói Tour VIP
              </span>
              {itinerarySummary.totalSavings > 0 && (
                <span className="bg-primary text-primary-foreground px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl animate-pulse">
                  <Leaf size={10} className="md:w-3 md:h-3" /> -{itinerarySummary.totalSavings.toFixed(1)}kg CO2
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-7xl font-serif font-black text-white mb-3 md:mb-6 leading-tight drop-shadow-2xl">
              {travelPackage.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-white/90">
              <div className="flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/20">
                <MapPin className="text-secondary h-4 w-4 md:h-5 md:w-5" />
                <span className="font-bold tracking-wide text-xs md:text-base">{travelPackage.location}</span>
              </div>
              <div className="flex gap-2 md:gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 md:p-3 rounded-full backdrop-blur-md border border-white/30 transition-all ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Heart size={16} className="md:w-5 md:h-5" fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button className="p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all">
                  <Share2 size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Tab Navigation */}
      <div className="sticky top-[64px] md:top-[80px] z-40 lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'info', label: 'Thông tin', icon: Info },
            { id: 'itinerary', label: 'Lộ trình', icon: Navigation },
            { id: 'booking', label: 'Đặt Tour', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'info' | 'itinerary' | 'booking')}
              className={`flex-1 flex flex-col items-center py-3 px-1 transition-all relative ${
                activeTab === tab.id ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <tab.icon size={18} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 md:-mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content (Changes on Mobile) */}
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <AnimatePresence mode="wait">
              {/* Info Tab Content */}
              {(activeTab === 'info' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                <motion.div
                  key="info-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`${activeTab !== 'info' ? 'hidden lg:block' : 'block'} space-y-8 md:space-y-12`}
                >
                  {/* Quick Info Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { icon: Clock, label: "Thời lượng", value: travelPackage.duration, color: "text-blue-500", bg: "bg-blue-50" },
                      { icon: Users, label: "Số lượng", value: travelPackage.groupSize, color: "text-green-500", bg: "bg-green-50" },
                      { icon: DollarSign, label: "Giá gói", value: `${travelPackage.price.toLocaleString()} VNĐ`, color: "text-secondary", bg: "bg-secondary/10" },
                      { icon: ShieldCheck, label: "Bảo hiểm", value: "Gói Cao Cấp", color: "text-purple-500", bg: "bg-purple-50" },
                    ].map((item, i) => (
                      <div key={i} className={`${item.bg} p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500`}>
                        <div className={`${item.color} mb-2 md:mb-4 p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                          <item.icon size={16} className="md:w-6 md:h-6" />
                        </div>
                        <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-0.5 md:mb-1">{item.label}</p>
                        <p className="font-bold text-[10px] md:text-base text-gray-900 leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description Section */}
                  <div className="bg-white p-6 md:p-14 rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-[0.03] vn-pattern w-48 md:w-64 h-48 md:h-64 rotate-12" />
                    <h2 className="text-xl md:text-3xl font-serif font-black mb-5 md:mb-8 flex items-center gap-3 md:gap-4 text-primary">
                      <div className="h-6 md:h-8 w-1.5 bg-secondary rounded-full" />
                      Về gói hành trình
                    </h2>
                    <div className="mb-6 md:mb-8">
                      <p className="text-base md:text-2xl font-serif font-bold text-gray-800 mb-1 md:mb-2 italic leading-snug">
                        &quot;{travelPackage.name} - Trải nghiệm du hành xanh&quot;
                      </p>
                      <div className="h-1 w-12 md:w-20 bg-secondary rounded-full" />
                    </div>
                    <div className="prose prose-sm md:prose-lg max-w-none text-gray-600 leading-relaxed italic mb-8 md:mb-10">
                      {travelPackage.description}
                    </div>

                    <h3 className="text-xs md:text-xl font-black mb-5 md:mb-8 uppercase tracking-[0.15em] text-gray-400">Trải nghiệm đặc sắc:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {[
                        { 
                          icon: <Leaf size={18} />, 
                          title: "Di chuyển xanh", 
                          desc: "Toàn bộ bằng xe điện VinBus và xe đạp.",
                          color: "text-amber-600", bg: "bg-amber-50"
                        },
                        { 
                          icon: <Compass size={18} />, 
                          title: "Lộ trình linh hoạt", 
                          desc: "Tùy chỉnh điểm dừng theo sở thích của bạn.",
                          color: "text-yellow-600", bg: "bg-yellow-50"
                        },
                        { 
                          icon: <Utensils size={18} />, 
                          title: "Ẩm thực bản địa", 
                          desc: "Khám phá đặc sản tại các quán Eco-friendly.",
                          color: "text-orange-600", bg: "bg-orange-50"
                        },
                        { 
                          icon: <Award size={18} />, 
                          title: "Chứng chỉ Net-Zero", 
                          desc: "Nhận chứng chỉ bảo vệ môi trường sau tour.",
                          color: "text-secondary", bg: "bg-secondary/10"
                        }
                      ].map((item, index) => (
                        <div key={index} className={`${item.bg} p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white flex gap-4 md:gap-5 transition-all hover:shadow-lg`}>
                          <div className={`${item.color} p-3 md:p-4 bg-white rounded-xl md:rounded-2xl h-fit shadow-sm`}>
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-black text-sm md:text-xl text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-[10px] md:text-sm text-gray-500 font-medium italic leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Itinerary Tab Content */}
              {(activeTab === 'itinerary' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                <motion.div
                  key="itinerary-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`${activeTab !== 'itinerary' ? 'hidden lg:block' : 'block'} space-y-8 md:space-y-12`}
                >
                  {/* Tour Map Section */}
                  <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                      <div>
                        <h2 className="text-xl md:text-3xl font-serif font-black flex items-center gap-3 md:gap-4 text-primary">
                          <div className="h-6 md:h-8 w-1.5 bg-secondary rounded-full" />
                          Lộ trình di chuyển
                        </h2>
                        <p className="text-muted-foreground text-[10px] md:text-sm mt-1 italic">Bản đồ mô phỏng lộ trình du hành</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        {googleTripUrl && (
                          <Button asChild variant="outline" className="rounded-full h-8 md:h-10 px-3 md:px-6 text-[9px] md:text-xs font-bold border-primary/20 text-primary">
                            <a href={googleTripUrl} target="_blank" rel="noreferrer">Google Maps</a>
                          </Button>
                        )}
                        <Button 
                          onClick={() => setShowMapPanel(!showMapPanel)}
                          variant="outline"
                          className={`rounded-full h-8 md:h-10 px-3 md:px-6 text-[9px] md:text-xs font-bold transition-all ${showMapPanel ? 'bg-primary text-white' : 'border-primary/20 text-primary'}`}
                        >
                          {showMapPanel ? 'Đóng' : 'Chỉnh sửa'}
                        </Button>
                      </div>
                    </div>

                    <div className="h-[300px] md:h-[500px] w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border-2 md:border-4 border-white shadow-xl relative bg-gray-50">
                      <RouteMapLoader 
                        location={travelPackage.location} 
                        name={travelPackage.name} 
                        showPanel={showMapPanel}
                        points={mapPoints}
                      />
                    </div>

                    {/* Live Tracker Integration */}
                    <div className="mt-6 md:mt-8 rounded-2xl md:rounded-[2.5rem] border border-primary/10 bg-primary/5 p-5 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                        <div>
                          <div className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Live Tracker</div>
                          <div className="text-lg md:text-xl font-black text-primary">Theo dõi thực tế</div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          {!isTracking ? (
                            <Button onClick={() => setIsTracking(true)} className="rounded-full h-10 md:h-12 bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 text-[10px] md:text-sm px-4 md:px-6">
                              <Play size={14} className="md:w-4 md:h-4" /> Bắt đầu
                            </Button>
                          ) : (
                            <Button onClick={() => setIsTracking(false)} variant="destructive" className="rounded-full h-10 md:h-12 font-bold flex items-center gap-2 text-[10px] md:text-sm px-4 md:px-6">
                              <Square size={14} className="md:w-4 md:h-4" /> Dừng
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6">
                        <div className="rounded-xl md:rounded-2xl bg-white p-3 md:p-5 border border-white shadow-sm">
                          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Quãng đường</div>
                          <div className="text-base md:text-2xl font-black text-primary">
                            {trackedDistance.toFixed(2)} <span className="text-[10px] md:text-xs font-bold uppercase">km</span>
                          </div>
                        </div>
                        <div className="rounded-xl md:rounded-2xl bg-white p-3 md:p-5 border border-white shadow-sm">
                          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Khí thải</div>
                          <div className="text-base md:text-2xl font-black text-secondary">
                            {trackedEmissions.toFixed(2)} <span className="text-[10px] md:text-xs font-bold uppercase">kg</span>
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 rounded-xl md:rounded-2xl bg-white p-3 md:p-5 border border-white shadow-sm">
                          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Phương tiện</div>
                          <select 
                            value={trackingMode}
                            onChange={(e) => setTrackingMode(e.target.value as TransportMode)}
                            className="text-[10px] md:text-sm font-bold text-primary bg-transparent focus:outline-none w-full cursor-pointer"
                          >
                            {Object.entries(transportModeLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {isTracking && (
                        <div className="mb-6 space-y-3">
                          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center gap-2 text-green-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
                            Đang GPS Tracking...
                          </motion.div>
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                            <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[9px] md:text-[10px] text-amber-700 font-medium leading-relaxed italic">
                              Giữ màn hình luôn sáng để theo dõi chính xác nhất. Eco-Tour sẽ tự động cập nhật quãng đường của bạn.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Itinerary Steps */}
                      <div className="mt-8 md:mt-12 space-y-6 md:space-y-8 relative pl-6 md:pl-8 border-l-2 border-dashed border-primary/20">
                        {itinerarySummary.legs.map((leg, index) => (
                          <div key={leg.id} className="relative">
                            <div className="absolute -left-[35px] md:-left-[41px] top-0 bg-white p-1.5 md:p-2 rounded-full border-2 border-primary shadow-sm z-10">
                              <div className="text-primary"><Navigation size={12} className="md:w-4 md:h-4" /></div>
                            </div>
                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm">
                              <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary">Chặng {index + 1}</span>
                                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 italic">~{leg.distanceKm?.toFixed(1)} km</span>
                                  </div>
                                  <h4 className="text-sm md:text-lg font-bold text-gray-900">{leg.fromName} → {leg.toName}</h4>
                                  <p className="text-[10px] md:text-sm text-gray-500 italic mt-1">{transportModeLabels[leg.mode]} - Du hành xanh</p>
                                </div>
                                <div className="bg-primary/5 rounded-xl md:rounded-2xl p-2 md:p-4 text-center min-w-[80px] md:min-w-[100px]">
                                  <div className="text-[8px] md:text-[9px] font-black uppercase text-gray-400">Khí thải</div>
                                  <div className="text-base md:text-xl font-black text-primary">{leg.kgCo2e?.toFixed(2) || '0.00'}</div>
                                  <div className="text-[8px] md:text-[9px] font-bold text-primary/60 uppercase">kg CO2e</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Booking Tab Content (Only Mobile) */}
              {(activeTab === 'booking' && typeof window !== 'undefined' && window.innerWidth < 1024) && (
                <motion.div
                  key="booking-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="block lg:hidden"
                >
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="mb-8 text-center">
                      <h3 className="text-2xl font-serif font-black text-primary mb-2">Đặt Gói Hành Trình</h3>
                      <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em]">Cùng xây dựng tương lai xanh</p>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase ml-1 text-gray-400">Tên</Label>
                          <Input name="firstname" placeholder="Tên" className="rounded-xl h-12 bg-gray-50 border-none" required />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase ml-1 text-gray-400">Họ</Label>
                          <Input name="lastname" placeholder="Họ" className="rounded-xl h-12 bg-gray-50 border-none" required />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase ml-1 text-gray-400">Email</Label>
                        <Input name="email" type="email" placeholder="Email liên hệ" className="rounded-xl h-12 bg-gray-50 border-none" required />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase ml-1 text-gray-400">Số điện thoại</Label>
                        <Input name="phone" type="tel" placeholder="Số điện thoại" className="rounded-xl h-12 bg-gray-50 border-none" required />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase ml-1 text-gray-400">Khởi hành</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full h-12 rounded-xl bg-gray-50 border-none justify-start text-[10px] font-bold">
                                <Calendar className="mr-2 h-3 w-3 text-secondary" />
                                {bookingDate ? format(bookingDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-none">
                              <CalendarComponent mode="single" selected={bookingDate} onSelect={setBookingDate} disabled={(date) => date < new Date()} />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase ml-1 text-gray-400">Số khách</Label>
                          <Input name="guests" type="number" min="1" defaultValue={travelerCount} className="rounded-xl h-12 bg-gray-50 border-none" required onChange={(e) => setTravelerCount(Number(e.target.value) || 1)} />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-gray-900 text-white h-14 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt tour'}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Booking Sidebar (Desktop Only) */}
          <div id="booking-section" className="hidden lg:block lg:col-span-4">
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
        className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"
      >
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-gray-400 leading-none mb-1">Giá chỉ từ</span>
            <span className="text-base font-black text-primary leading-none">{travelPackage.price.toLocaleString()} VNĐ</span>
          </div>
          <Button 
            onClick={() => setActiveTab('booking')}
            className="flex-1 bg-primary hover:bg-gray-900 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl flex items-center justify-center gap-2 group"
          >
            Đặt Ngay
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
