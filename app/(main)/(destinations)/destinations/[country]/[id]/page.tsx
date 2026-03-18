import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getDestinationById } from '@/lib/destinations'
import DestinationDetail from '@/components/destinations/destination-detail'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const destination = await getDestinationById(params.id)
  if (!destination) return { title: 'Không tìm thấy điểm đến' }

  return {
    title: `${destination.name} | Làng Nghề Travel`,
    description: `Khám phá ${destination.name} tại ${destination.country} cùng Làng Nghề Travel.`,
  }
}

export default async function DestinationDetailPage({ params }: { params: { id: string } }) {
  const destination = await getDestinationById(params.id)

  if (!destination) {
    notFound()
  }

  return (
    <Suspense fallback={<DestinationDetailSkeleton />}>
      <DestinationDetail destination={destination} />
    </Suspense>
  )
}

function DestinationDetailSkeleton() {
  // Implement a loading skeleton for the destination detail page
  return <div>Loading...</div>
}

