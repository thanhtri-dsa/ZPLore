'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FeaturesSection } from "@/components/home/features-section"
import { BlogsSection } from "@/components/home/offers-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { WorldMap } from "@/components/home/world-map"
import { DestinationCard } from "@/components/home/destination-card"
import { DestinationSkeleton } from "@/components/home/destination-sketelon"
import { EcoProductsSection } from "@/components/home/eco-products-section"
import { HomeMapSection } from "@/components/home/home-map-section"
import { motion } from 'framer-motion'
import { ArrowRight, Crown } from 'lucide-react'

interface Destination {
  id: string;
  imageData: string;
  name: string;
  amount: number;
  city: string;
}

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch destinations
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch('/api/destinations')
        if (!response.ok) {
          throw new Error('Failed to fetch destinations')
        }
        const data = await response.json()
        setDestinations(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching destinations:', error)
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  return (
    <main className="vn-pattern min-h-screen overflow-x-hidden">
      {/* Premium Hero Section */}
      <section className="relative h-screen min-h-[800px] w-full flex items-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src="/images/travel_detsinations.jpg" 
            alt="Hero Background" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-secondary text-primary font-black text-[10px] md:text-xs mb-8 tracking-[0.2em] uppercase shadow-2xl shadow-secondary/40 border border-white/30"
              >
                <Crown size={14} className="animate-pulse" />
                ZPLore Việt Nam • VIP Experience
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black text-white leading-[0.9] mb-8 drop-shadow-2xl">
                Hành Trình <br />
                <span className="text-secondary italic">Xanh</span> <span className="text-white/80 font-light">VIP</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl font-medium leading-relaxed italic drop-shadow-lg">
                &quot;Kiến tạo di sản xanh cho thế hệ tương lai thông qua những hành trình nghỉ dưỡng bền vững và đẳng cấp bậc nhất.&quot;
              </p>
              
              <div className="flex flex-wrap gap-6">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,184,0,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-secondary text-primary font-black rounded-full shadow-2xl shadow-secondary/30 transition-all flex items-center gap-3 uppercase tracking-widest text-sm shine-effect"
                >
                  Khám phá ngay
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/30 text-white font-black rounded-full transition-all uppercase tracking-widest text-sm"
                >
                  Liên hệ VIP
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Lotus Element */}
        <motion.div 
          initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
          animate={{ opacity: 0.15, rotate: 0, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] pointer-events-none"
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-secondary">
            <path d="M50 0C50 0 55 20 75 20C95 20 100 0 100 0C100 0 80 5 80 25C80 45 100 50 100 50C100 50 80 55 80 75C80 95 100 100 100 100C100 100 80 95 60 95C40 95 20 100 20 100C20 100 40 95 40 75C40 55 20 50 20 50C20 50 40 45 40 25C40 5 20 0 20 0C20 0 45 20 50 0Z" />
          </svg>
        </motion.div>
      </section>

      {/* Featured Destinations with refined styling */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-white/40 backdrop-blur-sm border-y border-white">
        <div className="absolute inset-0 vn-pattern opacity-[0.05]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:20 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-xs text-primary font-black uppercase tracking-[0.2em] mb-4 md:mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Hành trình tiêu biểu
              </div>
              <h2 className="text-3xl md:text-6xl font-serif font-black leading-tight text-primary">
                Trải nghiệm <span className="italic text-secondary drop-shadow-sm">tuyệt vời</span> nhất dành cho bạn
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hidden md:block"
            >
              <p className="text-muted-foreground text-lg italic max-w-md border-l-4 border-secondary pl-6">
                &quot;Mỗi điểm đến là một câu chuyện, mỗi hành trình là một di sản bền vững được chăm chút tỉ mỉ.&quot;
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[...Array(5)].map((_, index) => (
                <DestinationSkeleton key={index} />
              ))}
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground text-xl">Hiện tại chưa có điểm đến nào phù hợp</p>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {destinations.slice(0, 5).map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <DestinationCard
                    image={destination.imageData || "/images/lamu.jpg"}
                    title={destination.name}
                    price={destination.amount}
                    location={destination.city}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <HomeMapSection />
      <FeaturesSection />
      <CategoriesSection />
      <EcoProductsSection />
      <BlogsSection />
      <WorldMap />
      
      {/* Mobile Quick Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] md:hidden px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <Link href="/dream-journey" className="flex-1 h-12 rounded-2xl bg-secondary text-primary font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center">
            Khám phá ngay
          </Link>
          <Link href="/contact" className="h-12 px-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center">
            Liên hệ
          </Link>
        </div>
      </div>
    </main>
  )
}
