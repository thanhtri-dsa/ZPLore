'use client'

import React from 'react'
import DashboardStats from '@/components/eco-tourism/DashboardStats'
import RecentBookings from '@/components/eco-tourism/RecentBookings'
import DashboardChart from '@/components/eco-tourism/DashboardChart'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar, Sparkles, Plus, Download, Filter, Zap, Shield, Globe, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-12 gap-6 lg:gap-8"
    >
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6 lg:space-y-8">
        <motion.div variants={item}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                Trung tam dieu hanh
              </h1>
              <p className="text-sm text-slate-400 font-bold max-w-xl leading-relaxed">
                Theo doi van hanh he sinh thai du lich xanh theo thoi gian thuc.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-9 px-4 rounded-lg border-white/10 bg-white/5 backdrop-blur-md saas-shadow text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300">
                <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500" />
                Quy gan nhat
              </Button>
              <Button className="h-9 px-4 rounded-lg eco-gradient text-white shadow-lg shadow-emerald-900/40 text-xs font-black hover:scale-[1.02] transition-all duration-300">
                <Download className="mr-2 h-3.5 w-3.5" />
                Xuat bao cao
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <DashboardStats />
        </motion.div>
        
        <motion.div variants={item}>
          <div className="h-full saas-card p-1">
             <DashboardChart />
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <div className="xl:col-span-2 relative overflow-hidden rounded-2xl bg-slate-900/80 p-8 text-white group border border-white/5">
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Goi y toi uu</span>
                </div>
                <h3 className="text-xl font-black mb-2 tracking-tight leading-tight max-w-md">
                  Goi tour &quot;Safari Green&quot; dang tang nhanh o thi truong chau Au.
                </h3>
                <p className="text-slate-400 font-bold text-xs mb-6 leading-relaxed max-w-sm">
                  Tang cong suat them 15% cho mua he sap toi de dap ung nhu cau.
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <Button className="h-9 px-5 rounded-lg bg-white text-slate-900 font-black text-xs hover:scale-105 transition-all">
                    Cap nhat suc chua
                  </Button>
                  <Link href="/admin/manage-packages" className="text-xs font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
                    Phan tich xu huong <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8 flex flex-col justify-center">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-2xl shadow-black/50 group hover:border-emerald-500/20 transition-all duration-500 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-emerald-500/10 p-2.5 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Plus className="h-5 w-5 text-emerald-500" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="font-black text-base text-white mb-1">Tao hanh trinh moi</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  Them diem den moi vao he thong.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-2xl shadow-black/50 group hover:border-blue-500/20 transition-all duration-500 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-500/10 p-2.5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="font-black text-base text-white mb-1">Kiem tra he thong</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  Xem nhanh log bao mat va tinh toan ven.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="col-span-12 lg:col-span-4 xl:col-span-3">
        <motion.div variants={item} className="h-full">
          <div className="h-full saas-card p-1">
            <RecentBookings />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
