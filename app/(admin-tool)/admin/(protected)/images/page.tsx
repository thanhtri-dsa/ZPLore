import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageSuggestionForm } from '../_components/ImageSuggestionForm'

function fmtSrc(src: string | null | undefined) {
  const v = typeof src === 'string' ? src.trim() : ''
  return v.length > 0 ? v : '/images/travel_detsinations.jpg'
}

export default async function AdminImagesPage() {
  const [destinations, packages, blogs, posts] = await Promise.all([
    prisma.destination.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, country: true, city: true, imageData: true },
      take: 60,
    }),
    prisma.package.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, location: true, imageData: true },
      take: 60,
    }),
    prisma.blog.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, authorName: true, imageData: true },
      take: 60,
    }),
    prisma.communityPost.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, authorName: true, imageData: true, location: true },
      take: 60,
    }),
  ])

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-white">Hình ảnh hiện tại</CardTitle>
          <CardDescription className="text-white/70">
            Duyệt dữ liệu trong DB và tạo đề xuất thay đổi ảnh (không chỉnh trực tiếp).
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <Section title="Destinations" description="Ảnh Destination.imageData" items={destinations.map((d) => ({
          id: d.id,
          title: d.name,
          meta: `${d.city}, ${d.country}`,
          image: d.imageData,
          entityType: 'DESTINATION' as const,
        }))} />

        <Section title="Packages" description="Ảnh Package.imageData" items={packages.map((p) => ({
          id: p.id,
          title: p.name,
          meta: p.location,
          image: p.imageData,
          entityType: 'PACKAGE' as const,
        }))} />

        <Section title="Blogs" description="Ảnh Blog.imageData" items={blogs.map((b) => ({
          id: b.id,
          title: b.title,
          meta: b.authorName,
          image: b.imageData,
          entityType: 'BLOG' as const,
        }))} />

        <Section title="Community Posts" description="Ảnh CommunityPost.imageData" items={posts.map((p) => ({
          id: p.id,
          title: p.title || '(No title)',
          meta: [p.authorName, p.location].filter(Boolean).join(' · '),
          image: p.imageData,
          entityType: 'COMMUNITY_POST' as const,
        }))} />
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: Array<{ id: string; title: string; meta: string; image: string | null; entityType: 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST' }>
}) {
  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white/70">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-sm text-white/70">Không có dữ liệu.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="relative h-[140px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <Image src={fmtSrc(it.image)} alt={it.title} fill className="object-cover" sizes="220px" />
              </div>
              <div className="min-w-0 space-y-3">
                <div>
                  <div className="text-sm font-black text-white line-clamp-1">{it.title}</div>
                  <div className="text-xs text-white/70 line-clamp-1">{it.meta}</div>
                  <div className="mt-2 break-all text-[11px] text-white/60">{it.image || '(empty)'}</div>
                </div>
                <ImageSuggestionForm entityType={it.entityType} entityId={it.id} oldValue={it.image} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

