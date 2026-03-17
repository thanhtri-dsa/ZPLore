export interface Destination {
  id: string
  name: string
  country: string
  city: string
  amount: number
  tags: string[]
  imageData: string
  description: string
  daysNights: number
  tourType: 'DAYS' | 'NIGHTS'
  latitude?: number
  longitude?: number
}

