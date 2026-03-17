'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { Destination } from '@/types/destinations'

const MapWithNoSSR = dynamic(() => import('./DestinationsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse rounded-lg">
      <div className="text-gray-400">Loading Destinations Map...</div>
    </div>
  ),
})

interface DestinationsMapLoaderProps {
  destinations: Destination[];
  country?: string;
}

const DestinationsMapLoader: React.FC<DestinationsMapLoaderProps> = ({ destinations, country }) => {
  return (
    <div className="w-full h-[400px] md:h-[500px] shadow-lg rounded-xl overflow-hidden border border-green-100">
      <MapWithNoSSR destinations={destinations} highlightCountry={country} />
    </div>
  )
}

export default DestinationsMapLoader
