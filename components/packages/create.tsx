"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransportMode, normalizeMode, transportModeLabels } from '@/lib/emissions'
import { toast } from "sonner"

type ItineraryLegForm = {
  mode: TransportMode
  day: string
  offsetMinutes: string
  stopTitle: string
  stopDesc: string
  stopImage: string
  mapsQuery: string
  fromName: string
  toName: string
  distanceKm: string
  fromLat: string
  fromLng: string
  toLat: string
  toLng: string
  note: string
}

export function CreatePackageForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageData, setImageData] = useState<string | null>(null)
  const [itinerary, setItinerary] = useState<ItineraryLegForm[]>([])

  const modeOptions = useMemo(
    () =>
      (Object.keys(transportModeLabels) as TransportMode[]).map((m) => ({
        value: m,
        label: transportModeLabels[m],
      })),
    []
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageData(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addLeg = () => {
    setItinerary((prev) => [
      ...prev,
      {
        mode: 'CAR',
        day: '1',
        offsetMinutes: '0',
        stopTitle: '',
        stopDesc: '',
        stopImage: '',
        mapsQuery: '',
        fromName: '',
        toName: '',
        distanceKm: '',
        fromLat: '',
        fromLng: '',
        toLat: '',
        toLng: '',
        note: '',
      },
    ])
  }

  const removeLeg = (index: number) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index))
  }

  const updateLeg = (index: number, patch: Partial<ItineraryLegForm>) => {
    setItinerary((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    const itineraryData = itinerary
      .map((l, idx) => {
        const day = l.day.trim() ? Number(l.day) : 1
        const offsetMinutes = l.offsetMinutes.trim() ? Number(l.offsetMinutes) : 0
        const n = l.distanceKm.trim() ? Number(l.distanceKm) : null
        const fromLat = l.fromLat.trim() ? Number(l.fromLat) : null
        const fromLng = l.fromLng.trim() ? Number(l.fromLng) : null
        const toLat = l.toLat.trim() ? Number(l.toLat) : null
        const toLng = l.toLng.trim() ? Number(l.toLng) : null
        return {
          order: idx,
          mode: l.mode,
          day: Number.isFinite(day) && day > 0 ? Math.floor(day) : 1,
          offsetMinutes: Number.isFinite(offsetMinutes) && offsetMinutes > 0 ? Math.floor(offsetMinutes) : 0,
          stopTitle: l.stopTitle.trim() || null,
          stopDesc: l.stopDesc.trim() || null,
          stopImage: l.stopImage.trim() || null,
          mapsQuery: l.mapsQuery.trim() || null,
          fromName: l.fromName.trim() || '',
          toName: l.toName.trim() || '',
          distanceKm: typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null,
          fromLat: typeof fromLat === 'number' && Number.isFinite(fromLat) ? fromLat : null,
          fromLng: typeof fromLng === 'number' && Number.isFinite(fromLng) ? fromLng : null,
          toLat: typeof toLat === 'number' && Number.isFinite(toLat) ? toLat : null,
          toLng: typeof toLng === 'number' && Number.isFinite(toLng) ? toLng : null,
          note: l.note.trim() || null,
        }
      })
      .filter((v): v is NonNullable<typeof v> => v != null)

    const packageData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      imageData: imageData,
      duration: formData.get('duration') as string,
      groupSize: formData.get('groupSize') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      included: (formData.get('included') as string).split(',').map(item => item.trim()),
      itinerary: itineraryData,
    }

    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      })

      if (!response.ok) {
        throw new Error('Failed to create package')
      }

      toast.success('Package created successfully')
      router.push(`/admin/manage-packages`)
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error('Failed to create package')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Label htmlFor="name">Package Name</Label>
        <Input id="name" name="name" placeholder="Enter package name" required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="Enter location" required />
      </div>
      <div>
        <Label htmlFor="imageData">Upload Image</Label>
        <Input id="imageData" type="file" accept="image/*" onChange={handleImageChange} required />
      </div>
      <div>
        <Label htmlFor="duration">Duration</Label>
        <Input id="duration" name="duration" placeholder="e.g., 5 days" required />
      </div>
      <div>
        <Label htmlFor="groupSize">Group Size</Label>
        <Input id="groupSize" name="groupSize" placeholder="e.g., 2-10 people" required />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" placeholder="Enter price" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Enter package description" required />
      </div>
      <div>
        <Label htmlFor="included">Included Items</Label>
        <Input id="included" name="included" placeholder="Enter included items (comma-separated)" required />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Itinerary & Emissions</CardTitle>
          <Button type="button" variant="outline" onClick={addLeg}>
            Add Leg
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {itinerary.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Thêm các chặng di chuyển (phương tiện + điểm đi/đến). Hệ thống sẽ dùng quãng đường bạn nhập để tính CO2e.
            </div>
          ) : (
            itinerary.map((leg, idx) => (
              <div key={idx} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Leg {idx + 1}</div>
                  <Button type="button" variant="ghost" onClick={() => removeLeg(idx)}>
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Input
                      value={leg.day}
                      onChange={(e) => updateLeg(idx, { day: e.target.value })}
                      placeholder="1"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offset phút</Label>
                    <Input
                      value={leg.offsetMinutes}
                      onChange={(e) => updateLeg(idx, { offsetMinutes: e.target.value })}
                      placeholder="0 (09:00)"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select
                      value={leg.mode}
                      onValueChange={(v) => updateLeg(idx, { mode: normalizeMode(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modeOptions.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      value={leg.fromName}
                      onChange={(e) => updateLeg(idx, { fromName: e.target.value })}
                      placeholder="Điểm xuất phát"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      value={leg.toName}
                      onChange={(e) => updateLeg(idx, { toName: e.target.value })}
                      placeholder="Điểm đến"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Stop title (hiển thị)</Label>
                    <Input
                      value={leg.stopTitle}
                      onChange={(e) => updateLeg(idx, { stopTitle: e.target.value })}
                      placeholder="Ví dụ: Hồ Xuân Hương"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Maps query</Label>
                    <Input
                      value={leg.mapsQuery}
                      onChange={(e) => updateLeg(idx, { mapsQuery: e.target.value })}
                      placeholder="Hồ Xuân Hương Đà Lạt"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Stop image (URL hoặc data:)</Label>
                    <Input
                      value={leg.stopImage}
                      onChange={(e) => updateLeg(idx, { stopImage: e.target.value })}
                      placeholder="https://... hoặc data:image/.."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop description</Label>
                    <Input
                      value={leg.stopDesc}
                      onChange={(e) => updateLeg(idx, { stopDesc: e.target.value })}
                      placeholder="Mô tả ngắn..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      value={leg.distanceKm}
                      onChange={(e) => updateLeg(idx, { distanceKm: e.target.value })}
                      placeholder="Ví dụ: 125"
                      inputMode="decimal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From (lat,lng)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={leg.fromLat}
                        onChange={(e) => updateLeg(idx, { fromLat: e.target.value })}
                        placeholder="lat"
                        inputMode="decimal"
                      />
                      <Input
                        value={leg.fromLng}
                        onChange={(e) => updateLeg(idx, { fromLng: e.target.value })}
                        placeholder="lng"
                        inputMode="decimal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>To (lat,lng)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={leg.toLat}
                        onChange={(e) => updateLeg(idx, { toLat: e.target.value })}
                        placeholder="lat"
                        inputMode="decimal"
                      />
                      <Input
                        value={leg.toLng}
                        onChange={(e) => updateLeg(idx, { toLng: e.target.value })}
                        placeholder="lng"
                        inputMode="decimal"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Note</Label>
                    <Input
                      value={leg.note}
                      onChange={(e) => updateLeg(idx, { note: e.target.value })}
                      placeholder="Gợi ý đổi phương tiện, điểm dừng, lưu ý..."
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Package'}
      </Button>
    </form>
  )
}
