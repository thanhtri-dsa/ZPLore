'use client'

import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

const MapLoader = () => {
  const ContactMap = useMemo(() => dynamic(
    () => import('@/components/ui/ContactMap'),
    { 
      loading: () => <p>A map is loading</p>,
      ssr: false
    }
  ), [])

  return <ContactMap lat={10.762622} lng={106.660172} popupText="TP. Hồ Chí Minh, Việt Nam" />
}

export default MapLoader
