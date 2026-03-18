import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageSuggestionForm } from '@/app/(admin-tool)/admin/(protected)/_components/ImageSuggestionForm'

function fmtSrc(src: string | null | undefined) {
  const v = typeof src === 'string' ? src.trim() : ''
  return v.length > 0 ? v : '/images/travel_detsinations.jpg'
}

export default async function ImagesProposePage() {
  const [destinations, packages, blogs, posts] = await Promise.all([
    prisma.destination.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, country: true, city: true, imageData: true },
      take: 40,
    }),
    prisma.package.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, location: true, imageData: true },
      take: 40,
    }),
    prisma.blog.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, authorName: true, imageData: true },
      take: 40,
    }),
    prisma.communityPost.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, authorName: true, location: true, imageData: true },
      take: 40,
    }),
  ])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold ml-12 lg:ml-0 tracking-tight">Images</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Propose Image Changes</CardTitle>
          <CardDescription>Create suggestions first, then approve/apply them in the review page.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <Section
          title="Destinations"
          description="Destination.imageData"
          apiPath="/api/image-suggestions"
          items={destinations.map((d) => ({
            id: d.id,
            title: d.name,
            meta: `${d.city}, ${d.country}`,
            image: d.imageData,
            entityType: 'DESTINATION' as const,
          }))}
        />
        <Section
          title="Packages"
          description="Package.imageData"
          apiPath="/api/image-suggestions"
          items={packages.map((p) => ({
            id: p.id,
            title: p.name,
            meta: p.location,
            image: p.imageData,
            entityType: 'PACKAGE' as const,
          }))}
        />
        <Section
          title="Blogs"
          description="Blog.imageData"
          apiPath="/api/image-suggestions"
          items={blogs.map((b) => ({
            id: b.id,
            title: b.title,
            meta: b.authorName,
            image: b.imageData,
            entityType: 'BLOG' as const,
          }))}
        />
        <Section
          title="Community Posts"
          description="CommunityPost.imageData"
          apiPath="/api/image-suggestions"
          items={posts.map((p) => ({
            id: p.id,
            title: p.title || '(No title)',
            meta: [p.authorName, p.location].filter(Boolean).join(' · '),
            image: p.imageData,
            entityType: 'COMMUNITY_POST' as const,
          }))}
        />
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  apiPath,
  items,
}: {
  title: string
  description: string
  apiPath: string
  items: Array<{ id: string; title: string; meta: string; image: string | null; entityType: 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST' }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No data.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="grid gap-4 rounded-3xl border bg-card p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="relative h-[140px] w-full overflow-hidden rounded-2xl border bg-muted/20">
                <Image src={fmtSrc(it.image)} alt={it.title} fill className="object-cover" sizes="220px" />
              </div>
              <div className="min-w-0 space-y-3">
                <div>
                  <div className="text-sm font-semibold line-clamp-1">{it.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{it.meta}</div>
                  <div className="mt-2 break-all text-[11px] text-muted-foreground">{it.image || '(empty)'}</div>
                </div>
                <ImageSuggestionForm entityType={it.entityType} entityId={it.id} oldValue={it.image} apiPath={apiPath} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

