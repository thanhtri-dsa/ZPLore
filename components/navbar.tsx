'use client'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ChevronRight, Phone, Mail, Search, User, Globe, X, Star, Sparkles, Bike, ArrowUpRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [showSearch, setShowSearch] = React.useState(false)
  const pathname = usePathname()

  // Some pages (e.g. full-map explore) have busy backgrounds; force solid navbar for readability.
  const forceSolid = pathname === "/explore" || pathname?.startsWith("/explore/")

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearch(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const promotions = [
    "🌾 Khám phá làng nghề truyền thống – ưu đãi hấp dẫn",
    "🏺 Trải nghiệm làm gốm, dệt lụa cùng nghệ nhân",
    "🌿 Du lịch xanh kết hợp văn hóa làng nghề " ,
    "🎨 Workshop thủ công – tự tay tạo sản phẩm độc đáo"
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] w-full transition-all duration-500">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[3px] bg-emerald-500 z-[10000]"
        style={{ scaleX, originX: 0 }}
      />

      {/* Top Bar Ticker */}
      <div className={`hidden md:block bg-white/80 text-primary border-b border-primary/10 backdrop-blur-2xl transition-all duration-700 overflow-hidden ${isScrolled ? 'h-7 opacity-95' : 'h-10 opacity-100'}`}>
        <div className="container mx-auto px-4 h-full flex justify-between items-center text-[10px] font-bold tracking-[0.1em] uppercase">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-4 overflow-hidden w-[300px] relative">
              <motion.div 
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="whitespace-nowrap flex gap-8"
              >
                {promotions.map((promo, idx) => (
                  <span key={idx} className="text-emerald-700">{promo}</span>
                ))}
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-4 border-r border-primary/10 pr-6">
              <a href="tel:+84901234567" className="flex items-center gap-2 hover:text-emerald-700 transition-colors">
                <Phone size={isScrolled ? 8 : 10} className="text-emerald-600" />
                <span className={isScrolled ? 'text-[9px]' : ''}>+84 931 254 118 </span>
              </a>
              <a href="mailto:phamthanhtri@gmail.com" className="flex items-center gap-2 hover:text-emerald-700 transition-colors">
                <Mail size={isScrolled ? 8 : 10} className="text-emerald-600" />
                <span className={isScrolled ? 'text-[9px]' : ''}>langnghetravel.1898@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer hover:text-emerald-700 transition-colors group">
                <Globe size={isScrolled ? 8 : 10} className="text-emerald-600 group-hover:rotate-180 transition-transform duration-700" />
                <span className={isScrolled ? 'text-[9px]' : ''}>Tiếng Việt</span>
              </div>
              <a href="/me" className="inline-block">
              <div  className="flex items-center space-x-1.5 md:space-x-3 bg-emerald-50 px-2 md:px-4 py-1.5 md:py-2.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors group cursor-pointer shadow-lg">
                <Bike className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-700 group-hover:animate-bounce" />
                <span className="text-[10px] md:text-[13px] font-black uppercase tracking-widest text-emerald-800 hidden sm:inline">
                  Cá Nhân 
                </span>
              </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <header
        className={`w-full transition-all duration-700 relative ${
          isScrolled || forceSolid
            ? 'bg-white/90 backdrop-blur-2xl shadow-[0_10px_50px_rgba(2,44,34,0.12)] py-2 md:py-3 border-b border-primary/10'
            : 'bg-transparent py-4 md:py-8'
        }`}
      >
        {/* Subtle Vietnamese Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none vn-pattern rotate-180 overflow-hidden" />
        
        <nav className="container mx-auto px-4 relative z-[101]">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 md:space-x-5 group shrink-0">
              <div className="relative w-11 h-11 md:w-16 md:h-16 bg-white/70 rounded-[1rem] md:rounded-[1.5rem] group-hover:bg-emerald-50 transition-all duration-700 border border-white/70 group-hover:border-emerald-200 shadow-sm overflow-hidden">
                <Image
                  src="/images/lang-nghe-travel-logo.svg.png"
                  alt="Làng Nghề Travel"
                  fill
                  sizes="(max-width: 768px) 44px, 64px"
                  className="object-contain p-2 md:p-2.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-4xl font-black text-primary font-serif tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 origin-left">
                  Làng Nghề
                </span>
                <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                  <span className="text-[8px] md:text-[12px] font-black text-emerald-700/80 tracking-[0.32em] md:tracking-[0.5em] uppercase leading-none">
                    TRAVEL
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1 xl:space-x-3">
                {[
                  { label: "Trang chủ", href: "/" },
                  { label: "Khám phá", href: "/explore" },
                  { label: "Gói tour", href: "/packages" },
                  { label: "Cộng đồng", href: "/community" },
                  { label: "Liên hệ", href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 xl:px-5 py-3 text-primary/80 hover:text-primary transition-all font-black text-[11px] xl:text-[12px] uppercase tracking-[0.18em] relative group rounded-2xl hover:bg-emerald-500/10"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-3 xl:left-5 right-3 xl:right-5 h-0.5 bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 xl:space-x-4">
              <button
                suppressHydrationWarning
                onClick={() => setShowSearch(true)}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 xl:w-auto xl:h-auto p-0 xl:p-3.5 text-primary/70 hover:text-primary hover:bg-emerald-500/10 rounded-xl xl:rounded-2xl transition-all border border-primary/10 hover:border-emerald-500/20"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5 xl:w-5 xl:h-5" />
              </button>

              <Link href="/dream-journey" className="hidden lg:inline-flex">
                <Button className="h-10 xl:h-12 px-4 xl:px-6 rounded-2xl font-black uppercase tracking-[0.18em] text-[11px] xl:text-[12px] bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-95 transition-all">
                  <span className="flex items-center gap-2">
                    Tạo hành trình
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-primary hover:bg-emerald-500/10 p-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-primary/10">
                    <Menu className="h-6 w-6 md:h-7 md:w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 border-l border-slate-200 w-full sm:w-[420px] bg-white">
                  <MobileNav
                    onClose={() => setIsOpen(false)}
                    onSearch={() => {
                      setIsOpen(false)
                      setShowSearch(true)
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10001] bg-white/95 backdrop-blur-2xl px-4 py-[calc(env(safe-area-inset-top)+16px)] md:p-20">
            <button
              suppressHydrationWarning
              onClick={() => setShowSearch(false)}
              className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] md:top-8 md:right-8 text-slate-600 hover:text-slate-900 transition-colors w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              aria-label="Đóng tìm kiếm"
            >
              <X className="w-5 h-5 md:w-8 md:h-8" />
            </button>
            <div className="max-w-4xl mx-auto pt-14 md:pt-20">
              <div className="relative">
                <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-emerald-600 h-5 w-5 md:h-8 md:w-8" />
                <input
                  autoFocus
                  type="text"
                  inputMode="search"
                  placeholder="Bạn muốn đi đâu hôm nay?"
                  className="w-full bg-transparent border-b-2 border-emerald-500/30 focus:border-emerald-600 py-4 md:py-8 pl-12 md:pl-20 pr-4 md:pr-8 text-xl sm:text-2xl md:text-5xl font-serif text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MobileNav = ({ onClose, onSearch }: { onClose: () => void; onSearch: () => void }) => {
  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Khám phá', href: '/explore' },
    { label: 'Du lịch xanh', href: '/green-travel' },
    { label: 'Gói tour', href: '/packages' },
    { label: 'Cộng đồng', href: '/community' },
    { label: 'Hành trình', href: '/destinations'},
    { label: 'Cá nhân', href: '/me' },
    { label: 'Liên hệ', href: '/contact' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white text-primary">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="relative h-11 w-11 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <Image
                src="/images/lang-nghe-travel-logo.svg"
                alt="Làng Nghề Travel"
                fill
                sizes="44px"
                className="object-contain p-2"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black font-serif tracking-tight text-slate-900">Làng Nghề Travel</span>
              <span className="text-[10px] font-bold tracking-[0.35em] text-emerald-700 uppercase">Việt Nam</span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-700"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2">
        <button
          onClick={onSearch}
          className="w-full flex items-center justify-between rounded-2xl px-4 py-4 bg-slate-50 hover:bg-emerald-50 transition-colors border border-slate-200"
          aria-label="Mở tìm kiếm"
        >
          <span className="text-base font-black tracking-wide text-slate-900">Tìm kiếm</span>
          <Search size={18} className="text-emerald-600" />
        </button>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl px-4 py-4 bg-slate-50 hover:bg-emerald-50 transition-colors border border-slate-200"
          >
            <span className="text-base font-black tracking-wide text-slate-900">{item.label}</span>
            <ChevronRight size={18} className="text-emerald-600" />
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-200">
          <a href="tel:+84901234567" className="flex items-center justify-between rounded-2xl px-4 py-4 bg-slate-50 hover:bg-emerald-50 transition-colors border border-slate-200">
            <span className="text-sm font-bold text-slate-700">+84 901 234 567</span>
            <Phone size={18} className="text-emerald-600" />
          </a>
          <a href="mailto:phamthanhtri@gmail.com" className="mt-2 flex items-center justify-between rounded-2xl px-4 py-4 bg-slate-50 hover:bg-emerald-50 transition-colors border border-slate-200">
            <span className="text-sm font-bold text-slate-700">phamthanhtri@gmail.com</span>
            <Mail size={18} className="text-emerald-600" />
          </a>
        </div>
      </div>

      <div className="px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+18px)] border-t border-slate-200 bg-white/85 backdrop-blur-xl">
        <Link href="/dream-journey" onClick={onClose} className="block">
          <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-[0.18em] text-[12px] eco-gradient text-white hover:opacity-95">
            <span className="flex items-center justify-center gap-2">
              Tạo hành trình
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Navbar
