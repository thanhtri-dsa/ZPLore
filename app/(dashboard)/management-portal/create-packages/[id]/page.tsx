'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface PackageFormData {
    name: string
    location: string
    duration: string | number
    groupSize: string | number
    price: number
    description: string
    imageData?: string
    included?: string[]
}

export default function EditPackagePage({ params }: { params: { id: string } }) {
    const [formData, setFormData] = useState<PackageFormData>({
        name: '',
        location: '',
        duration: '',
        groupSize: '',
        price: 0,
        description: '',
        imageData: '',
        included: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    const router = useRouter()
    const { toast } = useToast()

    const fetchPackage = useCallback(async () => {
        try {
            const response = await fetch(`/api/packages/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch package')
            const data = await response.json()
            setFormData({
                name: data.name,
                location: data.location,
                duration: data.duration || '',
                groupSize: data.groupSize || '',
                price: data.price,
                description: data.description,
                imageData: data.imageData || '',
                included: data.included || []
            })
            toast({
                title: 'Package Loaded',
                description: 'The package has been loaded successfully for editing.',
            })
        } catch (error) {
            console.error('Error fetching package:', error)
            setError('Failed to fetch package data')
            toast({
                title: 'Error',
                description: 'Failed to load package data. Please try again later.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }, [params.id, toast])

    useEffect(() => {
        fetchPackage()
    }, [fetchPackage])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        // Validate required fields
        if (!formData.name || !formData.location || !formData.duration || 
            !formData.groupSize || !formData.price || !formData.description) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        try {
            const response = await fetch(`/api/packages/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update package')
            }

            toast({
                title: 'Package Updated Successfully',
                description: `"${formData.name}" has been updated successfully.`,
                duration: 5000,
            })

            router.push('/management-portal/create-packages')
            router.refresh()
        } catch (error) {
            console.error('Error updating package:', error)
            toast({
                title: 'Update Failed',
                description: 'There was a problem updating your package. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        toast({
            title: 'Edit Cancelled',
            description: 'Your changes have been discarded.',
            duration: 3000,
        })
        router.push('/management-portal/create-packages')
    }

    if (isLoading) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-8 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Package</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="groupSize">Group Size</Label>
                        <Input
                            id="groupSize"
                            type="number"
                            value={formData.groupSize}
                            onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[200px]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageData">Image Data (optional)</Label>
                        <Input
                            id="imageData"
                            value={formData.imageData || ''}
                            onChange={(e) => setFormData({ ...formData, imageData: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}