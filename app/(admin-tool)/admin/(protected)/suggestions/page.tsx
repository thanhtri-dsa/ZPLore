import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SuggestionActions } from '../_components/SuggestionActions'

type EntityType = 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST'
type SuggestionRow = {
  id: string
  entityType: EntityType
  entityId: string
  field: string
  oldValue: string | null
  newValue: string
  note: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  appliedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function fmtSrc(src: string | null | undefined) {
  const v = typeof src === 'string' ? src.trim() : ''
  return v.length > 0 ? v : '/images/travel_detsinations.jpg'
}

function labelType(t: EntityType) {
  if (t === 'DESTINATION') return 'Destination'
  if (t === 'PACKAGE') return 'Package'
  if (t === 'BLOG') return 'Blog'
  return 'Community Post'
}

export default async function AdminSuggestionsPage() {
  const suggestions = await prisma.$queryRaw<SuggestionRow[]>`
    SELECT
      id,
      "entityType" AS "entityType",
      "entityId" AS "entityId",
      field,
      "oldValue" AS "oldValue",
      "newValue" AS "newValue",
      note,
      status,
      "appliedAt" AS "appliedAt",
      "createdAt" AS "createdAt",
      "updatedAt" AS "updatedAt"
    FROM "ImageEditSuggestion"
    ORDER BY "createdAt" DESC
    LIMIT 100
  `

  const byType: Record<EntityType, string[]> = {
    DESTINATION: [],
    PACKAGE: [],
    BLOG: [],
    COMMUNITY_POST: [],
  }
  for (const s of suggestions) {
    byType[s.entityType as EntityType].push(s.entityId)
  }

  const [destinations, packages, blogs, posts] = await Promise.all([
    prisma.destination.findMany({
      where: { id: { in: byType.DESTINATION } },
      select: { id: true, name: true, country: true, city: true, imageData: true },
    }),
    prisma.package.findMany({
      where: { id: { in: byType.PACKAGE } },
      select: { id: true, name: true, location: true, imageData: true },
    }),
    prisma.blog.findMany({
      where: { id: { in: byType.BLOG } },
      select: { id: true, title: true, authorName: true, imageData: true },
    }),
    prisma.communityPost.findMany({
      where: { id: { in: byType.COMMUNITY_POST } },
      select: { id: true, title: true, authorName: true, location: true, imageData: true },
    }),
  ])

  const lookup = new Map<string, { title: string; meta: string; currentImage: string | null }>()
  for (const d of destinations) lookup.set(`DESTINATION:${d.id}`, { title: d.name, meta: `${d.city}, ${d.country}`, currentImage: d.imageData })
  for (const p of packages) lookup.set(`PACKAGE:${p.id}`, { title: p.name, meta: p.location, currentImage: p.imageData })
  for (const b of blogs) lookup.set(`BLOG:${b.id}`, { title: b.title, meta: b.authorName, currentImage: b.imageData })
  for (const p of posts) lookup.set(`COMMUNITY_POST:${p.id}`, { title: p.title || '(No title)', meta: [p.authorName, p.location].filter(Boolean).join(' · '), currentImage: p.imageData })

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-white">Đề xuất chỉnh sửa hình ảnh</CardTitle>
          <CardDescription className="text-white/70">Duyệt, áp dụng hoặc từ chối các đề xuất.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardContent className="grid gap-4 p-6">
          {suggestions.length === 0 ? (
            <div className="text-sm text-white/70">Chưa có đề xuất nào.</div>
          ) : (
            suggestions.map((s) => {
              const key = `${s.entityType}:${s.entityId}`
              const entity = lookup.get(key)
              const currentImage = entity?.currentImage ?? s.oldValue ?? null
              return (
                <div key={s.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                        {labelType(s.entityType as EntityType)} · {s.status}
                      </div>
                      <div className="mt-1 text-lg font-black text-white line-clamp-1">{entity?.title || s.entityId}</div>
                      <div className="text-xs text-white/70 line-clamp-1">{entity?.meta || ''}</div>
                      {s.note && <div className="mt-2 text-xs text-white/60">{s.note}</div>}
                    </div>
                    {s.status === 'PENDING' ? <SuggestionActions id={s.id} /> : null}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Hiện tại</div>
                      <div className="mt-2 relative h-[180px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                        <Image src={fmtSrc(currentImage)} alt="Current" fill className="object-cover" sizes="420px" />
                      </div>
                      <div className="mt-2 break-all text-[11px] text-white/60">{currentImage || '(empty)'}</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">Đề xuất</div>
                      <div className="mt-2 relative h-[180px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                        <Image src={fmtSrc(s.newValue)} alt="Proposed" fill className="object-cover" sizes="420px" />
                      </div>
                      <div className="mt-2 break-all text-[11px] text-white/60">{s.newValue}</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
