'use client'

import { useState,} from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export default function DestinationsPage({ initialDestinations, country }: DestinationsPageProps) {
  const [destinations] = useState<Destination[]>(initialDestinations)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6

  const filteredDestinations = country
    ? destinations.filter((dest) =>
        dest.country.toLowerCase() === country.toLowerCase()
      )
    : destinations

  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedDestinations = filteredDestinations.slice(
    startIndex,
    startIndex + itemsPerPage
  )

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
