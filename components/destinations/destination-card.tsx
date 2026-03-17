import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, CalendarDays } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Destination } from '@/types/destinations'

interface DestinationCardProps {
  destination: Destination
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const fallbackImage = "/images/travel_detsinations.jpg"
  const src =
    typeof destination.imageData === 'string' && destination.imageData.trim().length > 0 && destination.imageData !== '/images/saigon.jpg'
      ? destination.imageData
      : fallbackImage

  return (
    <div className="h-full flex flex-col bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative pt-[66.66%] w-full">
        <Image
          src={src}
          alt={destination.name}
          fill
          className="absolute inset-0 object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col flex-grow p-4 space-y-3">
        <h2 className="text-lg md:text-xl font-bold mb-2 capitalize text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {destination.name}
        </h2>
        <div className="flex-grow space-y-2">
          <p className="text-gray-600 text-sm md:text-base capitalize flex items-center">
            <span className="mr-2"> <MapPin /></span>
            {destination.country}, {destination.city}
          </p>
          <p className="text-gray-600 text-sm md:text-base  flex items-center">
            <span className="mr-2"> <CalendarDays /></span>
            {destination.daysNights} {destination.tourType}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-700 font-semibold text-base md:text-lg">
            Kes. {destination.amount.toLocaleString()}
          </p>
          <Link 
            href={`/destinations/${destination.country.toLowerCase()}/${destination.id}`} 
            className="group"
          >
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white transition-all 
              duration-300 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 flex items-center"
            >
              <span className="mr-1 sm:mr-2 whitespace-nowrap">View Details</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Recommended Wrapper Component for Grid Layout
export function DestinationCardGrid({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full">
      {destinations.map((destination) => (
        <DestinationCard key={destination.id} destination={destination} />
      ))}
    </div>
  );
}
