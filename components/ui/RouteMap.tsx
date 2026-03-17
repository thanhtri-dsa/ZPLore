'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Polyline as LeafletPolyline, TileLayer, useMap, Marker, Popup, Polygon, Pane } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import RoutingMachine from './RoutingMachine'

type GoogleMaps = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown
    Marker: new (opts: Record<string, unknown>) => { setMap: (map: unknown) => void }
    DirectionsService: new () => { route: (req: Record<string, unknown>, cb: (res: unknown, status: unknown) => void) => void }
    DirectionsRenderer: new (opts: Record<string, unknown>) => { setMap: (map: unknown) => void; setDirections: (res: unknown) => void }
    Polyline: new (opts: Record<string, unknown>) => { setMap: (map: unknown) => void }
    TravelMode: { DRIVING: unknown }
    LatLngBounds: new () => { extend: (pos: unknown) => void }
    LatLng: new (lat: number, lng: number) => unknown
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

interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
}

// Add a Controller to update map view when points change
function MapController({ points }: { points: RoutePoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [points, map])

  return null
}

interface RouteMapProps {
  points: RoutePoint[];
  center?: [number, number];
  zoom?: number;
  showPanel?: boolean;
  ecoPoints?: Array<{ lat: number, lng: number, label: string, type: string }>;
}

