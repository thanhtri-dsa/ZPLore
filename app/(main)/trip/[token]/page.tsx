import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import RouteMapLoader from '@/components/ui/RouteMapLoader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type RoutePoint = { lat: number; lng: number; label?: string }
type EcoPoint = { lat: number; lng: number; label: string; type: string }
type Insight = { title?: string; content?: string }

function safeJsonParse<T>(raw: string | null | undefined): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function formatNumber(v: number | null | undefined) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '-'
  return v.toLocaleString('vi-VN')
}

function defaultItemsUsed(transportMode: string) {
  const mode = String(transportMode || '').toLowerCase()
  const base = [
    'Bình nước tái sử dụng',
    'Túi vải / túi tote',
    'Áo mưa / áo khoác mỏng',
    'Kem chống nắng thân thiện với môi trường',
    'Hộp đựng / bộ muỗng nĩa cá nhân',
  ]

  if (mode.includes('xe') || mode.includes('bus')) return [...base, 'Sạc dự phòng', 'Khăn lau nhỏ']
  if (mode.includes('đi bộ') || mode.includes('walking') || mode.includes('foot')) return [...base, 'Giày/dep êm', 'Nón/ mũ', 'Băng cá nhân']
  return base
}

export default async function TripPage({ params }: { params: { token: string } }) {
  const token = params.token
  if (!token) notFound()

  const booking = await prisma.aIPlannerBooking.findFirst({
    where: { publicToken: token },
    select: {
      firstname: true,
      lastname: true,
      email: true,
      status: true,
      bookingDate: true,
      numberOfGuests: true,
      startLocation: true,
      endLocation: true,
      transportMode: true,
      distanceKm: true,
      co2Kg: true,
      routePoints: true,
      ecoPoints: true,
      expertInsights: true,
      itemsUsed: true,
      createdAt: true,
    },
  })

  if (!booking) notFound()

  const points = safeJsonParse<RoutePoint[]>(booking.routePoints) ?? []
  const ecoPoints = safeJsonParse<EcoPoint[]>(booking.ecoPoints) ?? []
  const insights = safeJsonParse<Insight[]>(booking.expertInsights) ?? []
  const itemsUsed = safeJsonParse<string[]>(booking.itemsUsed) ?? defaultItemsUsed(booking.transportMode)

  const fullName = `${booking.firstname} ${booking.lastname}`.trim()

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-[calc(env(safe-area-inset-bottom)+90px)] pt-[calc(env(safe-area-inset-top)+96px)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.22em]">
            Hành trình của bạn
          </div>
          <h1 className="vn-title text-3xl md:text-5xl font-black">
            {booking.startLocation} → {booking.endLocation}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{fullName}</span>
            <span>•</span>
            <span>{booking.email}</span>
            <span>•</span>
            <Badge variant={booking.status === 'PENDING' ? 'secondary' : 'default'}>{booking.status}</Badge>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
          <Card className="vn-card overflow-hidden">
            <CardHeader>
              <CardTitle>Bản đồ hành trình</CardTitle>
              <CardDescription>Đường đi, điểm eco và gợi ý cho chuyến đi.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] sm:h-[440px] w-full">
                <RouteMapLoader
                  location={booking.endLocation}
                  name={`Hành trình ${booking.startLocation} - ${booking.endLocation}`}
                  points={points.length >= 2 ? points : undefined}
                  ecoPoints={ecoPoints}
                  showPanel={false}
                  disableGeolocation={true}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="vn-card">
              <CardHeader>
                <CardTitle>Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Ngày</div>
                  <div className="mt-1 font-black text-primary">
                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : '-'}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Số khách</div>
                  <div className="mt-1 font-black text-primary">{booking.numberOfGuests}</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Phương tiện</div>
                  <div className="mt-1 font-black text-primary">{booking.transportMode}</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Khoảng cách (km)</div>
                  <div className="mt-1 font-black text-primary">{formatNumber(booking.distanceKm)}</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/70 px-4 py-3 col-span-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">Phát thải CO₂ (kg)</div>
                  <div className="mt-1 text-3xl font-black text-secondary">{formatNumber(booking.co2Kg)}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="vn-card">
              <CardHeader>
                <CardTitle>Vật dụng cho tour</CardTitle>
                <CardDescription>Chuẩn bị để giảm rác thải và đi an toàn.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm">
                  {itemsUsed.map((it, idx) => (
                    <li key={`${idx}-${it}`} className="rounded-2xl border border-border bg-white/70 px-4 py-3 font-semibold text-primary">
                      {it}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="vn-card">
            <CardHeader>
              <CardTitle>Điểm eco</CardTitle>
              <CardDescription>Ăn uống xanh, trạm sạc, hoạt động thân thiện môi trường.</CardDescription>
            </CardHeader>
            <CardContent>
              {ecoPoints.length === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có dữ liệu.</div>
              ) : (
                <div className="grid gap-3">
                  {ecoPoints.map((p, idx) => (
                    <div key={`${idx}-${p.lat}-${p.lng}`} className="rounded-2xl border border-border bg-white/70 px-4 py-3">
                      <div className="font-black text-primary">{p.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.type}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="vn-card">
            <CardHeader>
              <CardTitle>Gợi ý từ hệ thống</CardTitle>
              <CardDescription>Những lưu ý để chuyến đi “xanh” hơn.</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có dữ liệu.</div>
              ) : (
                <div className="grid gap-3">
                  {insights.map((i, idx) => (
                    <div key={idx} className="rounded-2xl border border-border bg-white/70 px-4 py-3">
                      <div className="font-black text-primary">{i.title || `Gợi ý ${idx + 1}`}</div>
                      <div className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{i.content || ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-xs text-muted-foreground">
          Cập nhật lúc {new Date(booking.createdAt).toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  )
}

