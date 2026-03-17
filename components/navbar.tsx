'use client'

import * as React from "react"
import Link from "next/link"
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
    "🌟 Ưu đãi 20% cho tour khám phá Tây Bắc",
    "🍃 Trải nghiệm du lịch bền vững tại Hội An",
    "💎 Thành viên VIP được giảm thêm 10% tất cả dịch vụ",
    "🌍 Khám phá thế giới cùng ZPLore Việt Nam"
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] w-full transition-all duration-500">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[3px] bg-secondary z-[10000]"
        style={{ scaleX, originX: 0 }}
      />

      {/* Top Bar Ticker */}
      <div className={`hidden md:block bg-primary text-white/80 border-b border-white/5 transition-all duration-700 overflow-hidden ${isScrolled ? 'h-7 opacity-90' : 'h-10 opacity-100'}`}>
        <div className="container mx-auto px-4 h-full flex justify-between items-center text-[10px] font-bold tracking-[0.1em] uppercase">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-4 overflow-hidden w-[300px] relative">
              <motion.div 
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="whitespace-nowrap flex gap-8"
              >
                {promotions.map((promo, idx) => (
                  <span key={idx} className="text-secondary">{promo}</span>
                ))}
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <a href="tel:+84901234567" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Phone size={isScrolled ? 8 : 10} className="text-secondary" />
                <span className={isScrolled ? 'text-[9px]' : ''}>+84 901 234 567</span>
              </a>
              <a href="mailto:phamthanhtri@gmail.com" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Mail size={isScrolled ? 8 : 10} className="text-secondary" />
                <span className={isScrolled ? 'text-[9px]' : ''}>phamthanhtri@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer hover:text-secondary transition-colors group">
                <Globe size={isScrolled ? 8 : 10} className="text-secondary group-hover:rotate-180 transition-transform duration-700" />
                <span className={isScrolled ? 'text-[9px]' : ''}>Tiếng Việt</span>
              </div>
              <div className="flex items-center space-x-1.5 md:space-x-3 bg-white/5 px-2 md:px-4 py-1.5 md:py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer shadow-xl backdrop-blur-md">
                <Bike className="w-3.5 h-3.5 md:w-5 md:h-5 text-secondary group-hover:animate-bounce" />
                <span className="text-[10px] md:text-[13px] font-black uppercase tracking-widest text-secondary hidden sm:inline">
                  VIP Member
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className={`w-full transition-all duration-700 relative ${isScrolled ? 'bg-primary/95 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.3)] py-2 md:py-3' : 'bg-transparent py-3 md:py-8'}`}>
        {/* Subtle Vietnamese Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none vn-pattern rotate-180 overflow-hidden" />
        
        <nav className="container mx-auto px-4 relative z-[101]">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 md:space-x-5 group shrink-0">
              <div className="relative p-2 md:p-4 bg-white/5 rounded-[1rem] md:rounded-[1.5rem] group-hover:bg-secondary/20 transition-all duration-700 border border-white/10 group-hover:border-secondary/40 shadow-2xl overflow-hidden">
                <Bike className="h-6 w-6 md:h-9 md:w-9 text-secondary group-hover:rotate-[25deg] transition-transform duration-700 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-12 md:h-12 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/30 transition-all" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-4xl font-black text-secondary font-serif tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 origin-left">
                  ZPLore
                </span>
                <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                  <span className="text-[8px] md:text-[12px] font-black text-secondary/80 tracking-[0.3em] md:tracking-[0.5em] uppercase leading-none">
                    Việt Nam
                  </span>
                  <div className="h-[1px] md:h-[1.5px] w-4 md:w-8 bg-secondary/30 group-hover:w-12 transition-all duration-700" />
                  <Star size={8} className="md:w-3 md:h-3 text-secondary fill-secondary animate-pulse" />
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1 xl:space-x-3">
                <Link href="/" className="px-3 xl:px-6 py-3 text-white/90 hover:text-secondary transition-all font-bold text-[11px] xl:text-[12px] uppercase tracking-[0.2em] relative group">
                  Trang chủ
                  <span className="absolute bottom-0 left-3 xl:left-6 right-3 xl:right-6 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>

                <Link href="/dream-journey" className={`flex items-center gap-2 xl:gap-3 px-3 xl:px-6 py-3 transition-all font-bold text-[11px] xl:text-[12px] uppercase tracking-[0.2em] rounded-2xl text-white/90 hover:text-secondary hover:bg-white/5`}>
                  Hành trình ước mơ
                  <Sparkles size={14} className="text-secondary animate-pulse" />
                </Link>

                {['Gói du lịch', 'Tin tức', 'Liên hệ'].map((item) => (
                  <Link key={item} href={`/${item === 'Gói du lịch' ? 'packages' : item === 'Tin tức' ? 'blogs' : 'contact'}`} className="px-3 xl:px-6 py-3 text-white/90 hover:text-secondary transition-all font-bold text-[11px] xl:text-[12px] uppercase tracking-[0.2em] relative group">
                    {item}
                    <span className="absolute bottom-0 left-3 xl:left-6 right-3 xl:right-6 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 xl:space-x-4">
              <button onClick={() => setShowSearch(true)} className="hidden md:flex p-2 xl:p-3.5 text-white/80 hover:text-secondary hover:bg-white/10 rounded-xl xl:rounded-2xl transition-all border border-transparent hover:border-white/20">
                <Search size={18} className="xl:w-5 xl:h-5" />
              </button>
              <button className="hidden md:flex p-2 xl:p-3.5 text-white/80 hover:text-secondary hover:bg-white/10 rounded-xl xl:rounded-2xl transition-all border border-transparent hover:border-white/20">
                <User size={18} className="xl:w-5 xl:h-5" />
              </button>
              <div className="h-8 xl:h-10 w-[1px] bg-white/10 mx-1 xl:mx-2 hidden md:block" />
              <Link href="/packages">
                <Button className="hidden md:flex bg-secondary text-primary font-black px-6 xl:px-10 py-5 xl:py-7 rounded-xl xl:rounded-2xl hover:bg-white hover:text-primary transition-all duration-500 text-[10px] xl:text-[11px] uppercase tracking-[0.2em] border-none group shadow-2xl hover:scale-105 active:scale-95">
                  <span className="hidden xl:inline">Đặt Tour Ngay</span>
                  <span className="xl:hidden">Đặt Ngay</span>
                  <ChevronRight size={14} className="ml-1 xl:ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                </Button>
              </Link>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 p-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-white/10">
                    <Menu className="h-6 w-6 md:h-7 md:w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 border-l-white/10 w-full sm:w-[420px] bg-primary text-white [&>button]:hidden">
                  <MobileNav onClose={() => setIsOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10001] bg-primary/95 backdrop-blur-2xl p-4 md:p-20">
            <button onClick={() => setShowSearch(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <div className="max-w-4xl mx-auto pt-20">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary h-8 w-8" />
                <input autoFocus type="text" placeholder="Bạn muốn đi đâu hôm nay?" className="w-full bg-white/5 border-b-2 border-secondary/30 focus:border-secondary py-8 pl-20 pr-8 text-3xl md:text-5xl font-serif text-white placeholder:text-white/20 outline-none transition-all" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MobileNav = ({ onClose }: { onClose: () => void }) => {
  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Hành trình', href: '/destinations' },
    { label: 'Gói du lịch', href: '/packages' },
    { label: 'Tin tức', href: '/blogs' },
    { label: 'Liên hệ', href: '/contact' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
              <Bike className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black font-serif tracking-tight">ZPLore</span>
              <span className="text-[10px] font-bold tracking-[0.35em] text-secondary uppercase">Việt Nam</span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl px-4 py-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <span className="text-base font-black tracking-wide">{item.label}</span>
            <ChevronRight size={18} className="text-secondary" />
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-white/10">
          <a href="tel:+84901234567" className="flex items-center justify-between rounded-2xl px-4 py-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <span className="text-sm font-bold text-white/80">+84 901 234 567</span>
            <Phone size={18} className="text-secondary" />
          </a>
          <a href="mailto:phamthanhtri@gmail.com" className="mt-2 flex items-center justify-between rounded-2xl px-4 py-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <span className="text-sm font-bold text-white/80">phamthanhtri@gmail.com</span>
            <Mail size={18} className="text-secondary" />
          </a>
        </div>
      </div>

      <div className="px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+18px)] border-t border-white/10 bg-primary/95 backdrop-blur-xl">
        <Link href="/packages" onClick={onClose} className="block">
          <Button className="w-full bg-secondary text-primary font-black h-14 rounded-2xl uppercase tracking-[0.18em] text-[11px] shadow-2xl">
            Đặt Tour Ngay
            <ArrowUpRight size={18} className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Navbar
