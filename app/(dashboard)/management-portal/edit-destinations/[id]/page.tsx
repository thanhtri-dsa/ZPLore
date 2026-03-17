'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useClerkEnabled } from '@/components/clerk-enabled'

interface DestinationFormData {
    name: string
    country: string
    city: string
    amount: number
    tags: string[]
    imageData?: string
    description: string
    daysNights: number
    tourType: 'DAYS' | 'NIGHTS'
}

export default function EditDestinationPage({ params }: { params: { id: string } }) {
    const clerkEnabled = useClerkEnabled()
    return clerkEnabled ? <EditDestinationWithClerk params={params} /> : <EditDestinationInner params={params} isLoaded={true} userId={'dev-admin'} />
}

function EditDestinationWithClerk({ params }: { params: { id: string } }) {
    const { isLoaded, userId } = useAuth()
    return <EditDestinationInner params={params} isLoaded={isLoaded} userId={userId ?? null} />
}

function EditDestinationInner({ params, isLoaded, userId }: { params: { id: string }, isLoaded: boolean, userId: string | null }) {
    const [formData, setFormData] = useState<DestinationFormData>({
        name: '',
        country: '',
        city: '',
        amount: 0,
        tags: [],
        imageData: '',
        description: '',
        daysNights: 0,
        tourType: 'DAYS'
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    const router = useRouter()
    const { toast } = useToast()

    const fetchDestination = useCallback(async () => {
        try {
            const response = await fetch(`/api/destinations/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch destination')
            const data = await response.json()
            setFormData({
                name: data.name,
                country: data.country,
                city: data.city,
                amount: data.amount,
                tags: data.tags || [],
                imageData: data.imageData || '',
                description: data.description,
                daysNights: data.daysNights,
                tourType: data.tourType
            })
            toast({
                title: 'Destination Loaded',
                description: 'The destination has been loaded successfully for editing.',
            })
        } catch (error) {
            console.error('Error fetching destination:', error)
            setError('Failed to fetch destination data')
            toast({
                title: 'Error',
                description: 'Failed to load destination data. Please try again later.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }, [params.id, toast])

    useEffect(() => {
        if (isLoaded && userId) {
            fetchDestination()
        }
    }, [isLoaded, userId, fetchDestination])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded || !userId) {
            toast({
                title: 'Authentication Error',
                description: 'You must be logged in to update a destination.',
                variant: 'destructive',
            })
            return
        }

        setIsSaving(true)

        if (!formData.name || !formData.country || !formData.city || !formData.amount || !formData.description || !formData.daysNights) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            })
            setIsSaving(false)
            return
        }

        try {
            const response = await fetch(`/api/destinations/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update destination')
            }

            toast({
                title: 'Destination Updated Successfully',
                description: `"${formData.name}" has been updated successfully.`,
                duration: 5000,
            })

            router.push('/management-portal/destinations')
            router.refresh()
        } catch (error) {
            console.error('Error updating destination:', error)
            toast({
                title: 'Update Failed',
                description: 'There was a problem updating your destination. Please try again.',
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
        router.push('/management-portal/destinations')
    }

    if (!isLoaded) {
        return <div>Loading...</div>
    }

    if (!userId) {
        return <div>Please sign in to edit destinations</div>
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
                <CardTitle>Edit Destination</CardTitle>
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
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={formData.tags.join(', ')}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
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
                        <Label htmlFor="daysNights">Duration</Label>
                        <Input
                            id="daysNights"
                            type="number"
                            value={formData.daysNights}
                            onChange={(e) => setFormData({ ...formData, daysNights: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tour Type</Label>
                        <RadioGroup
                            value={formData.tourType}
                            onValueChange={(value) => setFormData({ ...formData, tourType: value as 'DAYS' | 'NIGHTS' })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DAYS" id="days" />
                                <Label htmlFor="days">Days</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="NIGHTS" id="nights" />
                                <Label htmlFor="nights">Nights</Label>
                            </div>
                        </RadioGroup>
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
