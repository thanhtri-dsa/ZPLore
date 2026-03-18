'use client'

import React, { type ReactNode } from 'react'
import AdminSidebar from '@/components/eco-tourism/AdminSidebar'
import AdminTopNav from '@/components/eco-tourism/AdminTopNav'

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div 
      className="flex min-h-screen font-sans selection:bg-emerald-500/20 selection:text-emerald-400"
      style={{
        background: `radial-gradient(circle at top left, rgba(16, 185, 129, 0.1), transparent 25%),
                   radial-gradient(circle at bottom right, rgba(22, 78, 99, 0.1), transparent 30%),
                   #0B1120`
      }}
    >
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 md:ml-72 transition-all duration-500 ease-in-out">
        <AdminTopNav />
        
        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-x-hidden pt-8">
          <div className="mx-auto max-w-none">
            {children}
          </div>
        </main>
        
        <footer className="h-16 border-t border-white/5 bg-slate-950/30 flex items-center justify-between px-10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          <span>Làng Nghề Travel Admin Studio v3.0</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">Documentation</span>
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">Support</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
