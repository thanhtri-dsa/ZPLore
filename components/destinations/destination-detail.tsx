'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, CheckCircle2, ShieldCheck, Bike, Star, Share2, Heart, ChevronRight, Crown } from 'lucide-react'
import dynamic from 'next/dynamic'

const RouteMapLoader = dynamic(
  () => import('@/components/ui/RouteMapLoader'),
  { 
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-[2.5rem] flex items-center justify-center">Đang tải bản đồ hành trình...</div>,
    ssr: false
  }
)
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import Link from 'next/link'
import Image from 'next/image'
import { Destination } from '@/types/destinations'
import { motion } from 'framer-motion'

interface DestinationDetailProps {
  destination: Destination
}

interface BookingFormData {
  firstname: string
  lastname: string
  email: string
  phone: string
  numberOfGuests: string
  bookingDate?: string | Date
  specialRequests?: string
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const PHONE_REGEX = /^[+\d][\d\s-]{7,}$/

type StoredDestination = {
  id: string
  name: string
  country: string
  city: string
  amount: number
  imageData: string
  updatedAt: number
}

const RECENT_DESTINATIONS_KEY = 'ecoTour.recent.destinations.v1'
const FAVORITE_DESTINATIONS_KEY = 'ecoTour.favorites.destinations.v1'
const MAX_RECENT_DESTINATIONS = 12
const MAX_FAVORITE_DESTINATIONS = 50

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

function upsertById<T extends { id: string }>(items: T[], item: T, max: number) {
  const next = [item, ...items.filter((x) => x.id !== item.id)]
  return next.slice(0, max)
}

export default function DestinationDetail({ destination }: DestinationDetailProps) {
  const [bookingDate, setBookingDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<BookingFormData>>({})
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const favorites = readStoredList<StoredDestination>(FAVORITE_DESTINATIONS_KEY)
    setIsLiked(favorites.some((d) => d.id === destination.id))

    const recentItem: StoredDestination = {
      id: destination.id,
      name: destination.name,
      country: destination.country,
      city: destination.city,
      amount: destination.amount,
      imageData: destination.imageData,
      updatedAt: Date.now(),
    }
    const recent = readStoredList<StoredDestination>(RECENT_DESTINATIONS_KEY)
    writeStoredList(RECENT_DESTINATIONS_KEY, upsertById(recent, recentItem, MAX_RECENT_DESTINATIONS))
  }, [destination.amount, destination.city, destination.country, destination.id, destination.imageData, destination.name])

