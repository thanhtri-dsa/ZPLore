import { Skeleton } from "@/components/ui/skeleton";

export function BlogListSkeleton() {
  return (
    <div className="overflow-hidden border-green-100 rounded-lg shadow">
      <div className="p-0">
        <div className="flex flex-wrap lg:flex-nowrap items-center">
          <div className="w-full lg:w-auto p-4">
            <Skeleton className="w-44 h-32 rounded-lg" />
          </div>
          <div className="w-full lg:w-9/12 p-4">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-4 mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="w-full lg:w-auto p-4 lg:ml-auto">
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <article className="min-h-screen bg-green-50">
      <div className="relative h-96 overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </article>
  );
}