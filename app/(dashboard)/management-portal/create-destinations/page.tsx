import { CreateDestinationForm } from '@/components/destinations/create'

export default function CreatePackagePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Destination</h1>
      < CreateDestinationForm />
    </div>
  )
}