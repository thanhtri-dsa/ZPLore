'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Check, 
  Filter, 
  MoreVertical, 
  Search, 
  SlidersHorizontal,
  X,
  AlertCircle,
  Calendar,
  Users,
  Phone,
  Mail,
  RefreshCw,
  MoreHorizontal,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CONFIRMED' | 'CANCELLED'
  bookingDate: string | null
  numberOfGuests: number
  specialRequests: string | null
  destinationName: string | null
  price: number | null
  createdAt: string
}

export default function AdminBookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings?limit=1000')
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to retrieve booking records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch(`/api/destinations/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      fetchBookings()
    } catch {
      setError('Failed to update booking status')
    }
  }

  const columns: ColumnDef<Booking>[] = [
    {
      id: 'guest',
      accessorFn: (row) => `${row.firstname} ${row.lastname}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-slate-500"
        >
          Traveler
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold ring-2 ring-white">
              {booking.firstname.charAt(0)}{booking.lastname.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">{`${booking.firstname} ${booking.lastname}`}</span>
              <span className="text-[10px] text-slate-400 font-medium">{booking.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'destination',
      accessorKey: 'destinationName',
      header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Destination</span>,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">{row.original.destinationName || 'Not Specified'}</span>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {row.original.bookingDate ? format(new Date(row.original.bookingDate), 'MMM d, yyyy') : 'TBD'}
          </span>
        </div>
      )
    },
    {
      id: 'guests',
      accessorKey: 'numberOfGuests',
      header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Party</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {row.original.numberOfGuests} {row.original.numberOfGuests === 1 ? 'Guest' : 'Guests'}
        </div>
      )
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Value</span>,
      cell: ({ row }) => {
        const price = row.original.price
        return (
          <span className="text-xs font-black text-slate-900">
            {price ? `$${price.toLocaleString()}` : 'N/A'}
          </span>
        )
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</span>,
      cell: ({ getValue }) => {
        const status = getValue() as string
        const statusStyles = {
          PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
          APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          REJECTED: 'bg-red-50 text-red-600 border-red-100',
          COMPLETED: 'bg-blue-50 text-blue-600 border-blue-100',
          CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          CANCELLED: 'bg-red-50 text-red-600 border-red-100',
        } as const
        const statusClass = statusStyles[status as keyof typeof statusStyles] ?? 'bg-slate-50 text-slate-600 border-slate-200'

        return (
          <Badge variant="outline" className={`${statusClass} text-[10px] font-bold h-5 border px-2`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const booking = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-lg">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-100 shadow-xl p-1.5">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">Operations</DropdownMenuLabel>
              {booking.status === 'PENDING' && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(booking.id, 'APPROVED')}
                    className="rounded-lg h-9 text-xs font-bold text-emerald-600 cursor-pointer"
                  >
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Approve Reservation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(booking.id, 'REJECTED')}
                    className="rounded-lg h-9 text-xs font-bold text-red-600 cursor-pointer"
                  >
                    <ShieldX className="mr-2 h-3.5 w-3.5" /> Decline Request
                  </DropdownMenuItem>
                </>
              )}
              {booking.status === 'APPROVED' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                  className="rounded-lg h-9 text-xs font-bold text-blue-600 cursor-pointer"
                >
                  <Check className="mr-2 h-3.5 w-3.5" /> Mark as Completed
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-1 border-slate-50" />
              <DropdownMenuItem className="rounded-lg h-9 text-xs font-bold text-slate-700 cursor-pointer">
                <ExternalLink className="mr-2 h-3.5 w-3.5 text-slate-400" /> View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Destination Audit</h2>
          <p className="text-sm text-slate-500 font-medium">Detailed log of all travel reservations across global destinations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBookings} className="h-9 border-slate-200 shadow-sm text-xs font-bold text-slate-600">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Log
          </Button>
        </div>
      </div>

      <Card className="border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Filter by traveler, email, or destination..."
                className="pl-10 h-10 bg-slate-50 border-slate-100 rounded-lg text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5"
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-10 px-4 rounded-lg border-slate-100 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Filter className="mr-2 h-3.5 w-3.5" /> Advanced
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="pl-6 h-11">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="h-16 border-slate-50">
                      {Array(5).fill(0).map((_, j) => (
                        <TableCell key={j} className="pl-6"><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                      <TableCell className="pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="h-16 border-slate-50 hover:bg-slate-50/50 transition-colors group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="pl-6">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-xs font-medium text-slate-400"
                    >
                      No audit records found matching your query.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="flex-1 text-xs font-bold text-slate-500">
            {table.getFilteredRowModel().rows.length} records total
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 rounded-lg border-slate-200 text-[10px] font-bold"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 rounded-lg border-slate-200 text-[10px] font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
