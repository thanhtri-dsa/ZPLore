'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Destination } from '@/types/destinations'
import Link from 'next/link'
import Image from 'next/image'
import { Circle as LeafletCircle, CircleMarker as LeafletCircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import leafletMarkerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import leafletMarkerIcon from 'leaflet/dist/images/marker-icon.png'
import leafletMarkerShadow from 'leaflet/dist/images/marker-shadow.png'
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
  /**
   * Force the initial viewport to a fixed bounding box (e.g. Vietnam),
   * optionally preventing auto-fit to destinations.
   */
  fixedBounds?: { south: number; west: number; north: number; east: number };
  /** If true, keep the view constrained to `fixedBounds` (no auto-fit to points). */
  lockToBounds?: boolean;
  /** Extra markers to render (e.g. Hoàng Sa / Trường Sa). */
  extraMarkers?: Array<{ lat: number; lng: number; label: string }>;
}

const DestinationsMap: React.FC<DestinationsMapProps> = ({ destinations, highlightCountry, fixedBounds, lockToBounds, extraMarkers }) => {
  const [aiWaypoints, setAiWaypoints] = useState<L.LatLng[]>([])
  const [ecoPoints, setEcoPoints] = useState<Array<{ lat: number, lng: number, label: string, type: string }>>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const handleAiMapCommand = (e: Event) => {
      const { detail } = e as CustomEvent<{ action: string; points: { lat: number; lng: number }[]; eco_points: { lat: number; lng: number; label: string; type: string }[] }>;
      const { action, points: newPoints, eco_points: newEcoPoints } = detail;
      if (action === 'draw_route' && Array.isArray(newPoints)) {
        setAiWaypoints(newPoints.map(p => L.latLng(p.lat, p.lng)));
      }
      if (Array.isArray(newEcoPoints)) {
        setEcoPoints(newEcoPoints);
      }
    };

    window.addEventListener('ai-map-command', handleAiMapCommand);
    return () => window.removeEventListener('ai-map-command', handleAiMapCommand);
  }, []);

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

  const extraPoints = useMemo<Array<[number, number]>>(
    () => (Array.isArray(extraMarkers) ? extraMarkers.map((m) => [m.lat, m.lng] as [number, number]) : []),
    [extraMarkers]
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
        iconUrl: leafletMarkerIcon.src ?? (leafletMarkerIcon as unknown as string),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        // Open popup BELOW the marker (per UX request)
        popupAnchor: [0, 18],
        shadowUrl: leafletMarkerShadow.src ?? (leafletMarkerShadow as unknown as string),
        shadowSize: [41, 41],
      }),
    []
  )

  // Ensure Leaflet's default icon URLs are wired when markers are created elsewhere.
  // This avoids 404s for `/images/marker-*.png` in Next.js.
  useEffect(() => {
    // @ts-expect-error Leaflet's icon default typing is loose; this is a standard override.
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: leafletMarkerIcon2x.src ?? (leafletMarkerIcon2x as unknown as string),
      iconUrl: leafletMarkerIcon.src ?? (leafletMarkerIcon as unknown as string),
      shadowUrl: leafletMarkerShadow.src ?? (leafletMarkerShadow as unknown as string),
    })
  }, [])

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
    if (!fixedBounds && (validDestinations.length === 0 || allPoints.length === 0) && extraPoints.length === 0) return

    let map: unknown = null
    let infoWindow: { setContent: (content: HTMLElement) => void; open: (opts: Record<string, unknown>) => void; close: () => void } | null = null
    const markers: Array<{ setMap: (m: unknown) => void }> = []
    let highlightCircle: { setMap: (m: unknown) => void } | null = null
    const highlightDots: Array<{ setMap: (m: unknown) => void }> = []

    loadGoogleMaps(googleKey)
      .then((google) => {
        if (!container) return
        const focusPoints = highlightedPoints.length > 0 ? highlightedPoints : allPoints
        const initial =
          fixedBounds
            ? ([
                (fixedBounds.south + fixedBounds.north) / 2,
                (fixedBounds.west + fixedBounds.east) / 2,
              ] as [number, number])
            : (focusPoints[0] || allPoints[0] || extraPoints[0])

        map = new google.maps.Map(container, {
          center: { lat: initial[0], lng: initial[1] } as unknown as Record<string, unknown>,
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          backgroundColor: '#f8fafc',
          ...(fixedBounds
            ? {
                restriction: {
                  latLngBounds: {
                    north: fixedBounds.north,
                    south: fixedBounds.south,
                    east: fixedBounds.east,
                    west: fixedBounds.west,
                  },
                  strictBounds: true,
                },
              }
            : {}),
        })

        const bounds = new google.maps.LatLngBounds()
        if (fixedBounds) {
          bounds.extend(new google.maps.LatLng(fixedBounds.south, fixedBounds.west))
          bounds.extend(new google.maps.LatLng(fixedBounds.north, fixedBounds.east))
        } else {
          for (const p of [...focusPoints, ...extraPoints]) {
            bounds.extend(new google.maps.LatLng(p[0], p[1]))
          }
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

        for (const m of extraMarkers ?? []) {
          const mk = new google.maps.Marker({
            map,
            position: { lat: m.lat, lng: m.lng } as unknown as Record<string, unknown>,
            title: m.label,
          })
          mk.addListener('click', () => {
            if (!infoWindow) return
            const wrap = document.createElement('div')
            wrap.style.padding = '6px'
            const title = document.createElement('div')
            title.textContent = m.label
            title.style.fontWeight = '800'
            title.style.color = '#065f46'
            title.style.marginBottom = '6px'
            wrap.appendChild(title)
            const meta = document.createElement('div')
            meta.textContent = `Việt Nam`
            meta.style.fontSize = '12px'
            meta.style.color = '#475569'
            wrap.appendChild(meta)
            infoWindow.setContent(wrap)
            infoWindow.open({ map, anchor: mk })
          })
          markers.push(mk)
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
  }, [allPoints, googleKey, googleReady, highlightCenter, highlightRadius, highlightedPoints, isClient, provider, validDestinations, extraMarkers, extraPoints, fixedBounds])

  useEffect(() => {
    if (provider !== 'mapbox') return
    if (!mapboxToken || !mapboxReady || !isClient) return
    const container = mapDivRef.current
    if (!container) return
    if (!fixedBounds && (validDestinations.length === 0 || allPoints.length === 0) && extraPoints.length === 0) return

    let map: { remove: () => void } | null = null
    const markers: Array<{ remove: () => void }> = []

    loadMapboxGL()
      .then((mapboxgl) => {
        mapboxgl.accessToken = mapboxToken

        const focusPoints = highlightedPoints.length > 0 ? highlightedPoints : allPoints
        const initial =
          fixedBounds
            ? ([
                (fixedBounds.south + fixedBounds.north) / 2,
                (fixedBounds.west + fixedBounds.east) / 2,
              ] as [number, number])
            : (focusPoints[0] || allPoints[0] || extraPoints[0])

        map = new mapboxgl.Map({
          container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initial[1], initial[0]],
          zoom: 4.8,
          ...(fixedBounds
            ? {
                maxBounds: [
                  [fixedBounds.west, fixedBounds.south],
                  [fixedBounds.east, fixedBounds.north],
                ],
                renderWorldCopies: false,
              }
            : {}),
        }) as unknown as { remove: () => void }

        ;(map as unknown as { on: (e: string, h: () => void) => void }).on('load', () => {
          const bounds = new mapboxgl.LngLatBounds()
          if (fixedBounds) {
            bounds.extend([fixedBounds.west, fixedBounds.south])
            bounds.extend([fixedBounds.east, fixedBounds.north])
          } else {
            for (const p of [...focusPoints, ...extraPoints]) bounds.extend([p[1], p[0]])
          }
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

          for (const m of extraMarkers ?? []) {
            const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
              `<div style="padding:6px">
                <div style="font-weight:800;color:#065f46;margin-bottom:6px">${m.label}</div>
                <div style="font-size:12px;color:#475569">Việt Nam</div>
              </div>`
            )
            const marker = new mapboxgl.Marker().setLngLat([m.lng, m.lat]).setPopup(popup).addTo(map as unknown)
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
  }, [allPoints, highlightCenter, highlightRadius, highlightedPoints, isClient, mapboxReady, mapboxToken, provider, validDestinations, extraPoints, extraMarkers, fixedBounds])

  if (!isClient) return null

  if (validDestinations.length === 0 && !fixedBounds) {
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
    const pointsForFit =
      fixedBounds
        ? [
            [fixedBounds.south, fixedBounds.west] as [number, number],
            [fixedBounds.north, fixedBounds.east] as [number, number],
          ]
        : [...focusPoints, ...extraPoints]
    const centerPoint =
      fixedBounds
        ? ([(fixedBounds.south + fixedBounds.north) / 2, (fixedBounds.west + fixedBounds.east) / 2] as [number, number])
        : (focusPoints[0] || allPoints[0] || extraPoints[0])

    return (
      <MapContainer
        center={centerPoint}
        zoom={5}
        scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
        doubleClickZoom={true}
        {...(fixedBounds
          ? {
              maxBounds: [
                [fixedBounds.south, fixedBounds.west],
                [fixedBounds.north, fixedBounds.east],
              ] as unknown as L.LatLngBoundsExpression,
              maxBoundsViscosity: lockToBounds ? 1.0 : 0.2,
                minZoom: 4,
              maxZoom: 14,
            }
          : {})}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        <CloseTooltipOnMapClick onClose={() => setActiveId(null)} />
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
            <Tooltip direction="bottom" offset={[0, 18]} opacity={1} interactive>
              <div className="p-1">
                <p className="font-bold text-emerald-700 m-0">{p.label}</p>
                <p className="text-[10px] text-gray-500 m-0 capitalize italic">{p.type}</p>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {lockToBounds ? (
          <FitBoundsAndCenterLeaflet points={pointsForFit} aiWaypoints={[]} />
        ) : (
          <FitBoundsAndCenterLeaflet points={[...focusPoints, ...extraPoints]} aiWaypoints={aiWaypoints} />
        )}
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
          <Marker
            key={dest.id}
            position={[dest.latitude!, dest.longitude!]}
            icon={leafletIcon}
            eventHandlers={{
              click: () => setActiveId(dest.id),
            }}
          >
            {activeId === dest.id ? (
              <Tooltip direction="bottom" offset={[0, 20]} opacity={1} interactive>
                <div className="p-1 w-[240px]">
                  <div className="w-full h-28 rounded-xl overflow-hidden border border-white/50 mb-3 bg-muted/30 relative">
                    <Image
                      src={
                        typeof dest.imageData === 'string' && dest.imageData.trim().length > 0 && dest.imageData !== '/images/saigon.jpg'
                          ? dest.imageData
                          : "/images/travel_detsinations.jpg"
                      }
                      alt={dest.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-black text-primary m-0 leading-snug">{dest.name}</h3>
                  <p className="text-xs text-muted-foreground m-0 mt-1">
                    {dest.city}, {dest.country}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-primary/5 border border-primary/10 px-2 py-2">
                      <div className="text-[9px] font-black uppercase tracking-widest text-primary/60">Giá</div>
                      <div className="text-[11px] font-black text-primary mt-0.5">{Number(dest.amount).toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/10 px-2 py-2">
                      <div className="text-[9px] font-black uppercase tracking-widest text-primary/60">Thời lượng</div>
                      <div className="text-[11px] font-black text-primary mt-0.5">{dest.daysNights} {dest.tourType}</div>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/10 px-2 py-2">
                      <div className="text-[9px] font-black uppercase tracking-widest text-primary/60">Loại</div>
                      <div className="text-[11px] font-black text-primary mt-0.5">
                        {(Array.isArray(dest.tags) && dest.tags[0]) ? String(dest.tags[0]) : "Eco"}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/destinations/${dest.country.toLowerCase()}/${dest.id}`}
                    className="mt-3 text-xs bg-secondary text-primary px-3 py-2 rounded-xl hover:bg-secondary/90 transition-colors inline-flex items-center justify-center w-full font-black uppercase tracking-widest no-underline"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </Tooltip>
            ) : null}
          </Marker>
        ))}

        {(extraMarkers ?? []).map((m, idx) => (
          <Marker
            key={`extra-${idx}-${m.lat}-${m.lng}`}
            position={[m.lat, m.lng]}
            icon={L.divIcon({
              className: 'sovereignty-marker',
              html: `<div class="w-9 h-9 rounded-full bg-white border-2 border-yellow-400 shadow-lg flex items-center justify-center">
                      <span class="text-[12px]">🏝️</span>
                     </div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })}
          >
            <Tooltip direction="bottom" offset={[0, 16]} opacity={1} interactive>
              <div className="p-1">
                <p className="font-bold text-primary m-0">{m.label}</p>
                <p className="text-[10px] text-muted-foreground m-0 italic">Việt Nam</p>
              </div>
            </Tooltip>
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

function CloseTooltipOnMapClick({ onClose }: { onClose: () => void }) {
  useMapEvents({
    click: () => onClose(),
  })
  return null
}

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
