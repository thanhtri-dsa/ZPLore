'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
export const dynamic = 'force-dynamic'
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
  Footprints
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

export default function AIPlannerPage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [transport, setTransport] = useState('Xe điện')

  const [bookingDate, setBookingDate] = useState<Date>()
  const [travelerCount, setTravelerCount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
    const [aiRoutePoints, setAiRoutePoints] = useState<{ lat: number; lng: number; }[]>([])
  const [emissionsInfo, setEmissionsInfo] = useState<{ total_emissions: number; transport_breakdown: Record<string, unknown>; } | null>(null)
  const [ecoPoints, setEcoPoints] = useState<{ lat: number; lng: number; label: string; type: string; }[]>([])
  const [expertInsights, setExpertInsights] = useState<{ title: string; content: string; }[]>([])
  
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const s = sp.get('start') || ''
      const e = sp.get('end') || ''
      const t = sp.get('transport') || 'Xe điện'
      setStart(s)
      setEnd(e)
      setTransport(t)
      const fullPrompt = sp.get('fullPrompt')
      if (s && e) {
        const prompt = fullPrompt || `Hãy vẽ một hành trình ước mơ xanh TẠI VIỆT NAM từ ${s} đến ${e} bằng phương tiện ${t}. BẮT BUỘC: Nếu khởi hành từ miền Bắc, lộ trình phải đi qua ĐÀ NẴNG (16.0544, 108.2022) bằng TÀU HỎA qua đèo Hải Vân. Mọi địa điểm phải ở Việt Nam.`;
        const timer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { prompt } }));
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

    useEffect(() => {
    const handleAiMapCommand = (e: { detail: { action: string; points: { lat: number; lng: number; }[]; emissions_info: { total_emissions: number; transport_breakdown: Record<string, unknown>; }; eco_points: { lat: number; lng: number; label: string; type: string; }[]; expert_insights: { title: string; content: string; }[]; }; }) => {
      console.log("Received AI Map Command:", e.detail);
      const { action, points, emissions_info, eco_points, expert_insights } = e.detail;
      if (action === 'draw_route' && Array.isArray(points)) {
        setAiRoutePoints(points);
        if (emissions_info) setEmissionsInfo(emissions_info);
        if (eco_points) setEcoPoints(eco_points);
        if (expert_insights) setExpertInsights(expert_insights);
      }
    };

        window.addEventListener('ai-map-command', handleAiMapCommand as unknown as EventListener);
    return () => window.removeEventListener('ai-map-command', handleAiMapCommand as unknown as EventListener);
  }, []);

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-secondary mb-4">
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI-Generated Dream Journey</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-black text-primary leading-tight">
              Hành trình <span className="italic text-secondary">Ước mơ</span>
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <MapPin size={14} className="text-secondary" />
                <span className="text-xs font-bold text-gray-600">{start} &rarr; {end}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                {transport.includes('Bus') ? <Bus size={14} className="text-blue-500" /> : transport.includes('Điện') ? <Zap size={14} className="text-amber-500" /> : <Footprints size={14} className="text-emerald-500" />}
                <span className="text-xs font-bold text-gray-600">{transport}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-gray-200 hover:bg-white hover:border-secondary transition-all gap-2 text-xs font-bold">
              <Share2 size={16} /> Chia sẻ
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsLiked(!isLiked)}
              className={`rounded-2xl h-12 px-6 border-gray-200 transition-all gap-2 text-xs font-bold ${isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'hover:bg-white hover:border-red-200'}`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> Lưu hành trình
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Map and Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Map Section */}
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-white overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-primary flex items-center gap-4">
                  <div className="h-8 w-2 bg-secondary rounded-full" />
                  Lộ trình di chuyển
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-amber-50 border-amber-100 text-amber-700">
                    <Sparkles size={12} /> Hỏi AI đường đi
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full h-10 px-4 text-[10px] font-black uppercase tracking-widest border-gray-100">
                    Google Maps
                  </Button>
                  <Link href="/">
                    <Button variant="outline" size="sm" className="rounded-full h-10 px-4 text-[10px] font-black uppercase tracking-widest border-gray-100">
                      Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="h-[400px] md:h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-gray-50 shadow-inner relative">
                <RouteMapLoader 
                  location={end} 
                  name={`Hành trình ${start} - ${end}`} 
                  points={aiRoutePoints.length >= 2 ? aiRoutePoints : undefined}
                  ecoPoints={ecoPoints}
                />
              </div>
            </div>

            {/* Expert Insights Section Removed and moved to Chat */}
          </div>

          {/* Right Column: Booking Form */}
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-white p-10 sticky top-32">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
              
              <div className="mb-10 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest mb-4 border border-secondary/20">
                  <Crown size={12} /> Premium AI Planner
                </div>
                <h3 className="text-4xl font-serif font-black text-primary mb-2">Đặt Chỗ</h3>
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
                    {isLoading ? "Đang xử lý..." : <>Xác nhận hành trình <ChevronRight size={16} /></>}
                  </Button>
                </motion.div>

                <p className="text-[9px] text-center text-gray-400 font-medium px-4">
                  Hành trình được tùy chỉnh riêng bởi AI dựa trên sở thích của bạn.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  )
}
