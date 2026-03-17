'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Bike } from 'lucide-react'

export default function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if intro has been shown in this session
    const hasShownIntro = sessionStorage.getItem('ecoTourIntroShown')
    if (!hasShownIntro) {
      setIsVisible(true)
      // Hide after 4 seconds and save to session
      const timer = setTimeout(() => {
        setIsVisible(false)
        sessionStorage.setItem('ecoTourIntroShown', 'true')
      }, 4500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          className="fixed inset-0 z-[10000] bg-primary flex items-center justify-center overflow-hidden"
        >
          {/* Background Decorative Patterns */}
          <div className="absolute inset-0 vn-pattern opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-black/40" />

          {/* Floating Gold Lotus Elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-secondary opacity-10 pointer-events-none"
              initial={{ 
                x: Math.random() * 1000 - 500, 
                y: Math.random() * 1000 - 500,
                rotate: 0,
                scale: 0.5
              }}
              animate={{ 
                y: [0, -100, 0],
                rotate: 360,
                scale: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 10 + i * 2, 
                repeat: Infinity,
                ease: "linear" 
              }}
              style={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%` 
              }}
            >
              <Bike size={40 + i * 20} />
            </motion.div>
          ))}

          <div className="relative z-10 flex flex-col items-center text-center px-4">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="mb-8 relative"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)] relative z-10">
                <Bike className="w-12 h-12 md:w-16 md:h-16 text-primary" strokeWidth={2.5} />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-secondary rounded-[2rem] blur-2xl -z-10"
              />
              <div className="absolute -inset-4 border border-secondary/20 rounded-[2.5rem] animate-[spin_10s_linear_infinite]" />
            </motion.div>

            {/* Title Animation */}
            <div className="overflow-hidden mb-4">
              <motion.h1
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                className="text-5xl md:text-8xl font-serif font-black text-white tracking-tighter"
              >
                ZPLore <span className="text-secondary italic">VIP</span>
              </motion.h1>
            </div>

            {/* Subtitle Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] w-12 bg-secondary/40" />
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-secondary animate-pulse" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-secondary/80">Premium Sustainable Travel</span>
                  <Sparkles size={14} className="text-secondary animate-pulse" />
                </div>
                <div className="h-[1px] w-12 bg-secondary/40" />
              </div>

                            <p className="text-white/60 text-sm md:text-lg max-w-md font-medium italic leading-relaxed">
                &quot;Kiến tạo di sản xanh qua từng hành trình đẳng cấp.&quot;
              </p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
              className="h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent mt-16"
            />
          </div>

          {/* Corner Patterns */}
          <div className="absolute top-0 left-0 w-64 h-64 vn-pattern opacity-5 -ml-20 -mt-20 rotate-45" />
          <div className="absolute bottom-0 right-0 w-64 h-64 vn-pattern opacity-5 -mr-20 -mb-20 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
