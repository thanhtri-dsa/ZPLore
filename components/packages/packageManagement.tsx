'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Booking {
  id: string
  firstname: string
  lastname: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  bookingDate: string
  destinationName: string
  numberOfGuests: number
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/packages/bookings?page=${page}&limit=10${status ? `&status=${status}` : ''}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch bookings')
      }
      const data = await response.json()
      setBookings(data.bookings)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, status, toast])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      console.log(`Updating booking ${bookingId} to status ${newStatus}`) // Debug log

      const response = await fetch(`/api/packages/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData) // Debug log
        throw new Error(errorData.error || 'Failed to update booking status')
      }

      const updatedBooking = await response.json()
      console.log('Updated booking:', updatedBooking) // Debug log

      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
      })

      fetchBookings() // Refresh the bookings list
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update booking status',
        variant: 'destructive',
      })
    }
  }

  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  )

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Bookings</CardTitle>
        <Select value={status || 'ALL'} onValueChange={(value) => setStatus(value === 'ALL' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </TableBody>
          </Table>
        ) : bookings.length === 0 ? (
          <Alert>
            <AlertTitle>No bookings found</AlertTitle>
            <AlertDescription>
              There are currently no bookings matching the selected criteria.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{`${booking.firstname} ${booking.lastname}`}</TableCell>
                  <TableCell>{booking.email}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.destinationName}</TableCell>
                  <TableCell>{booking.numberOfGuests}</TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(booking.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}