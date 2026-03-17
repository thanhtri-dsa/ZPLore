'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { X, Loader2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransportMode, normalizeMode, transportModeLabels } from '@/lib/emissions'
import RouteMapLoader from '@/components/ui/RouteMapLoader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Package {
  id: string
  name: string
  location: string
  imageData?: string
  duration: string
  groupSize: string
  price: number
  description: string
  included: { id: string; item: string; packageId: string }[]
  itinerary?: Array<{
    id: string
    order: number
    mode: string
    fromName: string
    toName: string
    distanceKm: number | null
    fromLat: number | null
    fromLng: number | null
    toLat: number | null
    toLng: number | null
    note: string | null
  }>
}

interface PackageFormData extends Omit<Package, 'id' | 'price' | 'included' | 'itinerary'> {
  price: string
  included: string[]
  itinerary: Array<{
    mode: TransportMode
    fromName: string
    toName: string
    distanceKm: string
    fromLat: string
    fromLng: string
    toLat: string
    toLng: string
    note: string
  }>
}

const initialFormData: PackageFormData = {
  name: '',
  location: '',
  imageData: '',
  duration: '',
  groupSize: '',
  price: '',
  description: '',
  included: [],
  itinerary: [],
}

export default function PackageForm({ params }: { params: { id?: string } }) {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<PackageFormData>(initialFormData)
  const [currentIncluded, setCurrentIncluded] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const itineraryMapPoints = React.useMemo(() => {
    const pts: Array<{ lat: number; lng: number; label?: string }> = []
    const pushIfValid = (latRaw: string, lngRaw: string, label?: string) => {
      const lat = latRaw.trim() ? Number(latRaw) : NaN
      const lng = lngRaw.trim() ? Number(lngRaw) : NaN
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
      const last = pts[pts.length - 1]
      if (last && Math.abs(last.lat - lat) < 0.000001 && Math.abs(last.lng - lng) < 0.000001) return
      pts.push({ lat, lng, label })
    }
    for (const leg of formData.itinerary) {
      pushIfValid(leg.fromLat, leg.fromLng, leg.fromName)
      pushIfValid(leg.toLat, leg.toLng, leg.toName)
    }
    return pts.length >= 2 ? pts : undefined
  }, [formData.itinerary])

  const fetchPackage = useCallback(async (id: string) => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/packages/${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const pkg: Package = await response.json()
      
      setFormData({
        name: pkg.name,
        location: pkg.location,
        imageData: pkg.imageData || '',
        duration: pkg.duration,
        groupSize: pkg.groupSize,
        price: pkg.price.toString(),
        description: pkg.description,
        included: pkg.included.map(item => item.item),
        itinerary: (pkg.itinerary ?? [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((l) => ({
            mode: normalizeMode(l.mode),
            fromName: l.fromName,
            toName: l.toName,
            distanceKm: typeof l.distanceKm === 'number' && Number.isFinite(l.distanceKm) ? String(l.distanceKm) : '',
            fromLat: typeof l.fromLat === 'number' && Number.isFinite(l.fromLat) ? String(l.fromLat) : '',
            fromLng: typeof l.fromLng === 'number' && Number.isFinite(l.fromLng) ? String(l.fromLng) : '',
            toLat: typeof l.toLat === 'number' && Number.isFinite(l.toLat) ? String(l.toLat) : '',
            toLng: typeof l.toLng === 'number' && Number.isFinite(l.toLng) ? String(l.toLng) : '',
            note: l.note ?? '',
          })),
      })
    } catch (error) {
      console.error('Error fetching package:', error)
      toast({
        title: "Error",
        description: "Failed to fetch package details. Please try again.",
        variant: "destructive",
      })
      router.push('/management-portal/manage-packages')
    } finally {
      setIsFetching(false)
    }
  }, [router, toast])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && params.id) {
      setIsEditing(true)
      fetchPackage(params.id)
    }
  }, [params.id, mounted, fetchPackage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const itinerary = formData.itinerary
        .map((l, idx) => ({
          order: idx,
          mode: l.mode,
          fromName: l.fromName.trim(),
          toName: l.toName.trim(),
          distanceKm: l.distanceKm.trim() ? Number(l.distanceKm) : null,
          fromLat: l.fromLat.trim() ? Number(l.fromLat) : null,
          fromLng: l.fromLng.trim() ? Number(l.fromLng) : null,
          toLat: l.toLat.trim() ? Number(l.toLat) : null,
          toLng: l.toLng.trim() ? Number(l.toLng) : null,
          note: l.note.trim() || null,
        }))
        .filter((l) => l.fromName && l.toName)

      const response = await fetch(
        `/api/packages${isEditing ? `/${params.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            itinerary,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save package')
      }

      toast({
        title: "Success",
        description: `Package ${isEditing ? 'updated' : 'created'} successfully`,
      })

      router.push('/management-portal/manage-packages')
      router.refresh()
    } catch (error) {
      console.error('Error saving package:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} package`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!params.id) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/packages/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete package')
      }

      toast({
        title: "Success",
        description: "Package deleted successfully",
      })

      router.push('/management-portal/manage-packages')
      router.refresh()
    } catch (error) {
      console.error('Error deleting package:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete package',
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleIncludedKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentIncluded.trim()) {
      e.preventDefault()
      if (!formData.included.includes(currentIncluded.trim())) {
        setFormData(prev => ({
          ...prev,
          included: [...prev.included, currentIncluded.trim()]
        }))
      }
      setCurrentIncluded('')
    }
  }

  const removeIncluded = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included.filter(item => item !== itemToRemove)
    }))
  }

  const addLeg = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { mode: 'CAR', fromName: '', toName: '', distanceKm: '', fromLat: '', fromLng: '', toLat: '', toLng: '', note: '' },
      ],
    }))
  }

  const updateLeg = (index: number, patch: Partial<PackageFormData['itinerary'][number]>) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }))
  }

  const removeLeg = (index: number) => {
    setFormData((prev) => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index) }))
  }

  const moveLeg = (index: number, dir: -1 | 1) => {
    setFormData((prev) => {
      const next = prev.itinerary.slice()
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return { ...prev, itinerary: next }
    })
  }

  if (!mounted) {
    return null
  }

  if (isFetching) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{isEditing ? 'Edit Package' : 'Create New Package'}</CardTitle>
          {isEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="text"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size</Label>
                <Input
                  id="groupSize"
                  name="groupSize"
                  type="text"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="included">What&apos;s Included</Label>
              <Input
                id="included"
                value={currentIncluded}
                onChange={(e) => setCurrentIncluded(e.target.value)}
                onKeyDown={handleIncludedKeyDown}
                placeholder="Press Enter to add items"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.included.map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeIncluded(item)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Itinerary (legs + transport)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLeg}>
                  Add Leg
                </Button>
              </div>

              {formData.itinerary.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Thêm các chặng để mô tả “đi bằng phương tiện gì”, “đến đâu thì đổi phương tiện”.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.itinerary.map((leg, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Leg {idx + 1}</div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLeg(idx, -1)}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLeg(idx, 1)}
                            disabled={idx === formData.itinerary.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeLeg(idx)}>
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Mode</Label>
                          <Select value={leg.mode} onValueChange={(v) => updateLeg(idx, { mode: normalizeMode(v) })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(transportModeLabels) as TransportMode[]).map((m) => (
                                <SelectItem key={m} value={m}>
                                  {transportModeLabels[m]}
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
                      </div>
                      <div className="space-y-2">
                        <Label>Note</Label>
                        <Input
                          value={leg.note}
                          onChange={(e) => updateLeg(idx, { note: e.target.value })}
                          placeholder="Gợi ý đổi phương tiện / điểm dừng..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bản đồ lộ trình</Label>
              <div className="h-[320px] w-full rounded-xl overflow-hidden border bg-gray-50">
                <RouteMapLoader
                  location={formData.location || 'Tour'}
                  name={formData.name || 'Tour'}
                  points={itineraryMapPoints}
                  showPanel={false}
                  disableGeolocation={true}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Khi bạn đổi thứ tự/chỉnh tọa độ các chặng, bản đồ sẽ tự cập nhật theo.
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageData">Image URL</Label>
              <Input
                id="imageData"
                name="imageData"
                value={formData.imageData || ''}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/management-portal/manage-packages')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Package' : 'Create Package'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the package.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
