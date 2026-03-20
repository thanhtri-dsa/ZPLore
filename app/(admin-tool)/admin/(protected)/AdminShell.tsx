'use client'

import React, { type ReactNode } from 'react'
import AdminSidebar from '@/components/eco-tourism/AdminSidebar'
import AdminTopNav from '@/components/eco-tourism/AdminTopNav'

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="relative flex min-h-screen font-sans selection:bg-emerald-500/20 selection:text-emerald-400 bg-[#040B1A]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.09),transparent_24%),radial-gradient(circle_at_70%_85%,rgba(59,130,246,0.08),transparent_22%)]" />
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="relative z-10 flex flex-col flex-1 md:ml-72 transition-all duration-500 ease-in-out">
        <AdminTopNav />
        
        <main className="flex-1 px-2 py-3 md:px-4 md:py-4 lg:px-5 lg:py-5 overflow-x-hidden">
          <div className="mx-auto max-w-none rounded-[1.35rem] border border-white/10 bg-[#071024]/85 backdrop-blur-xl p-3 md:p-4 lg:p-5 shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
            {children}
          </div>
        </main>
        
        <footer className="h-14 border-t border-white/5 bg-slate-950/40 flex items-center justify-between px-6 md:px-8 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          <span>Lang Nghe Travel Admin Studio v3.0</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">Tai lieu</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">Ho tro</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