const RouteMap: React.FC<RouteMapProps> = ({ points: initialPoints, center, zoom = 10, showPanel = false, ecoPoints: initialEcoPoints }) => {
  const [points, setPoints] = useState<RoutePoint[]>(initialPoints)
  const [ecoPoints, setEcoPoints] = useState<Array<{ lat: number, lng: number, label: string, type: string }>>(initialEcoPoints || [])

  useEffect(() => {
    setPoints(initialPoints)
  }, [initialPoints])

  useEffect(() => {
    if (initialEcoPoints) {
      setEcoPoints(initialEcoPoints)
    }
  }, [initialEcoPoints])

  useEffect(() => {
    const handleAiMapCommand = (e: any) => {
      const { action, points: newPoints, eco_points: newEcoPoints } = e.detail
      if (action === 'draw_route' && Array.isArray(newPoints)) {
        setPoints(newPoints)
      }
      if (Array.isArray(newEcoPoints)) {
        setEcoPoints(newEcoPoints)
      }
    }

    window.addEventListener('ai-map-command', handleAiMapCommand)
    return () => window.removeEventListener('ai-map-command', handleAiMapCommand)
  }, [])

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const providerRaw = process.env.NEXT_PUBLIC_MAP_PROVIDER?.toLowerCase()
  const routeProviderRaw = process.env.NEXT_PUBLIC_ROUTE_PROVIDER?.toLowerCase()
  const providerWanted =
    providerRaw === 'osm'
      ? 'osm'
      : providerRaw === 'google'
        ? 'google'
        : providerRaw === 'mapbox'
          ? 'mapbox'
          : googleKey
            ? 'google' // Default to google if key exists
            : 'osm'
  const provider =
    providerWanted === 'mapbox' && !mapboxToken
      ? 'osm'
      : providerWanted === 'google' && !googleKey
        ? 'osm'
        : providerWanted
  const routeProvider = routeProviderRaw === 'ors' ? 'ors' : 'native'

  const [isClient, setIsClient] = useState(false)
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const [mapboxReady, setMapboxReady] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const focusPoints = useMemo(() => {
    if (!points.length) return []
    return points.map((p) => [p.lat, p.lng] as [number, number])
  }, [points])

  const leafletWaypoints = useMemo(() => points.map((p) => L.latLng(p.lat, p.lng)), [points])

  const fetchOrsLine = async (latLngPoints: Array<[number, number]>) => {
    const coordinates: Array<[number, number]> = latLngPoints.map((p) => [p[1], p[0]])
    const res = await fetch('/api/routing/ors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates, profile: 'driving-car' }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { features?: Array<{ geometry?: { coordinates?: number[][] } }> }
    const coords = json.features?.[0]?.geometry?.coordinates
    return coords && coords.length >= 2 ? coords : null
  }

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
    const el = mapDivRef.current
    if (!el) return
    if (focusPoints.length === 0) return

    let isCancelled = false
    let map: unknown = null
    let directionsRenderer: { setMap: (m: unknown) => void; setDirections: (res: unknown) => void } | null = null
    let polyline: { setMap: (m: unknown) => void } | null = null
    const markers: Array<{ setMap: (m: unknown) => void }> = []

    loadGoogleMaps(googleKey)
      .then(async (google) => {
        if (isCancelled) return

        const initial = (center ?? focusPoints[0]) as [number, number]
        map = new google.maps.Map(el, {
          center: { lat: initial[0], lng: initial[1] } as unknown as Record<string, unknown>,
          zoom,
          mapTypeId: 'roadmap',
          mapTypeControl: true, // Enable map type control for global exploration
          streetViewControl: true,
          fullscreenControl: true,
          clickableIcons: true,
          gestureHandling: 'greedy',
          backgroundColor: '#f8fafc',
          // REMOVED RESTRICTIONS FOR GLOBAL REACH
          minZoom: 2,
          styles: [] // Standard clean Google Maps style
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

        if (focusPoints.length < 2) {
          const marker = new google.maps.Marker({
            map,
            position: { lat: initial[0], lng: initial[1] } as unknown as Record<string, unknown>,
          })
          markers.push(marker)
          return
        }

        if (routeProvider === 'ors') {
          const origin = focusPoints[0]
          const dest = focusPoints[focusPoints.length - 1]
          const startMarker = new google.maps.Marker({
            map,
            position: { lat: origin[0], lng: origin[1] } as unknown as Record<string, unknown>,
          })
          const endMarker = new google.maps.Marker({
            map,
            position: { lat: dest[0], lng: dest[1] } as unknown as Record<string, unknown>,
          })
          markers.push(startMarker, endMarker)

          const line = await fetchOrsLine(focusPoints)
          if (!line || isCancelled) return
          const path = line.map((c) => ({ lat: c[1], lng: c[0] }))
          polyline = new google.maps.Polyline({
            path: path as unknown as Record<string, unknown>,
            strokeColor: '#16a34a',
            strokeOpacity: 0.9,
            strokeWeight: 6,
          })
          polyline.setMap(map)
          return
        }

        directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: showPanel ? false : false,
          preserveViewport: false,
        })

        const service = new google.maps.DirectionsService()
        const origin = focusPoints[0]
        const dest = focusPoints[focusPoints.length - 1]
        const waypointStops =
          focusPoints.length > 2
            ? focusPoints.slice(1, -1).map((p) => ({ location: { lat: p[0], lng: p[1] } as unknown, stopover: true }))
            : []

        service.route(
          {
            origin: { lat: origin[0], lng: origin[1] } as unknown,
            destination: { lat: dest[0], lng: dest[1] } as unknown,
            waypoints: waypointStops as unknown,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (isCancelled) return
            if (status === 'OK' && result && directionsRenderer) {
              directionsRenderer.setDirections(result)
            }
          }
        )
      })
      .catch(() => {})

    return () => {
      isCancelled = true
      try {
        directionsRenderer?.setMap(null)
      } catch {}
      try {
        polyline?.setMap(null)
      } catch {}
      for (const m of markers) {
        try {
          m.setMap(null)
        } catch {}
      }
      map = null
    }
  }, [center, focusPoints, googleKey, googleReady, isClient, provider, routeProvider, showPanel, zoom])

  useEffect(() => {
    if (provider !== 'mapbox') return
    if (!mapboxToken || !mapboxReady || !isClient) return
    const el = mapDivRef.current
    if (!el) return
    if (focusPoints.length === 0) return

    let map: { remove: () => void } | null = null
    const markers: Array<{ remove: () => void }> = []

    loadMapboxGL()
      .then(async (mapboxgl) => {
        mapboxgl.accessToken = mapboxToken

        const initial = (center ?? focusPoints[0]) as [number, number]
        map = new mapboxgl.Map({
          container: el,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [initial[1], initial[0]],
          zoom: Math.max(3, Math.min(12, zoom)),
        }) as unknown as { remove: () => void }

        ;(map as unknown as { on: (e: string, h: () => void) => void }).on('load', async () => {
          const bounds = new mapboxgl.LngLatBounds()
          for (const p of focusPoints) bounds.extend([p[1], p[0]])
          ;(map as unknown as { fitBounds: (b: unknown, o?: unknown) => void }).fitBounds(bounds as unknown, { padding: 60 } as unknown)

          for (const p of focusPoints) {
            const marker = new mapboxgl.Marker().setLngLat([p[1], p[0]]).addTo(map as unknown)
            markers.push(marker as unknown as { remove: () => void })
          }

          if (focusPoints.length < 2) return

          try {
            const line =
              routeProvider === 'ors'
                ? await fetchOrsLine(focusPoints)
                : await (async () => {
                    const coords = focusPoints.map((p) => `${p[1]},${p[0]}`).join(';')
                    const url =
                      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
                      `?geometries=geojson&overview=full&access_token=${encodeURIComponent(mapboxToken)}`
                    const res = await fetch(url)
                    if (!res.ok) return null
                    const json = (await res.json()) as { routes?: Array<{ geometry?: { coordinates?: number[][] } }> }
                    return json.routes?.[0]?.geometry?.coordinates ?? null
                  })()
            if (!line || line.length < 2) return

            const srcId = 'ecoTourRoute'
            const layerId = 'ecoTourRouteLayer'
            const mapAny = map as unknown as Record<string, unknown>
            const getLayer = (mapAny['getLayer'] as unknown) as ((id: string) => unknown) | undefined
            const getSource = (mapAny['getSource'] as unknown) as ((id: string) => unknown) | undefined
            const addSource = (mapAny['addSource'] as unknown) as ((id: string, src: unknown) => void) | undefined
            const addLayer = (mapAny['addLayer'] as unknown) as ((layer: unknown) => void) | undefined

            if (getSource && addSource && !getSource(srcId)) {
              addSource(srcId, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: { type: 'LineString', coordinates: line },
                  properties: {},
                },
              })
            }
            if (getLayer && addLayer && !getLayer(layerId)) {
              addLayer({
                id: layerId,
                type: 'line',
                source: srcId,
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: { 'line-color': '#16a34a', 'line-width': 6, 'line-opacity': 0.85 },
              })
            }
          } catch {}
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
  }, [center, focusPoints, isClient, mapboxReady, mapboxToken, provider, routeProvider, zoom])

  if (!isClient) return null

  if (provider === 'osm') {
    const leafletCenter: [number, number] =
      center ?? (points.length > 0 ? ([points[0].lat, points[0].lng] as [number, number]) : ([10.762622, 106.660172] as [number, number]))

    return (
      <LeafletRoute
        center={leafletCenter}
        zoom={zoom}
        points={points}
        waypoints={leafletWaypoints}
        routeProvider={routeProvider}
        fetchOrsLine={fetchOrsLine}
        showPanel={showPanel}
        ecoPoints={ecoPoints}
      />
    )
  }

  return (
    <div
      ref={mapDivRef}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '1rem',
        overflow: 'hidden',
        background: '#f8fafc',
      }}
    />
  )
}

