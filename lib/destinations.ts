import { PrismaClient } from '@prisma/client'
import { Destination } from '@/types/destinations'
import { Destination as PrismaDestination } from '@prisma/client'

const prisma = new PrismaClient()
const hasDb = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.trim() !== ''

export async function getAllDestinations(): Promise<Destination[]> {
  try {
    if (!hasDb) return []
    const destinations = await prisma.destination.findMany()
    return destinations.map(mapDestination)
  } catch (error) {
    console.error('Error fetching all destinations:', error)
    return []
  }
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  try {
    if (!hasDb) return null
    const destination = await prisma.destination.findUnique({
      where: { id },
    })
    return destination ? mapDestination(destination) : null
  } catch (error) {
    console.error('Error fetching destination by ID:', error)
    return null
  }
}

export async function getDestinationsByCountry(country: string): Promise<Destination[]> {
  try {
    if (!hasDb) return []
    let destinations = await prisma.destination.findMany({
      where: {
        country
      }
    })
    if (destinations.length === 0) {
      const all = await prisma.destination.findMany()
      destinations = all.filter((d) => d.country.toLowerCase() === country.toLowerCase())
    }
    return destinations.map(mapDestination)
  } catch (error) {
    console.error('Error fetching destinations by country:', error)
    return []
  }
}

function mapDestination(destination: PrismaDestination): Destination {
  return {
    id: destination.id,
    name: destination.name,
    country: destination.country,
    city: destination.city,
    amount: destination.amount,
    tags: destination.tags ? destination.tags.split(',') : [],
    imageData: destination.imageData || '',
    description: destination.description,
    daysNights: destination.daysNights,
    tourType: destination.tourType as 'DAYS' | 'NIGHTS',
    latitude: destination.latitude || undefined,
    longitude: destination.longitude || undefined,
  }
}
