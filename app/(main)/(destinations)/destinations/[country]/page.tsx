import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getDestinationsByCountry } from '@/lib/destinations'
import DestinationsPage from '@/components/destinations/destinations-page'
import { DestinationCardSkeleton } from '@/components/destinations/destinations-card-skeleton'

export async function generateMetadata({ params }: { params: { country: string } }) {
  return {
    title: `${params.country} Destinations | Forestline Tours`,
    description: `Explore amazing travel destinations in ${params.country} with Forestline Tours.`,
  }
}

export default async function CountryDestinationsPage({ params }: { params: { country: string } }) {
  const destinations = await getDestinationsByCountry(params.country)

  if (!destinations || destinations.length === 0) {
    notFound()
  }

  return (
    <Suspense fallback={<DestinationsLoadingSkeleton />}>
      <DestinationsPage initialDestinations={destinations} country={params.country} />
    </Suspense>
  )
}

function DestinationsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <DestinationCardSkeleton key={index} />
      ))}
    </div>
  )
}

