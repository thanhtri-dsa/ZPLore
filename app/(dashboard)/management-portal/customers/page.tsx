'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Search, UserRound, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type CustomerRow = {
  id: string
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

export default function CustomersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const limit = 20

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (query.trim()) params.set('q', query.trim())
      const res = await fetch(`/api/customers?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      const json = (await res.json()) as { customers: CustomerRow[]; totalPages: number }
      setCustomers(json.customers || [])
      setTotalPages(json.totalPages || 1)
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to fetch customers', variant: 'destructive' })
      setCustomers([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, query, toast])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    setPage(1)
  }, [query])

  const rows = useMemo(() => customers, [customers])

  const gotoCustomer = (id: string) => {
    router.push(`/management-portal/customers/${id}`)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold ml-12 lg:ml-0 tracking-tight">Customers</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name/email/phone..."
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Customer List
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No customers found.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => {
                    const displayName =
                      (c.fullName && c.fullName.trim()) ||
                      [c.firstName, c.lastName].filter(Boolean).join(' ') ||
                      '(No name)'
                    const totalBookings = (c._count?.bookings ?? 0) + (c._count?.aiPlannerBookings ?? 0) + (c._count?.packageBookings ?? 0)
                    return (
                      <TableRow key={c.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{displayName}</span>
                            {c.country ? (
                              <Badge variant="secondary" className="text-xs">
                                {c.country}
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{c.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{c.phone || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={totalBookings > 0 ? 'default' : 'secondary'} className="text-xs">
                            {totalBookings}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {c.lastSeenAt ? new Date(c.lastSeenAt).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => gotoCustomer(c.id)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && totalPages > 1 ? (
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

