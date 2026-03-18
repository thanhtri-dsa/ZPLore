export interface Package {
    type: string
    id: string
    name: string
    location: string
    imageData: string | null
    duration: string
    groupSize: string
    price: number
    description: string
    included: string[]
    itinerary?: PackageItineraryLeg[]
    authorId: string
    authorName: string
    createdAt: Date
    updatedAt: Date
  }

export type PackageItineraryLeg = {
  id: string
  order: number
  mode: string
  day?: number
  stopTitle?: string | null
  stopDesc?: string | null
  stopImage?: string | null
  mapsQuery?: string | null
  fromName: string
  toName: string
  distanceKm: number | null
  fromLat: number | null
  fromLng: number | null
  toLat: number | null
  toLng: number | null
  note: string | null
}

  // types/package.ts
export type PackageWithIncludes = {
  id: string
  name: string
  location: string
  imageData: string | null
  duration: string
  groupSize: string
  price: number
  description: string
  included: Array<{ id: string; item: string }>
  itinerary?: PackageItineraryLeg[]
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
}

export type PackageDetailProps = PackageWithIncludes & {
  imageUrl: string
}
