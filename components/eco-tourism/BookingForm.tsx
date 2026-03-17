'use client'

import React, { useEffect, useState } from 'react'
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
  Users
} from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  bookingDate: string | null
  numberOfGuests: number
  specialRequests: string | null
  destinationName: string | null
  price: number | null
}

export default function AdminBookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updatedData: { status: newStatus }
        }),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Guest Details
          <SlidersHorizontal className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (props) => {
        const booking = props.row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{`${booking.firstname} ${booking.lastname}`}</div>
            <div className="text-sm text-gray-500">{booking.email}</div>
            <div className="text-sm text-gray-500">{booking.phone}</div>
          </div>
        )
      },
    },
    {
      id: 'bookingDetails',
      header: 'Booking Details',
      cell: (props) => {
        const booking = props.row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              {booking.bookingDate 
                ? format(new Date(booking.bookingDate), 'PPP')
                : 'Date not specified'
              }
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              {`${booking.numberOfGuests} guest${booking.numberOfGuests > 1 ? 's' : ''}`}
            </div>
            {booking.destinationName && (
              <div className="font-medium text-green-600">
                {booking.destinationName}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'price',
      header: 'Price',
      cell: (props) => {
        const price = props.row.original.price
        return price 
          ? `KES ${price.toLocaleString()}`
          : '-'
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: (props) => {
        const status = props.getValue() as string
        const statusStyles = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
          COMPLETED: 'bg-blue-100 text-blue-800',
        } as const
        
        return (
          <Badge className={statusStyles[status as keyof typeof statusStyles]}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: (props) => {
        const booking = props.row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(booking.id, 'APPROVED')}
                className="text-green-600"
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(booking.id, 'REJECTED')}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                className="text-blue-600"
              >
                <Check className="mr-2 h-4 w-4" /> Mark as Completed
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

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      const data = await response.json()
      setBookings(data.bookings)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-2xl font-bold">
                Booking Management
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(
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
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-16 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-16 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-[50px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-lg font-medium">No bookings found</p>
                          <p className="text-sm text-muted-foreground">
                            Bookings will appear here when customers make reservations.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}