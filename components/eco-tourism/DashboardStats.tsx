'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, Users, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  totalBlogs: number;
  totalBookings: number;
  totalRevenue: number;
  activeDestinations: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalBlogs: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeDestinations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [blogsRes, bookingsRes, destsRes] = await Promise.all([
          fetch('/api/blogs'),
          fetch('/api/bookings?limit=1000'),
          fetch('/api/destinations'),
        ]);

        if (!blogsRes.ok || !bookingsRes.ok || !destsRes.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }

        const [blogsData, bookingsData, destsData] = await Promise.all([
          blogsRes.json(),
          bookingsRes.json(),
          destsRes.json(),
        ]);

        const bookings = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : [];
        const revenue = bookings.reduce((acc: number, b: any) => acc + (parseFloat(b.price) || 0), 0);

        setStats({
          totalBlogs: Array.isArray(blogsData) ? blogsData.length : (blogsData.total || 0),
          totalBookings: bookingsData.total || 0,
          totalRevenue: revenue,
          activeDestinations: Array.isArray(destsData) ? destsData.length : (destsData.total || 0),
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Tong dat cho",
      value: stats.totalBookings.toLocaleString(),
      icon: Users,
      trend: "+12%",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Doanh thu",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+8.4%",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Diem den dang hoat dong",
      value: stats.activeDestinations.toLocaleString(),
      icon: MapPin,
      trend: "+2 new",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      label: "Bai viet",
      value: stats.totalBlogs.toLocaleString(),
      icon: BookText,
      trend: "+5.1%",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="bg-white/5 border-white/5 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {card.label}
            </CardTitle>
            <div className={`${card.bg} p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-500`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <div className="text-3xl font-black tracking-tight text-white mb-2">
              {card.value}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                <TrendingUp className="h-2.5 w-2.5 mr-1" />
                {card.trend}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider opacity-60">so voi ky truoc</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
