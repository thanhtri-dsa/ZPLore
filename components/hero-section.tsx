'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MoveUpRight } from 'lucide-react'
import ScrollIndicator from '@/components/scroll-indicator'

// Define the structure of a carousel item
interface CarouselItem {
  image: string
  title: string
  subtitle: string
  link: string
}

// Carousel data
const carouselItems: CarouselItem[] = [
  {
    image: '/images/twelve.jpg',
    title: 'Khám Phá Đại Ngàn',
    subtitle: 'Chinh phục những đỉnh cao, lưu giữ kỷ niệm',
    link: '/packages'
  },
  {
    image: '/images/one.jpg',
    title: 'Hòa Mình Cùng Thiên Nhiên',
    subtitle: 'Khám phá thế giới động vật hoang dã',
    link: '/packages'
  },
  {
    image: '/images/lamu.jpg',
    title: 'Vẻ Đẹp Biển Đảo',
    subtitle: 'Trải nghiệm sang trọng và khoảnh khắc khó quên',
    link: '/packages'
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000) // Change slide every 5 seconds

    const handleScroll = () => {
      if (window.scrollY > 100) { // Hide after 100px of scrolling
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const backgroundVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      scale: direction > 0 ? 1.1 : 0.9,
      transition: { duration: 0 }
    }),
    animate: {
      opacity: 1,
      scale: 1.1,
      transition: {
        duration: 5,
        ease: 'easeInOut'
      }
    },
    exit: (direction: number) => ({
      opacity: 0,
      scale: direction > 0 ? 1.2 : 1,
      transition: {
        duration: 1.5,
        ease: 'easeInOut'
      }
    })
  }

  const currentItem = carouselItems[currentSlide]

  return (
    <section className="relative w-full h-screen overflow-hidden bg-primary">
      <div className="absolute inset-0">
        {/* Pattern overlay */}
        <div className="absolute inset-0 vn-pattern opacity-10 z-10" />
        {/* Previous/Current Background */}
        <motion.div
          key={`bg-${currentSlide}`}
          custom={direction}
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentItem.image})` }}
          />
        </motion.div>
      </div>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-20" />

      {/* Hero Content */}
      <div className="relative z-30 flex items-center justify-center w-full h-full text-center text-white px-4">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-md text-secondary text-sm font-bold tracking-[0.2em] uppercase">
              Trải nghiệm đẳng cấp
            </span>
          </motion.div>
          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl lg:text-9xl font-bold mb-6 font-serif leading-tight tracking-tight text-white drop-shadow-2xl"
          >
            {currentItem.title.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? "text-secondary italic" : ""}>{word} </span>
            ))}
          </motion.h1>
          <motion.p
            key={`subtitle-${currentSlide}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="text-xl md:text-3xl lg:text-4xl mb-12 font-light text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {currentItem.subtitle}
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href={currentItem.link}
              className="group relative inline-flex items-center px-10 py-4 bg-secondary text-secondary-foreground font-black rounded-full overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(255,184,0,0.3)] hover:shadow-[0_0_60px_rgba(255,184,0,0.5)]"
            >
              <span className="relative z-10 flex items-center">
                KHÁM PHÁ NGAY
                <MoveUpRight className="ml-2 h-6 w-6 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
              </span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            
            <button className="px-10 py-4 rounded-full border border-white/30 backdrop-blur-md text-white font-bold hover:bg-white hover:text-primary transition-all duration-500">
              TƯ VẤN VIP
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
        <ScrollIndicator isVisible={showScrollIndicator} />
      </div>
    </section>
  )
}