  const handleToggleFavorite = () => {
    const item: StoredDestination = {
      id: destination.id,
      name: destination.name,
      country: destination.country,
      city: destination.city,
      amount: destination.amount,
      imageData: destination.imageData,
      updatedAt: Date.now(),
    }
    setIsLiked((prev) => {
      const next = !prev
      const favorites = readStoredList<StoredDestination>(FAVORITE_DESTINATIONS_KEY)
      if (next) {
        writeStoredList(FAVORITE_DESTINATIONS_KEY, upsertById(favorites, item, MAX_FAVORITE_DESTINATIONS))
        toast.success('Đã thêm vào yêu thích')
      } else {
        writeStoredList(
          FAVORITE_DESTINATIONS_KEY,
          favorites.filter((d) => d.id !== destination.id)
        )
        toast.success('Đã bỏ yêu thích')
      }
      return next
    })
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = destination.name
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as Navigator & { share: (data: { title?: string; url?: string }) => Promise<void> }).share({ title, url })
        return
      }
    } catch {}

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && url) {
        await navigator.clipboard.writeText(url)
        toast.success('Đã copy link')
        return
      }
    } catch {}

    toast.error('Không thể chia sẻ lúc này')
  }

  const validateForm = (formData: FormData): Partial<BookingFormData> => {
    const errors: Partial<BookingFormData> = {}
    
    const firstname = formData.get('firstname') as string
    if (!firstname) errors.firstname = 'Vui lòng nhập tên'
    
    const lastname = formData.get('lastname') as string
    if (!lastname) errors.lastname = 'Vui lòng nhập họ'
    
    const email = formData.get('email') as string
    if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Email không hợp lệ'
    
    const phone = formData.get('phone') as string
    if (!phone || !PHONE_REGEX.test(phone)) errors.phone = 'Số điện thoại không hợp lệ'
    
    const guests = parseInt(formData.get('guests') as string, 10)
    if (isNaN(guests) || guests < 1) errors.numberOfGuests = 'Tối thiểu 1 khách'
    
    if (!bookingDate) errors.bookingDate = 'Vui lòng chọn ngày'
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      toast.error('Vui lòng kiểm tra lại thông tin biểu mẫu')
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
      destinationName: destination.name,
      price: destination.amount
    }

    try {
      const response = await fetch('/api/destinations/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) throw new Error('Failed to create booking')

      toast.success('Đặt Tour Thành Công', {
        description: 'Yêu cầu của bạn đã được gửi đến chuyên viên tư vấn VIP.',
        duration: 5000,
      })
      form.reset()
      setBookingDate(undefined)
      setErrors({})
    } catch {
      toast.error('Đặt Tour Thất Bại', {
        description: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section Upgrade */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image 
            src={typeof destination.imageData === 'string' && destination.imageData.trim().length > 0 && destination.imageData !== '/images/saigon.jpg' ? destination.imageData : "/images/travel_detsinations.jpg"} 
            alt={destination.name} 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#f8fafc]" />
        </motion.div>

        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/destinations">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-8 backdrop-blur-md border border-white/30 rounded-full px-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
              </Button>
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-secondary text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                <Crown size={12} /> Hành Trình VIP
              </span>
              <div className="flex items-center gap-1 text-secondary">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 leading-tight drop-shadow-2xl">
              {destination.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 text-white/90">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
                <MapPin className="text-secondary h-5 w-5" />
                <span className="font-bold tracking-wide">{destination.city}, {destination.country}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full backdrop-blur-md border border-white/30 transition-all ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button onClick={handleShare} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all">
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
                { icon: Clock, label: "Thời lượng", value: `${destination.daysNights} ${destination.tourType}`, color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Users, label: "Số lượng", value: "Tùy chọn", color: "text-green-500", bg: "bg-green-50" },
                { icon: DollarSign, label: "Giá từ", value: `${destination.amount.toLocaleString()} VNĐ`, color: "text-secondary", bg: "bg-secondary/10" },
                { icon: ShieldCheck, label: "Bảo hiểm", value: "Gói Cao Cấp", color: "text-purple-500", bg: "bg-purple-50" },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} p-6 rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500`}>
                  <div className={`${item.color} mb-4 p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                  <p className="font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Description Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-[0.03] vn-pattern w-64 h-64 rotate-12" />
              <h2 className="text-3xl font-serif font-black mb-8 flex items-center gap-4 text-primary">
                <div className="h-8 w-1.5 bg-secondary rounded-full" />
                Tổng quan hành trình
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed italic mb-10">
                &quot;{destination.description}&quot;
              </div>

              <h3 className="text-xl font-black mb-6 uppercase tracking-wider text-gray-400">Trải nghiệm bao gồm:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl group hover:bg-primary hover:text-white transition-all duration-300">
                    <CheckCircle2 className="text-secondary h-5 w-5 shrink-0 group-hover:text-white" />
                    <span className="font-bold text-sm">{tag}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Premium Features */}
            <div className="bg-primary text-white p-12 rounded-[3rem] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 vn-pattern scale-150" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="bg-secondary/20 p-6 rounded-full border border-secondary/30">
                  <Bike size={48} className="text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-black mb-2">Đặc quyền Thành viên VIP</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Nhận ngay xe đưa đón hạng sang tại sân bay, hướng dẫn viên riêng và bữa tối 5 sao khi đặt tour qua hệ thống ZPLore VIP.</p>
                </div>
                <Button className="bg-secondary text-primary font-black px-8 py-6 rounded-2xl whitespace-nowrap hover:bg-white transition-all">Nâng cấp VIP</Button>
              </div>
            </div>

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
                <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Tracking</span>
                </div>
              </div>

              <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative group">
                <RouteMapLoader location={destination.city} name={destination.name} />
                <div className="absolute top-4 right-4 z-20 glass-morphism px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">Tọa độ VIP</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32"
            >
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
                
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-serif font-black text-primary mb-2">Đặt Tour Ngay</h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Khởi đầu hành trình xanh của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="1" 
                        className={`rounded-2xl h-14 bg-gray-50 border-none focus:ring-2 focus:ring-secondary ${errors.numberOfGuests ? 'ring-2 ring-red-500' : ''}`}
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
                    Bằng cách nhấn xác nhận, bạn đồng ý với các <Link href="/terms" className="text-secondary underline">điều khoản dịch vụ</Link> của ZPLore Việt Nam.
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
    </div>
  )
}
