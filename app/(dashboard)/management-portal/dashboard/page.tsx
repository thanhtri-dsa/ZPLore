import React from 'react'
import DashboardStats from '@/components/eco-tourism/DashboardStats'
import RecentBookings from '@/components/eco-tourism/RecentBookings'

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ml-12 lg:ml-0 tracking-tight">Dashboard</h2>
      </div>
      
      <DashboardStats />
      
      <div className="mt-6">
        <RecentBookings />
      </div>
    </div>
  )
}