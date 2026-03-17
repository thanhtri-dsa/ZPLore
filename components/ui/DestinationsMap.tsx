'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Destination } from '@/types/destinations'
import Link from 'next/link'
import { Circle as LeafletCircle, CircleMarker as LeafletCircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import RoutingMachine from './RoutingMachine'

type GoogleMaps = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown
    Marker: new (opts: Record<string, unknown>) => { addListener: (event: string, handler: () => void) => void; setMap: (map: unknown) => void }
    InfoWindow: new () => { setContent: (content: HTMLElement) => void; open: (opts: Record<string, unknown>) => void; close: () => void }
    LatLng: new (lat: number, lng: number) => unknown
    LatLngBounds: new () => { extend: (pos: unknown) => void }
    Circle: new (opts: Record<string, unknown>) => { setMap: (map: unknown) => void }
    SymbolPath: { CIRCLE: unknown }
  }
}

const GOOGLE_MAPS_PROMISE_KEY = '__ecoTourGoogleMapsPromise'
const MAPBOX_PROMISE_KEY = '__ecoTourMapboxPromise'

function loadGoogleMaps(apiKey: string): Promise<GoogleMaps> {
  const w = window as unknown as Record<string, unknown>
  const existing = w[GOOGLE_MAPS_PROMISE_KEY]
  if (existing && typeof existing === 'object') {
    return existing as Promise<GoogleMaps>
  }

  const promise = new Promise<GoogleMaps>((resolve, reject) => {
    const googleExisting = (window as unknown as { google?: unknown }).google
    const hasMaps =
      !!googleExisting &&
      typeof googleExisting === 'object' &&
      'maps' in (googleExisting as Record<string, unknown>)
    if (hasMaps) {
      resolve(googleExisting as GoogleMaps)
      return
    }

    const callbackName = `__ecoTourInitGMaps_${Math.random().toString(16).slice(2)}`
    ;(window as unknown as Record<string, unknown>)[callbackName] = () => {
      const googleLoaded = (window as unknown as { google?: unknown }).google
      if (googleLoaded && typeof googleLoaded === 'object' && 'maps' in (googleLoaded as Record<string, unknown>)) {
        resolve(googleLoaded as GoogleMaps)
      } else {
        reject(new Error('Google Maps loaded but maps API is unavailable'))
      }
      try {
        delete (window as unknown as Record<string, unknown>)[callbackName]
      } catch {}
    }

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${encodeURIComponent(callbackName)}`
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })

  w[GOOGLE_MAPS_PROMISE_KEY] = promise as unknown
  return promise
}

type MapboxMarker = {
  setLngLat: (lngLat: [number, number]) => MapboxMarker
  setPopup: (popup: unknown) => MapboxMarker
  addTo: (map: unknown) => MapboxMarker
  remove: () => void
  getElement: () => HTMLElement
}

type MapboxGL = {
  accessToken: string
  Map: new (opts: Record<string, unknown>) => {
    on: (event: string, handler: () => void) => void
    remove: () => void
    fitBounds: (bounds: unknown, opts?: unknown) => void
    addSource: (id: string, source: unknown) => void
    getSource: (id: string) => unknown
    removeSource: (id: string) => void
    addLayer: (layer: unknown) => void
    getLayer: (id: string) => unknown
    removeLayer: (id: string) => void
  }
  Marker: new (opts?: Record<string, unknown>) => MapboxMarker
  Popup: new (opts?: Record<string, unknown>) => {
    setHTML: (html: string) => unknown
  }
  LngLatBounds: new () => {
    extend: (lngLat: [number, number]) => void
  }
}

function loadMapboxGL(): Promise<MapboxGL> {
  const w = window as unknown as Record<string, unknown>
  const existing = w[MAPBOX_PROMISE_KEY]
  if (existing && typeof existing === 'object') {
    return existing as Promise<MapboxGL>
  }

  const promise = new Promise<MapboxGL>((resolve, reject) => {
    const mbExisting = (window as unknown as { mapboxgl?: unknown }).mapboxgl
    if (mbExisting && typeof mbExisting === 'object') {
      resolve(mbExisting as MapboxGL)
      return
    }

    const linkId = 'ecoTourMapboxCss'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css'
      document.head.appendChild(link)
    }

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js'
    script.onload = () => {
      const mbLoaded = (window as unknown as { mapboxgl?: unknown }).mapboxgl
      if (mbLoaded && typeof mbLoaded === 'object') resolve(mbLoaded as MapboxGL)
      else reject(new Error('Mapbox GL loaded but mapboxgl is unavailable'))
    }
    script.onerror = () => reject(new Error('Failed to load Mapbox GL script'))
    document.head.appendChild(script)
  })

  w[MAPBOX_PROMISE_KEY] = promise as unknown
  return promise
}

function circlePolygon(center: [number, number], radiusMeters: number, steps = 64): number[][] {
  const [lat, lng] = center
  const earthRadius = 6371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const latRad = toRad(lat)
  const lngRad = toRad(lng)
  const angDist = radiusMeters / earthRadius

  const coords: number[][] = []
  for (let i = 0; i <= steps; i++) {
    const bearing = (2 * Math.PI * i) / steps
    const sinLat = Math.sin(latRad) * Math.cos(angDist) + Math.cos(latRad) * Math.sin(angDist) * Math.cos(bearing)
    const lat2 = Math.asin(sinLat)
    const y = Math.sin(bearing) * Math.sin(angDist) * Math.cos(latRad)
    const x = Math.cos(angDist) - Math.sin(latRad) * Math.sin(lat2)
    const lng2 = lngRad + Math.atan2(y, x)
    coords.push([toDeg(lng2), toDeg(lat2)])
  }
  return coords
}

interface DestinationsMapProps {
  destinations: Destination[];
  highlightCountry?: string;
}

const DestinationsMap: React.FC<DestinationsMapProps> = ({ destinations, highlightCountry }) => {
  const [aiWaypoints, setAiWaypoints] = useState<L.LatLng[]>([])
  const [ecoPoints, setEcoPoints] = useState<Array<{ lat: number, lng: number, label: string, type: string }>>([])

  useEffect(() => {
        const handleAiMapCommand = (e: { detail: { action: string; points: { lat: number; lng: number; }[]; eco_points: { lat: number; lng: number; label: string; type: string; }[]; }; }) => {
      const { action, points: newPoints, eco_points: newEcoPoints } = e.detail
      if (action === 'draw_route' && Array.isArray(newPoints)) {
        setAiWaypoints(newPoints.map(p => L.latLng(p.lat, p.lng)))
      }
      if (Array.isArray(newEcoPoints)) {
        setEcoPoints(newEcoPoints)
      }
    }

        window.addEventListener('ai-map-command', handleAiMapCommand as unknown as EventListener)
    return () => window.removeEventListener('ai-map-command', handleAiMapCommand as unknown as EventListener)
  }, [])

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const providerRaw = process.env.NEXT_PUBLIC_MAP_PROVIDER?.toLowerCase()
  const providerWanted =
    providerRaw === 'osm'
      ? 'osm'
      : providerRaw === 'google'
        ? 'google'
        : providerRaw === 'mapbox'
          ? 'mapbox'
          : mapboxToken
            ? 'mapbox'
            : googleKey
              ? 'google'
              : 'osm'
  const provider =
    providerWanted === 'mapbox' && !mapboxToken
      ? 'osm'
      : providerWanted === 'google' && !googleKey
        ? 'osm'
        : providerWanted

  const [isClient, setIsClient] = useState(false)
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const [mapboxReady, setMapboxReady] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const validDestinations = useMemo(
    () => destinations.filter((d) => d.latitude != null && d.longitude != null),
    [destinations]
  )

  const allPoints = useMemo<Array<[number, number]>>(
    () => validDestinations.map((d) => [d.latitude!, d.longitude!]),
    [validDestinations]
  )

  const highlightedPoints = useMemo<Array<[number, number]>>(() => {
    if (!highlightCountry) return []
    return validDestinations
      .filter((d) => d.country?.toLowerCase() === highlightCountry.toLowerCase())
      .map((d) => [d.latitude!, d.longitude!] as [number, number])
  }, [validDestinations, highlightCountry])

  const highlightCenter = useMemo<[number, number] | null>(() => {
    if (highlightedPoints.length === 0) return null
    return [
      highlightedPoints.reduce((sum, p) => sum + p[0], 0) / highlightedPoints.length,
      highlightedPoints.reduce((sum, p) => sum + p[1], 0) / highlightedPoints.length,
    ]
  }, [highlightedPoints])

  const highlightRadius = useMemo(() => {
    if (!highlightCenter) return 180_000
    if (highlightedPoints.length <= 1) return 180_000

    const distances = highlightedPoints.map((p) => {
      const R = 6371_000
      const toRad = (deg: number) => (deg * Math.PI) / 180
      const dLat = toRad(p[0] - highlightCenter[0])
      const dLng = toRad(p[1] - highlightCenter[1])
      const lat1 = toRad(highlightCenter[0])
      const lat2 = toRad(p[0])
      const s =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
    })

    const maxDist = Math.max(...distances)
    const radius = maxDist * 1.25
    return Math.min(400_000, Math.max(120_000, radius))
  }, [highlightCenter, highlightedPoints])

  const leafletIcon = useMemo(
    () =>
      L.icon({
        iconUrl: '/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: '/images/marker-shadow.png',
        shadowSize: [41, 41],
      }),
    []
  )

  useEffect(() => {
    let isCancelled = false
    if (!isClient) return
    if (provider === 'google' && googleKey) {
      loadGoogleMaps(googleKey)
        .then(() => {
          if (!isCancelled) setGoogleReady(true)
        })
        .catch(() => {})
    }
    if (provider === 'mapbox' && mapboxToken) {
      loadMapboxGL()
        .then(() => {
          if (!isCancelled) setMapboxReady(true)
        })
        .catch(() => {})
    }
    return () => {
      isCancelled = true
    }
  }, [googleKey, isClient, mapboxToken, provider])

  useEffect(() => {
    if (provider !== 'google') return
    if (!googleKey || !googleReady || !isClient) return
    const container = mapDivRef.current
    if (!container) return
    if (validDestinations.length === 0 || allPoints.length === 0) return

    let map: unknown = null
    let infoWindow: { setContent: (content: HTMLElement) => void; open: (opts: Record<string, unknown>) => void; close: () => void } | null = null
    const markers: Array<{ setMap: (m: unknown) => void }> = []
    let highlightCircle: { setMap: (m: unknown) => void } | null = null
    const highlightDots: Array<{ setMap: (m: unknown) => void }> = []

    loadGoogleMaps(googleKey)
      .then((google) => {
        if (!container) return
        const focusPoints = highlightedPoints.length > 0 ? highlightedPoints : allPoints
        const initial = focusPoints[0] || allPoints[0]

        map = new google.maps.Map(container, {
          center: { lat: initial[0], lng: initial[1] } as unknown as Record<string, unknown>,
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          backgroundColor: '#f8fafc',
        })

        const bounds = new google.maps.LatLngBounds()
        for (const p of focusPoints) {
          bounds.extend(new google.maps.LatLng(p[0], p[1]))
        }
        const mapRecord = map as unknown as Record<string, unknown>
        const fitBoundsFn = mapRecord['fitBounds']
        if (typeof fitBoundsFn === 'function') {
          ;(fitBoundsFn as (b: unknown, o?: unknown) => void)(bounds as unknown, { padding: 60 } as unknown)
        }

        infoWindow = new google.maps.InfoWindow()

        if (highlightCenter) {
          highlightCircle = new google.maps.Circle({
            map,
            center: { lat: highlightCenter[0], lng: highlightCenter[1] } as unknown as Record<string, unknown>,
            radius: highlightRadius,
            strokeColor: '#FFFF00',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: '#FFFF00',
            fillOpacity: 0.12,
          })

          for (const p of highlightedPoints) {
            const dot = new google.maps.Circle({
              map,
              center: { lat: p[0], lng: p[1] } as unknown as Record<string, unknown>,
              radius: 15000,
              strokeColor: '#FFFF00',
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: '#FFFF00',
              fillOpacity: 0.18,
            })
            highlightDots.push(dot)
          }
        }

        for (const dest of validDestinations) {
          const marker = new google.maps.Marker({
            map,
            position: { lat: dest.latitude!, lng: dest.longitude! } as unknown as Record<string, unknown>,
            title: dest.name,
          })

          marker.addListener('click', () => {
            if (!infoWindow) return
            const wrap = document.createElement('div')
            wrap.style.padding = '6px'

            const title = document.createElement('div')
            title.textContent = dest.name
            title.style.fontWeight = '800'
            title.style.color = '#065f46'
            title.style.marginBottom = '6px'
            wrap.appendChild(title)

            const meta = document.createElement('div')
            meta.textContent = `${dest.city}, ${dest.country}`
            meta.style.fontSize = '12px'
            meta.style.color = '#475569'
            meta.style.marginBottom = '10px'
            wrap.appendChild(meta)

            const a = document.createElement('a')
            a.href = `/destinations/${dest.country.toLowerCase()}/${dest.id}`
            a.textContent = 'View Details'
            a.style.display = 'inline-block'
            a.style.padding = '6px 10px'
            a.style.borderRadius = '999px'
            a.style.background = '#16a34a'
            a.style.color = '#fff'
            a.style.fontSize = '12px'
            a.style.fontWeight = '700'
            a.style.textDecoration = 'none'
            wrap.appendChild(a)

            infoWindow.setContent(wrap)
            infoWindow.open({ map, anchor: marker })
          })

          markers.push(marker)
        }
      })
      .catch(() => {})

    return () => {
      try {
        infoWindow?.close()
      } catch {}
      for (const m of markers) {
        try {
          m.setMap(null)
        } catch {}
      }
      try {
        highlightCircle?.setMap(null)
      } catch {}
      for (const d of highlightDots) {
        try {
          d.setMap(null)
        } catch {}
      }
      map = null
    }
  }, [allPoints, googleKey, googleReady, highlightCenter, highlightRadius, highlightedPoints, isClient, provider, validDestinations])

  useEffect(() => {
    if (provider !== 'mapbox') return
    if (!mapboxToken || !mapboxReady || !isClient) return
    const container = mapDivRef.current
    if (!container) return
    if (validDestinations.length === 0 || allPoints.length === 0) return

    let map: { remove: () => void } | null = null
    const markers: Array<{ remove: () => void }> = []

    loadMapboxGL()
      .then((mapboxgl) => {
        mapboxgl.accessToken = mapboxToken

        const focusPoints = highlightedPoints.length > 0 ? highlightedPoints : allPoints
        const initial = focusPoints[0] || allPoints[0]

        map = new mapboxgl.Map({
          container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initial[1], initial[0]],
          zoom: 4.8,
        }) as unknown as { remove: () => void }

        ;(map as unknown as { on: (e: string, h: () => void) => void }).on('load', () => {
          const bounds = new mapboxgl.LngLatBounds()
          for (const p of focusPoints) bounds.extend([p[1], p[0]])
          ;(map as unknown as { fitBounds: (b: unknown, o?: unknown) => void }).fitBounds(bounds as unknown, { padding: 60 } as unknown)

          if (highlightCenter) {
            const polygon = circlePolygon(highlightCenter, highlightRadius)
            const srcId = 'ecoTourCountryHighlight'
            const layerId = 'ecoTourCountryHighlightLayer'

            const getSource = (map as unknown as { getSource: (id: string) => unknown }).getSource(srcId)
            if (!getSource) {
              ;(map as unknown as { addSource: (id: string, src: unknown) => void }).addSource(srcId, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: { type: 'Polygon', coordinates: [polygon] },
                  properties: {},
                },
              })
              ;(map as unknown as { addLayer: (layer: unknown) => void }).addLayer({
                id: layerId,
                type: 'fill',
                source: srcId,
                paint: { 'fill-color': '#FFFF00', 'fill-opacity': 0.12 },
              })
              ;(map as unknown as { addLayer: (layer: unknown) => void }).addLayer({
                id: `${layerId}-outline`,
                type: 'line',
                source: srcId,
                paint: { 'line-color': '#FFFF00', 'line-width': 2, 'line-opacity': 0.9 },
              })
            }
          }

          for (const dest of validDestinations) {
            const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
              `<div style="padding:6px">
                <div style="font-weight:800;color:#065f46;margin-bottom:6px">${dest.name}</div>
                <div style="font-size:12px;color:#475569;margin-bottom:10px">${dest.city}, ${dest.country}</div>
                <a href="/destinations/${dest.country.toLowerCase()}/${dest.id}" style="display:inline-block;padding:6px 10px;border-radius:999px;background:#16a34a;color:#fff;font-size:12px;font-weight:700;text-decoration:none">View Details</a>
              </div>`
            )
            const marker = new mapboxgl.Marker().setLngLat([dest.longitude!, dest.latitude!]).setPopup(popup).addTo(map as unknown)
            markers.push(marker as unknown as { remove: () => void })
          }
        })
      })
      .catch(() => {})

    return () => {
      for (const m of markers) {
        try {
          m.remove()
        } catch {}
      }
      try {
        map?.remove()
      } catch {}
      map = null
    }
  }, [allPoints, highlightCenter, highlightRadius, highlightedPoints, isClient, mapboxReady, mapboxToken, provider, validDestinations])

  if (!isClient) return null

  if (validDestinations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30 rounded-xl border border-border">
        <div className="text-center px-6 py-10">
          <div className="text-sm font-bold text-primary mb-2">Chưa có tọa độ để hiển thị</div>
          <div className="text-xs text-muted-foreground">Vui lòng bổ sung latitude/longitude cho điểm đến.</div>
        </div>
      </div>
    )
  }

  if (provider === 'osm') {
    const focusPoints = highlightedPoints.length > 0 ? highlightedPoints : allPoints
    const centerPoint = focusPoints[0] || allPoints[0]

    return (
      <MapContainer
        center={centerPoint}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        {aiWaypoints.length >= 2 && <RoutingMachine waypoints={aiWaypoints} showPanel={false} />}

        {ecoPoints.map((p, idx) => (
          <Marker 
            key={`eco-${idx}`} 
            position={[p.lat, p.lng]} 
            icon={L.divIcon({
              className: 'eco-poi-icon',
              html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 shadow-lg flex items-center justify-center">
                      <span class="text-xs">${p.type === 'restaurant' ? '🥗' : (p.type === 'charging' ? '⚡' : '🌿')}</span>
                     </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-emerald-700 m-0">{p.label}</p>
                <p className="text-[10px] text-gray-500 m-0 capitalize italic">{p.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBoundsAndCenterLeaflet points={focusPoints} aiWaypoints={aiWaypoints} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />

        {highlightCenter && (
          <LeafletCircle
            center={highlightCenter}
            radius={highlightRadius}
            pathOptions={{ color: '#FFFF00', weight: 2, fillColor: '#FFFF00', fillOpacity: 0.12 }}
          />
        )}

        {highlightedPoints.map((p, idx) => (
          <LeafletCircleMarker
            key={`hl-${idx}-${p[0]}-${p[1]}`}
            center={p}
            radius={14}
            pathOptions={{ color: '#FFFF00', weight: 2, fillColor: '#FFFF00', fillOpacity: 0.25 }}
          />
        ))}

        {validDestinations.map((dest) => (
          <Marker key={dest.id} position={[dest.latitude!, dest.longitude!]} icon={leafletIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-green-700 m-0">{dest.name}</h3>
                <p className="text-sm text-gray-600 m-0 mb-2">
                  {dest.city}, {dest.country}
                </p>
                <Link
                  href={`/destinations/${dest.country.toLowerCase()}/${dest.id}`}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors inline-block no-underline"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    )
  }

  return (
    <div
      ref={mapDivRef}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        background: '#f8fafc',
      }}
    />
  )
}

export default DestinationsMap

function FitBoundsAndCenterLeaflet({ points, aiWaypoints }: { points: Array<[number, number]>, aiWaypoints: L.LatLng[] }) {
  const map = useMap()

  const pointsKey = useMemo(() => {
    const ptsStr = points.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join('|')
    const aiStr = aiWaypoints.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|')
    return `${ptsStr}-${aiStr}`
  }, [points, aiWaypoints])

  useEffect(() => {
    const allLatLngs: L.LatLng[] = []
    points.forEach(p => allLatLngs.push(L.latLng(p[0], p[1])))
    aiWaypoints.forEach(p => allLatLngs.push(p))

    if (allLatLngs.length === 0) return
    if (allLatLngs.length === 1) {
      map.setView(allLatLngs[0], 6, { animate: true, duration: 0.6 })
      return
    }
    const bounds = L.latLngBounds(allLatLngs)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true, duration: 0.6 })
  }, [map, pointsKey, points, aiWaypoints])

  return null
}
