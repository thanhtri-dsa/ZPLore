export type TransportMode =
  | 'WALK'
  | 'BIKE'
  | 'CAR'
  | 'MOTORBIKE'
  | 'BUS'
  | 'TRAIN'
  | 'PLANE'
  | 'BOAT'

export const transportModeLabels: Record<TransportMode, string> = {
  WALK: 'Đi bộ',
  BIKE: 'Xe đạp',
  CAR: 'Ô tô',
  MOTORBIKE: 'Xe máy',
  BUS: 'Xe bus',
  TRAIN: 'Tàu hỏa',
  PLANE: 'Máy bay',
  BOAT: 'Tàu/Thuyền',
}

export const transportModeFactorsGCo2ePerPkm: Record<TransportMode, number> = {
  WALK: 0,
  BIKE: 0,
  CAR: 171,
  MOTORBIKE: 103,
  BUS: 104,
  TRAIN: 41,
  PLANE: 255,
  BOAT: 115,
}

export function normalizeMode(mode: unknown): TransportMode {
  const m = String(mode || '').toUpperCase().trim()
  if (m === 'WALK') return 'WALK'
  if (m === 'BIKE') return 'BIKE'
  if (m === 'CAR') return 'CAR'
  if (m === 'MOTORBIKE') return 'MOTORBIKE'
  if (m === 'BUS') return 'BUS'
  if (m === 'TRAIN') return 'TRAIN'
  if (m === 'PLANE') return 'PLANE'
  if (m === 'BOAT') return 'BOAT'
  return 'CAR'
}

export function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

export function computeDistanceKm(input: {
  distanceKm?: number | null
  fromLat?: number | null
  fromLng?: number | null
  toLat?: number | null
  toLng?: number | null
}): number | null {
  if (typeof input.distanceKm === 'number' && Number.isFinite(input.distanceKm) && input.distanceKm > 0) {
    return input.distanceKm
  }
  if (
    typeof input.fromLat === 'number' &&
    typeof input.fromLng === 'number' &&
    typeof input.toLat === 'number' &&
    typeof input.toLng === 'number' &&
    Number.isFinite(input.fromLat) &&
    Number.isFinite(input.fromLng) &&
    Number.isFinite(input.toLat) &&
    Number.isFinite(input.toLng)
  ) {
    return haversineDistanceKm({ lat: input.fromLat, lng: input.fromLng }, { lat: input.toLat, lng: input.toLng })
  }
  return null
}

export function computeLegKgCo2e(input: {
  mode: TransportMode
  distanceKm: number
  travelers?: number
}): number {
  const travelers = typeof input.travelers === 'number' && Number.isFinite(input.travelers) && input.travelers > 0 ? input.travelers : 1
  const factor = transportModeFactorsGCo2ePerPkm[input.mode]
  return (input.distanceKm * factor * travelers) / 1000
}

