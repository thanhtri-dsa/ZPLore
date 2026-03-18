'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DestinationCard } from '@/components/destinations/destination-card'
import { DestinationCardSkeleton } from '@/components/destinations/destinations-card-skeleton'
import { CountrySidebar } from '@/components/destinations/location-sidebar'
import { Destination } from '@/types/destinations'
import Image from 'next/image';
import DestinationsMapLoader from '@/components/ui/DestinationsMapLoader'
import { motion } from 'framer-motion'

interface DestinationsPageProps {
  initialDestinations: Destination[]
  country?: string
}

type StoredDestination = {
  id: string
  updatedAt: number
}

const RECENT_DESTINATIONS_KEY = 'ecoTour.recent.destinations.v1'
const FAVORITE_DESTINATIONS_KEY = 'ecoTour.favorites.destinations.v1'

function normalizeText(v: string) {
  try {
    return v.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  } catch {
    return v.toLowerCase()
  }
}

function readStoredList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export default function DestinationsPage({ initialDestinations, country }: DestinationsPageProps) {
  const [destinations] = useState<Destination[]>(initialDestinations)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'all' | 'favorites' | 'recent'>('all')
  const [sort, setSort] = useState<'featured' | 'price_asc' | 'price_desc' | 'name_asc'>('featured')
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set())
  const [recentMap, setRecentMap] = useState<Map<string, number>>(() => new Map())

  const itemsPerPage = 6

  useEffect(() => {
    try {
      const favorites = readStoredList<{ id: string }>(FAVORITE_DESTINATIONS_KEY)
      setFavoriteIds(new Set(favorites.map((d) => d.id)))
    } catch {
      setFavoriteIds(new Set())
    }

    try {
      const recent = readStoredList<StoredDestination>(RECENT_DESTINATIONS_KEY)
      const m = new Map<string, number>()
      for (const r of recent) {
        if (r && typeof r.id === 'string') m.set(r.id, typeof r.updatedAt === 'number' ? r.updatedAt : 0)
      }
      setRecentMap(m)
    } catch {
      setRecentMap(new Map())
    }
  }, [])

  const filteredDestinations = useMemo(() => {
    const byCountry = country
      ? destinations.filter((dest) => dest.country.toLowerCase() === country.toLowerCase())
      : destinations

    const q = query.trim()
    const byQuery =
      q.length === 0
        ? byCountry
        : byCountry.filter((d) => {
            const hay = normalizeText(
              [d.name, d.country, d.city, ...(Array.isArray(d.tags) ? d.tags : [])].filter(Boolean).join(' ')
            )
            const needle = normalizeText(q)
            return hay.includes(needle)
          })

    const byView =
      view === 'favorites'
        ? byQuery.filter((d) => favoriteIds.has(d.id))
        : view === 'recent'
          ? byQuery.filter((d) => recentMap.has(d.id))
          : byQuery

    const sorted =
      sort === 'price_asc'
        ? byView.slice().sort((a, b) => a.amount - b.amount)
        : sort === 'price_desc'
          ? byView.slice().sort((a, b) => b.amount - a.amount)
          : sort === 'name_asc'
            ? byView.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi'))
            : byView

    if (view === 'recent') {
      return sorted
        .slice()
        .sort((a, b) => (recentMap.get(b.id) ?? 0) - (recentMap.get(a.id) ?? 0))
    }

    return sorted
  }, [country, destinations, favoriteIds, query, recentMap, sort, view])

  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedDestinations = filteredDestinations.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [country, query, sort, view])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary/5">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-red-600">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-gray-600 text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-gray-900 text-white px-8 py-3 text-lg rounded-2xl"
          >
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden bg-primary h-[35vh] md:h-[45vh] flex items-center justify-center">
        <Image
          src="/images/packages.jpeg"
          alt="Eco-Tour Destinations"
          fill
          className="z-0 object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-[#f8fafc]" />
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-secondary text-primary font-black text-[10px] uppercase tracking-widest mb-4 shadow-xl">
              Khám phá vẻ đẹp thế giới
            </span>
            <h1 className="text-4xl md:text-7xl font-serif font-black text-white drop-shadow-2xl capitalize">
              {country 
                ? `Hành trình ${country}` 
                : 'Hành trình ước mơ'
              }
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-20 pb-20">
        {/* Destinations Map Section */}
        <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-white mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-serif font-black flex items-center gap-3 text-primary uppercase">
                <div className="h-6 md:h-8 w-1.5 bg-secondary rounded-full" />
                Bản đồ hành trình
              </h2>
              <p className="text-xs text-gray-400 font-medium italic">Khám phá các tọa độ du lịch xanh trên toàn cầu</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-inner h-[300px] md:h-[500px]">
            <DestinationsMapLoader destinations={filteredDestinations} country={country} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Country Sidebar */}
          <div className="w-full lg:w-64">
            <CountrySidebar />
          </div>

          {/* Destination Cards */}
          <div className="flex-1">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-primary uppercase tracking-tight">
                  {country ? `Khu vực ${country}` : "Toàn thế giới"}
                </h2>
                <p className="text-xs text-gray-500 font-medium italic">
                  Hiện có {filteredDestinations.length} điểm đến nổi bật
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-[260px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo tên, quốc gia, tag..."
                    className="pl-11 pr-10 rounded-2xl bg-white border-white shadow-sm"
                  />
                  {query.trim().length > 0 && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label="Xóa tìm kiếm"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={view === 'all' ? 'default' : 'outline'}
                    className="rounded-2xl"
                    onClick={() => setView('all')}
                    type="button"
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={view === 'favorites' ? 'default' : 'outline'}
                    className="rounded-2xl"
                    onClick={() => setView('favorites')}
                    type="button"
                  >
                    Yêu thích
                  </Button>
                  <Button
                    variant={view === 'recent' ? 'default' : 'outline'}
                    className="rounded-2xl"
                    onClick={() => setView('recent')}
                    type="button"
                  >
                    Gần đây
                  </Button>
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="h-10 rounded-2xl border border-white bg-white px-4 text-sm font-bold text-primary shadow-sm"
                >
                  <option value="featured">Sắp xếp: Mặc định</option>
                  <option value="price_asc">Giá: Thấp → Cao</option>
                  <option value="price_desc">Giá: Cao → Thấp</option>
                  <option value="name_asc">Tên: A → Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <DestinationCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {displayedDestinations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {displayedDestinations.map((destination) => (
                      <DestinationCard key={destination.id} destination={destination} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Không tìm thấy điểm đến nào
                    </h3>
                    <p className="text-gray-500 italic px-4">
                      {country
                        ? `Hiện tại chưa có điểm đến nào tại "${country}".`
                        : "Chúng tôi đang cập nhật thêm nhiều điểm đến mới."}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-2xl border-white bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-primary">
                    {currentPage}
                  </span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    / {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 rounded-2xl border-white bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