export default RouteMap

function LeafletRoute({
  center,
  zoom,
  points,
  waypoints,
  routeProvider,
  fetchOrsLine,
  showPanel,
  ecoPoints,
}: {
  center: [number, number]
  zoom: number
  points: RoutePoint[]
  waypoints: L.LatLng[]
  routeProvider: 'ors' | 'native'
  fetchOrsLine: (latLngPoints: Array<[number, number]>) => Promise<number[][] | null>
  showPanel: boolean
  ecoPoints: Array<{ lat: number, lng: number, label: string, type: string }>
}) {
  const [orsPositions, setOrsPositions] = useState<Array<[number, number]> | null>(null)

  const VIETNAM_BOUNDS = useMemo(() => L.latLngBounds(
    L.latLng(8.0, 102.0), // Southwest
    L.latLng(24.0, 110.0)  // Northeast
  ), [])

  const key = useMemo(() => waypoints.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|'), [waypoints])

  const VIETNAM_MASK = useMemo(() => [
    [[-90, -180], [-90, 180], [90, 180], [90, -180]], // World
    [
      [23.4, 105.3], [22.8, 106.5], [21.5, 108.0], [20.5, 106.5], [19.0, 106.0],
      [17.5, 106.6], [16.0, 108.3], [14.5, 109.2], [12.5, 109.5], [11.0, 108.8],
      [10.0, 107.5], [8.5, 104.8], [9.5, 104.0], [10.5, 104.5], [12.5, 107.5],
      [14.5, 107.5], [16.0, 107.0], [18.0, 105.5], [21.5, 102.1], [22.5, 103.0]
    ] // Vietnam hole
  ], [])

  useEffect(() => {
    let cancelled = false
    if (routeProvider !== 'ors' || waypoints.length < 2) {
      setOrsPositions(null)
      return
    }

    const pts = waypoints.map((p) => [p.lat, p.lng] as [number, number])
    fetchOrsLine(pts)
      .then((line) => {
        if (cancelled) return
        if (!line || line.length < 2) {
          setOrsPositions(null)
          return
        }
        setOrsPositions(line.map((c) => [c[1], c[0]] as [number, number]))
      })
      .catch(() => {
        if (!cancelled) setOrsPositions(null)
      })

    return () => {
      cancelled = true
    }
  }, [fetchOrsLine, key, routeProvider, waypoints])

  return (
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', borderRadius: '1rem', background: '#f8fafc' }}
        minZoom={2}
      >
        <MapController points={points} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />

        <Pane name="route-pane" style={{ zIndex: 500 }}>
          {orsPositions ? (
            <LeafletPolyline pathOptions={{ color: '#16a34a', weight: 6, opacity: 0.9 }} positions={orsPositions} />
          ) : (
            waypoints.length >= 2 && <RoutingMachine waypoints={waypoints} showPanel={showPanel} />
          )}
        </Pane>
        
        <Pane name="marker-pane" style={{ zIndex: 700 }}>
          {ecoPoints.map((p, idx) => (
            <Marker 
              key={`eco-${idx}`} 
              position={[p.lat, p.lng]} 
              icon={L.divIcon({
                className: 'eco-poi-marker',
                html: `<div class="relative group">
                        <div class="w-10 h-10 rounded-full ${p.type === 'restaurant' ? 'bg-orange-500 shadow-orange-200' : 'bg-emerald-500 shadow-emerald-200'} border-2 border-white shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                          <span class="text-lg">${p.type === 'restaurant' ? '🍱' : (p.type === 'charging' ? '⚡' : '🌿')}</span>
                        </div>
                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${p.type === 'restaurant' ? 'border-t-orange-500' : 'border-t-emerald-500'}"></div>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
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
        </Pane>
      </MapContainer>
    )
}
