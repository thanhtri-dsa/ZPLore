'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, ArrowUpRight, Activity } from 'lucide-react'

export default function DashboardChart() {
  const [data, setData] = useState<{ name: string; total: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/bookings?limit=1000')
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        const bookings = Array.isArray(result.bookings) ? result.bookings : []

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthlyData: Record<string, number> = {}
        
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthName = months[d.getMonth()]
          monthlyData[monthName] = 0
        }

        bookings.forEach((booking: any) => {
          const date = new Date(booking.bookingDate || booking.createdAt)
          const monthName = months[date.getMonth()]
          if (monthlyData[monthName] !== undefined) {
            monthlyData[monthName] += 1
          }
        })

        const chartData = Object.entries(monthlyData).map(([name, total]) => ({
          name,
          total,
        }))

        setData(chartData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <p className="text-sm font-black text-white">{payload[0].value} Dat cho</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="col-span-4 border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-[280px] w-full rounded-2xl" />
        </CardContent>
      </Card>
    )
  }

  const totalGrowth = data.length > 1 ? ((data[data.length-1].total - data[0].total) / (data[0].total || 1) * 100).toFixed(1) : "0"

  return (
    <Card className="col-span-4 border-none shadow-none bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1 opacity-80">
            <Activity className="h-3 w-3" />
            <span>Tang truong</span>
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-slate-900">Toc do dat cho</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-bold">So luong dat tour theo chu ky</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 border border-emerald-100/50 shadow-sm shadow-emerald-900/5">
            <TrendingUp className="h-3 w-3" />
            +{totalGrowth}%
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">so voi 6 thang</div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                fontWeight={800}
                tickLine={false}
                axisLine={false}
                dy={15}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                fontWeight={800}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                animationDuration={2000}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#064e3b', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
