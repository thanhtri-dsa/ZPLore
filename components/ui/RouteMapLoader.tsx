'use client'

import dynamic from 'next/dynamic'
import React, { useMemo, useState, useEffect } from 'react'

type RoutePoint = { lat: number; lng: number; label?: string }

const RouteMapLoader = ({
  location,
  showPanel = false,
  points,
  ecoPoints,
  disableGeolocation = false,
}: {
  location: string
  name: string
  showPanel?: boolean
  points?: RoutePoint[]
  ecoPoints?: Array<{ lat: number, lng: number, label: string, type: string }>
  disableGeolocation?: boolean
}) => {
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    const handleUserLocationUpdate = (e: any) => {
      setUserLocation(e.detail);
    };
    window.addEventListener('user-location-updated', handleUserLocationUpdate);
    
    if (disableGeolocation) return
    if (Array.isArray(points) && points.length >= 2) return
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
    return () => {
      window.removeEventListener('user-location-updated', handleUserLocationUpdate);
    };
  }, [disableGeolocation, points]);

  const RouteMap = useMemo(() => dynamic(
    () => import('@/components/ui/RouteMap'),
    { 
      loading: () => (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
          <p className="text-gray-500 font-medium">Loading Tour Map...</p>
        </div>
      ),
      ssr: false
    }
  ), [])

  const hasPoints = Array.isArray(points) && points.length >= 2

  // Use user location as start if available, otherwise default to HCM City
  let startPoint = { lat: 10.762622, lng: 106.660172, label: 'TP. Hồ Chí Minh' }
  
  if (userLocation) {
    startPoint = { lat: userLocation.lat, lng: userLocation.lng, label: 'Vị trí của bạn' }
  }
  
  // Create a mock destination coordinate based on the location name
  const locationLower = (location || '').toLowerCase()
  let destPoint = { lat: 10.7719, lng: 106.6983, label: location || 'Bến Thành, TP.HCM' }
  
  // Sample destinations in Vietnam
  if (locationLower.includes('hà nội')) destPoint = { lat: 21.0285, lng: 105.8542, label: 'Hà Nội' }
  else if (locationLower.includes('đà nẵng')) destPoint = { lat: 16.0544, lng: 108.2022, label: 'Đà Nẵng' }
  else if (locationLower.includes('nha trang')) destPoint = { lat: 12.2388, lng: 109.1967, label: 'Nha Trang' }
  else if (locationLower.includes('đà lạt')) destPoint = { lat: 11.9404, lng: 108.4583, label: 'Đà Lạt' }
  else if (locationLower.includes('phú quốc')) destPoint = { lat: 10.2899, lng: 103.9840, label: 'Phú Quốc' }
  else if (locationLower.includes('hạ long')) destPoint = { lat: 20.9599, lng: 107.0425, label: 'Hạ Long' }
  else if (locationLower.includes('huế')) destPoint = { lat: 16.4637, lng: 107.5909, label: 'Huế' }
  else if (locationLower.includes('cần thơ')) destPoint = { lat: 10.0452, lng: 105.7469, label: 'Cần Thơ' }
  else if (locationLower.includes('hồ chí minh') || locationLower.includes('saigon')) destPoint = { lat: 10.7719, lng: 106.6983, label: 'TP.HCM' }
  else if (locationLower.includes('sapa') || locationLower.includes('lào cai')) destPoint = { lat: 22.3364, lng: 103.8438, label: 'Sa Pa' }
  else if (locationLower.includes('ninh bình')) destPoint = { lat: 20.2506, lng: 105.9745, label: 'Ninh Bình' }
  else if (locationLower.includes('hội an')) destPoint = { lat: 15.8801, lng: 108.3380, label: 'Hội An' }
  else if (locationLower.includes('mũi né') || locationLower.includes('phan thiết')) destPoint = { lat: 10.9333, lng: 108.2833, label: 'Mũi Né' }
  else if (locationLower.includes('vũng tàu')) destPoint = { lat: 10.3460, lng: 107.0843, label: 'Vũng Tàu' }
  else if (locationLower.includes('quy nhơn')) destPoint = { lat: 13.7827, lng: 109.2197, label: 'Quy Nhơn' }
  else if (locationLower.includes('pleiku')) destPoint = { lat: 13.9833, lng: 108.0000, label: 'Pleiku' }
  else if (locationLower.includes('buôn ma thuột')) destPoint = { lat: 12.6667, lng: 108.0500, label: 'Buôn Ma Thuột' }
  else if (locationLower.includes('hà giang')) destPoint = { lat: 22.8233, lng: 104.9833, label: 'Hà Giang' }
  else if (locationLower.includes('cao bằng')) destPoint = { lat: 22.6667, lng: 106.2500, label: 'Cao Bằng' }
  else if (locationLower.includes('lạng sơn')) destPoint = { lat: 21.8500, lng: 106.7667, label: 'Lạng Sơn' }
  else if (locationLower.includes('đồ sơn') || locationLower.includes('hải phòng')) destPoint = { lat: 20.8449, lng: 106.6881, label: 'Hải Phòng' }
  else if (locationLower.includes('vinh')) destPoint = { lat: 18.6667, lng: 105.6667, label: 'Vinh' }
  else if (locationLower.includes('đồng hới') || locationLower.includes('quảng bình')) destPoint = { lat: 17.4833, lng: 106.6000, label: 'Đồng Hới' }
  else if (locationLower.includes('quy nhơn')) destPoint = { lat: 13.7750, lng: 109.2323, label: 'Quy Nhơn' }
  else if (locationLower.includes('an giang')) destPoint = { lat: 10.5000, lng: 105.1667, label: 'An Giang' }
  else if (locationLower.includes('kiên giang')) destPoint = { lat: 10.0000, lng: 105.1667, label: 'Kiên Giang' }
  else if (locationLower.includes('bạc liêu')) destPoint = { lat: 9.2833, lng: 105.7167, label: 'Bạc Liêu' }
  else if (locationLower.includes('cà mau')) destPoint = { lat: 9.1833, lng: 105.1500, label: 'Cà Mau' }
  
  const routePoints = hasPoints ? (points as RoutePoint[]) : [startPoint, destPoint]
  const pointsKey = hasPoints ? routePoints.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|') : ''

  return (
    <div className="w-full h-full relative">
      <RouteMap 
        key={`${location}-${hasPoints ? pointsKey : userLocation ? 'with-loc' : 'no-loc'}`} 
        points={routePoints} 
        zoom={hasPoints ? 12 : userLocation ? 12 : 7} 
        showPanel={showPanel} 
        ecoPoints={ecoPoints}
      />
    </div>
  )
}

export default RouteMapLoader
