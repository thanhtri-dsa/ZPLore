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
import { Pencil, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface IncludedItem {
  id: string
  item: string
  packageId: string
}

interface Package {
  id: string
  name: string
  location: string
  imageData?: string
  duration: number
  groupSize: number
  price: number
  description: string
  included: IncludedItem[]
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
}

export default function PackageManagement() {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 8
  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE)
  
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return packages.slice(startIndex, endIndex)
  }

  const fetchPackages = useCallback(async () => {
    try {
      const response = await fetch('/api/packages')
      if (!response.ok) throw new Error('Failed to fetch packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
      setPackages([])
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  const handleEdit = (packageId: string) => {
    router.push(`/management-portal/manage-packages/${packageId}`)
  }

  const handleDelete = async (packageId: string) => {
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete package')

      toast({
        title: "Success",
        description: "Package deleted successfully",
      })

      fetchPackages()
      router.refresh()
    } catch (error) {
      console.error('Error deleting package:', error)
      toast({
        title: "Error",
        description: "Failed to delete package",
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
        <CardTitle>Manage Packages</CardTitle>
        <Button onClick={() => router.push('/management-portal/create-packages')}>
          Create New Package
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Group Size</TableHead>
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
        ) : packages.length === 0 ? (
          <Alert>
            <AlertTitle>No packages found</AlertTitle>
            <AlertDescription>
              There are currently no packages. Click the &quot;Create New Package&quot; button to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Group Size</TableHead>
                  <TableHead>Price (KES)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageData().map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">
                      {pkg.name}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pkg.included.map((includedItem) => (
                          <Badge 
                            key={includedItem.id}
                            variant="secondary" 
                            className="text-xs bg-green-50"
                          >
                            {includedItem.item}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{pkg.location}</TableCell>
                    <TableCell>{`${pkg.duration} Days`}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {pkg.groupSize}
                      </div>
                    </TableCell>
                    <TableCell>{pkg.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pkg.id)}
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
                                This action cannot be undone. This will permanently delete the package
                                and all associated data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(pkg.id)}>
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
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, packages.length)} of {packages.length} packages
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