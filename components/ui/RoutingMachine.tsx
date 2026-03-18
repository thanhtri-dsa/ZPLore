'use client'

import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import { useEffect, useRef } from "react";

// We have to use a separate component for this to be able to use the useMap hook

interface RoutingMachineProps {
  waypoints: L.LatLng[];
  showPanel?: boolean;
}

type RoutingControl = L.Control & {
  getContainer: () => HTMLElement | undefined
  route: () => void
  setWaypoints: (waypoints: L.LatLng[]) => void
  on: (event: string, handler: () => void) => void
}

type LeafletWithPlugins = typeof L & {
  Routing: {
    control: (options: unknown) => RoutingControl
    osrmv1: new (options: { serviceUrl: string }) => unknown
  }
  Control: {
    Geocoder?: {
      nominatim: (options: unknown) => unknown
    }
  }
}

const RoutingMachine = ({ waypoints, showPanel = false }: RoutingMachineProps) => {
  const map = useMap();
  const routingControlRef = useRef<RoutingControl | null>(null);

  useEffect(() => {
    if (!map) return;

    if (waypoints.length < 2) {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current)
        } catch {}
        routingControlRef.current = null
      }
      return
    }

    const Leaflet = L as unknown as LeafletWithPlugins

    if (!routingControlRef.current) {
      const geocoder = Leaflet.Control.Geocoder?.nominatim({
        params: {
          'accept-language': 'vi',
          countrycodes: 'vn,ke',
          addressdetails: 1,
        },
      })

      const routingControl = Leaflet.Routing.control({
        waypoints,
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#10b981', opacity: 0.8, weight: 8 }],
        },
        ...(geocoder ? { geocoder } : {}),
        createMarker: function (i: number, waypoint: { latLng: L.LatLng }, n: number) {
          const isFirst = i === 0
          const isLast = i === n - 1

          const markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${isFirst ? 'bg-emerald-500' : (isLast ? 'bg-rose-500' : 'bg-amber-500')}">
                    <div class="w-2 h-2 rounded-full bg-white animate-ping"></div>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          const marker = L.marker(waypoint.latLng, {
            icon: markerIcon,
            draggable: true,
          })

          marker.bindPopup(`<div className="p-2 font-sans">
            <p className="font-bold text-gray-900 m-0">${isFirst ? '📍 Điểm đi' : (isLast ? '🏁 Hành trình ước mơ' : '⚓ Điểm dừng')}</p>
            <p className="text-xs text-gray-500 m-0 mt-1">Kéo để đổi vị trí</p>
          </div>`)
          return marker
        },
        show: showPanel,
        addWaypoints: true,
        fitSelectedRoutes: true,
        collapsible: false,
        router: new Leaflet.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
        }),
      }).addTo(map)

      routingControl.on('waypointgeocoded', () => {
        routingControl.route()
      })

      routingControlRef.current = routingControl
    } else {
      try {
        routingControlRef.current.setWaypoints(waypoints)
        routingControlRef.current.route()
      } catch {}
    }

    const container = routingControlRef.current?.getContainer()
    if (container) {
      if (!showPanel) {
        container.style.display = 'none'
      } else {
        container.style.display = 'block'
        container.style.margin = '10px'
      }
    }

    return () => {};
  }, [map, showPanel, waypoints]);

  return null;
};

export default RoutingMachine;
