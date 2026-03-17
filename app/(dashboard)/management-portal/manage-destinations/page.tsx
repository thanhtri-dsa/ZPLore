'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface Destination {
  id: string
  name: string
  country: string
  city: string
  amount: number
  tags: string[]
  daysNights: number
  tourType: string
  createdAt: string
}

export default function DestinationManagement() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 8
  const totalPages = Math.ceil(destinations.length / ITEMS_PER_PAGE)
  
  // Get current page's destinations
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return destinations.slice(startIndex, endIndex)
  }

  const fetchDestinations = useCallback(async () => {
    try {
      const response = await fetch('/api/destinations')
      if (!response.ok) throw new Error('Failed to fetch destinations')
      const data = await response.json()
      setDestinations(data)
    } catch (error) {
      console.error('Error fetching destinations:', error)
      setDestinations([])
      toast({
        title: "Error",
        description: "Failed to fetch destinations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  const handleEdit = (destinationId: string) => {
    router.push(`/management-portal/manage-destinations/${destinationId}`)
  }

  const handleDelete = async (destinationId: string) => {
    try {
      const response = await fetch(`/api/destinations/${destinationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete destination')

      toast({
        title: "Success",
        description: "Destination deleted successfully",
      })

      fetchDestinations()
      router.refresh()
    } catch (error) {
      console.error('Error deleting destination:', error)
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      })
    }
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  )

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Destinations</CardTitle>
        <Button onClick={() => router.push('/management-portal/create-destinations')}>
          Create New Destination
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Tour Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price (KES)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(8)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </TableBody>
          </Table>
        ) : destinations.length === 0 ? (
          <Alert>
            <AlertTitle>No destinations found</AlertTitle>
            <AlertDescription>
              There are currently no destinations. Click the &quot;Create New Destination&quot; button to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tour Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price (KES)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageData().map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">
                      {destination.name}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {destination.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs  bg-green-50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{`${destination.city}, ${destination.country}`}</TableCell>
                    <TableCell>{destination.tourType}</TableCell>
                    <TableCell>{`${destination.daysNights} Days`}</TableCell>
                    <TableCell>{destination.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(destination.id)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the destination
                                and all associated data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(destination.id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, destinations.length)} of {destinations.length} destinations
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
