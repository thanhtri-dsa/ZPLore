'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MapPin, Info } from 'lucide-react'
import { Destination } from '@/types/destinations'

export function HomeMapSection() {
  const DestinationsMap = useMemo(() => dynamic(
    () => import('@/components/ui/DestinationsMap'),
    { 
      loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center">Đang tải bản đồ...</div>,
      ssr: false
    }
  ), [])

  // Mock destinations for the map
  const mockDestinations: Destination[] = [
  {
    id: '201',
    name: 'Làng mành trúc Tân Thông Hội',
    city: 'TP.HCM',
    country: 'Vietnam',
    amount: 0,
    tags: ['mành trúc', 'thủ công'],
    imageData: '',
    description: 'Làng nghề truyền thống nổi tiếng ở Củ Chi với sản phẩm từ tre',
    daysNights: 1,
    tourType: 'DAYS',
    latitude: 10.9730,
    longitude: 106.5080
  },
  {
    id: '202',
    name: 'Làng đan lát Thái Mỹ',
    city: 'TP.HCM',
    country: 'Vietnam',
    amount: 0,
    tags: ['đan lát', 'tre'],
    imageData: '',
    description: 'Chuyên đan giỏ, vật dụng từ tre nứa',
    daysNights: 1,
    tourType: 'DAYS',
    latitude: 11.0700,
    longitude: 106.5000
  },
  {
    id: '203',
    name: 'Làng làm nhang Lê Minh Xuân',
    city: 'TP.HCM',
    country: 'Vietnam',
    amount: 0,
    tags: ['nhang', 'truyền thống'],
    imageData: '',
    description: 'Làng làm nhang phục vụ tín ngưỡng và xuất khẩu',
    daysNights: 1,
    tourType: 'DAYS',
    latitude: 10.7285,
    longitude: 106.5670
  },
  {
    id: '204',
    name: 'Làng bánh tráng Phú Hòa Đông',
    city: 'TP.HCM',
    country: 'Vietnam',
    amount: 0,
    tags: ['ẩm thực', 'bánh tráng'],
    imageData: '',
    description: 'Làng nghề làm bánh tráng nổi tiếng ở Củ Chi',
    daysNights: 1,
    tourType: 'DAYS',
    latitude: 10.9230,
    longitude: 106.4700
  },
  {
    id: '205',
    name: 'Làng hoa kiểng Gò Vấp',
    city: 'TP.HCM',
    country: 'Vietnam',
    amount: 0,
    tags: ['hoa', 'nông nghiệp'],
    imageData: '',
    description: 'Làng trồng hoa truyền thống cung cấp cho TP.HCM',
    daysNights: 1,
    tourType: 'DAYS',
    latitude: 10.8380,
    longitude: 106.6680
  }
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Gold Pattern */}
      <div className="absolute inset-0 vn-pattern-gold opacity-[0.02] pointer-events-none" />
      
      {/* Lotus Background Pattern */}
      <div className="absolute -bottom-20 -right-20 opacity-10 pointer-events-none rotate-12 scale-125">
        <svg width="500" height="500" viewBox="0 0 100 100" fill="currentColor" className="text-primary">
          <path d="M50 0C50 0 55 20 75 20C95 20 100 0 100 0C100 0 80 5 80 25C80 45 100 50 100 50C100 50 80 55 80 75C80 95 100 100 100 100C100 100 80 95 60 95C40 95 20 100 20 100C20 100 40 95 40 75C40 55 20 50 20 50C20 50 40 45 40 25C40 5 20 0 20 0C20 0 45 20 50 0Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid gap-16 lg:grid-cols-3 items-center">
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs text-primary font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Khám phá trực quan
              </div>
              <h2 className="vn-title text-4xl md:text-5xl font-bold mb-6">Mạng lưới <br/><span className="text-primary italic font-serif">Hành trình Xanh</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed italic">
                &quot;Hành trình của chúng tôi trải dài khắp dải đất hình chữ S, nơi mỗi tọa độ là một cam kết về bảo tồn và đẳng cấp.&quot;
              </p>
              
              <div className="space-y-6 pt-8 border-t border-primary/10">
                {[
                  { label: "Bắc Bộ", color: "bg-blue-500", desc: "Bát Tràng , Vạn Phúc, Đông Hồ, Đại Bái, Đồng Xâm, Đồng Kỵ, Hạ Thái " },
                  { label: "Trung Bộ", color: "bg-red-500", desc: "Nón lá Huế , Làng hương Thủy Xuân , Mộc Kim Bồng" },
                  { label: "Nam Bộ", color: "bg-green-500", desc: "Mành trúc Tân Thông Hội, Gốm Lái Thiêu, Sơn mài Tương Bình Hiệp" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5 shadow-lg group-hover:scale-150 transition-transform`} />
                    <div>
                      <span className="text-sm font-bold text-primary block">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-morphism p-6 rounded-3xl border border-white shadow-xl mt-10">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Info className="text-primary shrink-0" size={24} />
                  </div>
                  <p className="text-sm font-medium text-primary/80 leading-relaxed">
                    Tương tác với bản đồ để xem chi tiết các gói tour VIP tại từng khu vực.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-2 h-[360px] sm:h-[420px] md:h-[520px] lg:h-[600px] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.15)] border-4 sm:border-6 lg:border-8 border-white relative group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <DestinationsMap destinations={mockDestinations} highlightCountry="Vietnam" />
            <div className="absolute top-6 right-6 z-20 glass-morphism px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Hệ thống định vị VIP</span>
            </div>
            
            {/* Map Overlay Decor */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
               <div className="bg-primary text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/20 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <MapPin className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Vùng hoạt động</p>
                    <p className="text-sm font-black">63 Tỉnh Thành</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
