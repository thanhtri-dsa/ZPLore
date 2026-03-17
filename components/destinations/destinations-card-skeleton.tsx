import { Skeleton } from "@/components/ui/skeleton"

export function DestinationCardSkeleton() {
  return (
    <div className="bg-gray-50 shadow-md rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>
    </div>
  )
}

