'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Booking {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CONFIRMED' | 'CANCELLED'
  bookingDate: string | null
  numberOfGuests: number
  specialRequests: string
  destinationName: string
  price: string
}

interface BookingsResponse {
  bookings: Booking[]
  total: number
  page: number
  totalPages: number
}

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBookings = useCallback(async (retryCount = 0, maxRetries = 3) => {
    if (retryCount === 0) {
      setIsLoading(true)
    }
    try {
      const response = await fetch('/api/bookings')
      if (response.status !== 200) {
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchBookings(retryCount + 1, maxRetries)
        } else {
          console.error(`Failed to fetch bookings after ${maxRetries} attempts`)
          return
        }
      }
      const data: BookingsResponse = await response.json()
      // Handle potential missing bookings array
      const bookingsArray = data.bookings || []
      
      // Take only the 4 most recent bookings
      const recentBookings = [...bookingsArray]
        .sort((a, b) => {
          const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0
          const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 4)
      setBookings(recentBookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="col-span-3 border-none shadow-none bg-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-6 py-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1 opacity-80">
            <Users className="h-3 w-3" />
            <span>Truc tiep</span>
          </div>
          <CardTitle className="text-lg font-black tracking-tight text-white">Hoat dong gan day</CardTitle>
          <CardDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">4 su kien dat cho moi nhat</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchBookings()}
          disabled={isLoading}
          className="h-9 w-9 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            ))
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chua co dat cho</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-white/10 group-hover:text-white transition-all">
                    {booking.firstname[0]}{booking.lastname[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white">{booking.firstname} {booking.lastname}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[140px]">
                      {booking.destinationName || 'Eco Expedition'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className={`
                    text-[9px] font-black uppercase tracking-widest h-5 px-2 border
                    ${booking.status === 'COMPLETED' || booking.status === 'CONFIRMED' || booking.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : booking.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'}
                  `}>
                    {booking.status}
                  </Badge>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                    {formatDate(booking.bookingDate || null)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 border-t border-white/5">
          <Link href="/admin/view-bookings" className="w-full">
            <Button variant="ghost" className="w-full h-11 rounded-xl text-xs font-black text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              Xem tat ca nhat ky
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
