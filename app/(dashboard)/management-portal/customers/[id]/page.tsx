'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Mail, Phone, CalendarClock, MapPin, Route, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Customer = {
  id: string
  clerkUserId: string | null
  firstName: string | null
  lastName: string | null
  fullName: string | null
  email: string
  phone: string | null
  country: string | null
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
  _count: { bookings: number; aiPlannerBookings: number; packageBookings: number }
}

type BookingRow = {
  id: string
  status: string
  destinationName: string | null
  price: number | null
  bookingDate: string | null
  numberOfGuests: number
  createdAt: string
}

type AIPlannerRow = {
  id: string
  status: string
  startLocation: string
  endLocation: string
  transportMode: string
  distanceKm: number | null
  co2Kg: number | null
  bookingDate: string | null
  numberOfGuests: number
  createdAt: string
}

type PackageBookingRow = {
  id: string
  status: string
  packageId: string
  price: number
  bookingDate: string | null
  numberOfGuests: number
  createdAt: string
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [aiBookings, setAiBookings] = useState<AIPlannerRow[]>([])
  const [packageBookings, setPackageBookings] = useState<PackageBookingRow[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${id}`)
      if (!res.ok) throw new Error('Failed to fetch customer')
      const json = (await res.json()) as {
        customer: Customer
        bookings: BookingRow[]
        aiPlannerBookings: AIPlannerRow[]
        packageBookings: PackageBookingRow[]
      }
      setCustomer(json.customer)
      setBookings(json.bookings || [])
      setAiBookings(json.aiPlannerBookings || [])
      setPackageBookings(json.packageBookings || [])
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to fetch customer', variant: 'destructive' })
      setCustomer(null)
      setBookings([])
      setAiBookings([])
      setPackageBookings([])
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const title = useMemo(() => {
    if (!customer) return 'Customer'
    return (
      (customer.fullName && customer.fullName.trim()) ||
      [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
      customer.email
    )
  }, [customer])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push('/management-portal/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !customer ? (
        <div className="text-sm text-muted-foreground">Customer not found.</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </CardTitle>
              </CardHeader>
              <CardContent className="font-semibold">{customer.email}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </CardTitle>
              </CardHeader>
              <CardContent className="font-semibold">{customer.phone || '-'}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" /> Last Seen
                </CardTitle>
              </CardHeader>
              <CardContent className="font-semibold">
                {customer.lastSeenAt ? new Date(customer.lastSeenAt).toLocaleString() : '-'}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Destination Bookings
                  <Badge variant="secondary" className="ml-2">{bookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No bookings.</div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ref</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Guests</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-mono text-xs">{b.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <Badge variant={b.status === 'PENDING' ? 'secondary' : 'default'} className="text-xs">
                                {b.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[180px]">{b.destinationName || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">{b.numberOfGuests}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {typeof b.price === 'number' ? b.price.toLocaleString('vi-VN') : '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Route className="h-5 w-5" /> AI Planner
                  <Badge variant="secondary" className="ml-2">{aiBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiBookings.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No AI planner bookings.</div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ref</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead className="whitespace-nowrap">Mode</TableHead>
                          <TableHead className="whitespace-nowrap">CO₂ (kg)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aiBookings.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-mono text-xs">{a.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <Badge variant={a.status === 'PENDING' ? 'secondary' : 'default'} className="text-xs">
                                {a.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[220px]">
                              {a.startLocation} → {a.endLocation}
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3" /> {a.numberOfGuests}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{a.transportMode}</TableCell>
                            <TableCell className="whitespace-nowrap">{typeof a.co2Kg === 'number' ? a.co2Kg.toFixed(2) : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Package Bookings
                <Badge variant="secondary" className="ml-2">{packageBookings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {packageBookings.length === 0 ? (
                <div className="text-sm text-muted-foreground">No package bookings.</div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packageBookings.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === 'PENDING' ? 'secondary' : 'default'} className="text-xs">
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{p.packageId.slice(0, 8)}</TableCell>
                          <TableCell>{p.numberOfGuests}</TableCell>
                          <TableCell className="whitespace-nowrap">{p.price.toLocaleString('vi-VN')}</TableCell>
                          <TableCell className="whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

