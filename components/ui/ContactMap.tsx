'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import leafletMarkerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import leafletMarkerIcon from 'leaflet/dist/images/marker-icon.png'
import leafletMarkerShadow from 'leaflet/dist/images/marker-shadow.png'

type GoogleMaps = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown
    Marker: new (opts: Record<string, unknown>) => { setMap: (map: unknown) => void }
    InfoWindow: new () => { setContent: (content: HTMLElement) => void; open: (opts: Record<string, unknown>) => void; close: () => void }
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
  setPopup?: (popup: unknown) => MapboxMarker
  addTo: (map: unknown) => MapboxMarker
  remove: () => void
}

type MapboxGL = {
  accessToken: string
  Map: new (opts: Record<string, unknown>) => { on: (event: string, handler: () => void) => void; remove: () => void }
  Marker: new (opts?: Record<string, unknown>) => MapboxMarker
  Popup: new (opts?: Record<string, unknown>) => { setText: (text: string) => unknown }
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

interface MapProps {
  lat: number;
  lng: number;
  popupText?: string;
}

const ContactMap: React.FC<MapProps> = ({ lat, lng, popupText }) => {
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
  const leafletIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl: leafletMarkerIcon.src ?? (leafletMarkerIcon as unknown as string),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: leafletMarkerShadow.src ?? (leafletMarkerShadow as unknown as string),
        shadowSize: [41, 41],
      }),
    []
  )

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
    setIsClient(true)
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
    const el = mapDivRef.current
    if (!el) return

    let map: unknown = null
    let marker: { setMap: (m: unknown) => void } | null = null
    let infoWindow: { setContent: (content: HTMLElement) => void; open: (opts: Record<string, unknown>) => void; close: () => void } | null = null

    loadGoogleMaps(googleKey)
      .then((google) => {
        map = new google.maps.Map(el, {
          center: { lat, lng } as unknown as Record<string, unknown>,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          backgroundColor: '#f8fafc',
        })

        marker = new google.maps.Marker({
          map,
          position: { lat, lng } as unknown as Record<string, unknown>,
        })

        if (popupText) {
          infoWindow = new google.maps.InfoWindow()
          const wrap = document.createElement('div')
          wrap.textContent = popupText
          infoWindow.setContent(wrap)
          infoWindow.open({ map, anchor: marker })
        }
      })
      .catch(() => {})

    return () => {
      try {
        infoWindow?.close()
      } catch {}
      try {
        marker?.setMap(null)
      } catch {}
      map = null
    }
  }, [googleKey, googleReady, isClient, lat, lng, popupText, provider])

  useEffect(() => {
    if (provider !== 'mapbox') return
    if (!mapboxToken || !mapboxReady || !isClient) return
    const el = mapDivRef.current
    if (!el) return

    let map: { remove: () => void } | null = null
    let marker: { remove: () => void } | null = null

    loadMapboxGL()
      .then((mapboxgl) => {
        mapboxgl.accessToken = mapboxToken
        map = new mapboxgl.Map({
          container: el,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 13.5,
        }) as unknown as { remove: () => void }

        ;(map as unknown as { on: (e: string, h: () => void) => void }).on('load', () => {
          const mk = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map as unknown)
          marker = mk as unknown as { remove: () => void }
          if (popupText) {
            const popup = new mapboxgl.Popup({ offset: 16 }).setText(popupText)
            ;(mk as unknown as { setPopup: (p: unknown) => void }).setPopup?.(popup as unknown)
          }
        })
      })
      .catch(() => {})

    return () => {
      try {
        marker?.remove()
      } catch {}
      try {
        map?.remove()
      } catch {}
      map = null
    }
  }, [isClient, lat, lng, mapboxReady, mapboxToken, popupText, provider])

  if (!isClient) return null

  if (provider === 'osm') {
    return (
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <Marker position={[lat, lng]} icon={leafletIcon}>
          {popupText ? <Popup>{popupText}</Popup> : null}
        </Marker>
      </MapContainer>
    )
  }

  return (
    <div
      ref={mapDivRef}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', overflow: 'hidden', background: '#f8fafc' }}
    />
  )
}

export default ContactMap
