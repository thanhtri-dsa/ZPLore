'use client'

 import React from 'react'
 import Link from 'next/link'
 import { usePathname } from 'next/navigation'
 import { Home, MapPin, Package, BookOpen, User } from 'lucide-react'
 import { motion } from 'framer-motion'

const MobileBottomNav = () => {
  const pathname = usePathname()
  const navItems = [
{ label: 'Hành Trình ', href: '/destinations', icon: MapPin },
{ label: 'Điểm đến', href: '/packages', icon: Package },
{ label: 'Trang Chủ ', href: '/', icon: Home },
{ label: 'Tin tức', href: '/blogs', icon: BookOpen },
{ label: 'Cá nhân', href: '/me', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center py-1.5 px-3 rounded-2xl relative transition-all group">
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-gray-400 group-hover:text-primary group-hover:bg-primary/5'}`}>
                <item.icon size={20} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
        {isActive && (
                <motion.div 
                  layoutId="bottomNavActive"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileBottomNav
