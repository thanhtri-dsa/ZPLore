'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { X, Loader2 } from 'lucide-react'

interface Destination {
  id: string
  name: string
  country: string
  city: string
  amount: number
  tags: string[]
  imageData?: string | null
  description: string
  daysNights: number
  tourType: string
}

interface DestinationFormData extends Omit<Destination, 'id' | 'amount' | 'daysNights'> {
  amount: string
  daysNights: string
}



export default function DestinationForm({ params }: { params: { id?: string } }) {
  const [formData, setFormData] = useState<DestinationFormData>({
    name: '',
    country: '',
    city: '',
    amount: '',
    tags: [],
    imageData: '',
    description: '',
    daysNights: '',
    tourType: ''
  })
  const [currentTag, setCurrentTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchDestination = useCallback(async (id: string) => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/destinations/${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const destination: Destination = await response.json()
      
      setFormData({
        name: destination.name,
        country: destination.country,
        city: destination.city,
        amount: destination.amount.toString(),
        tags: destination.tags,
        imageData: destination.imageData || '',
        description: destination.description,
        daysNights: destination.daysNights.toString(),
        tourType: destination.tourType
      })
    } catch (error) {
      console.error('Error fetching destination:', error)
      toast({
        title: "Error",
        description: "Failed to fetch destination details. Please try again.",
        variant: "destructive",
      })
      router.push('/management-portal/manage-destinations')
    } finally {
      setIsFetching(false)
    }
  }, [router, toast])

  useEffect(() => {
    if (params.id) {
      setIsEditing(true)
      fetchDestination(params.id)
    }
  }, [params.id, fetchDestination])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate numeric fields
      if (isNaN(parseFloat(formData.amount)) || isNaN(parseInt(formData.daysNights))) {
        throw new Error('Invalid amount or days/nights value')
      }

      const response = await fetch(
        `/api/destinations${isEditing ? `/${params.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount),
            daysNights: parseInt(formData.daysNights),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save destination')
      }

      toast({
        title: "Success",
        description: `Destination ${isEditing ? 'updated' : 'created'} successfully`,
      })

      router.push('/management-portal/manage-destinations')
      router.refresh()
    } catch (error) {
      console.error('Error saving destination:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} destination`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }))
      }
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Destination' : 'Create New Destination'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Destination Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Price (KES)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
            <Label htmlFor="daysNights">Duration (Days/Nights)</Label>
              <Input
                id="daysNights"
                name="daysNights"
                type="number"
                min="1"
                step="1"
                value={formData.daysNights}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags/Whats Included</Label>
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Press Enter to add tags"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
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
              onClick={() => router.push('/management-portal/manage-destinations')}
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
                isEditing ? 'Update Destination' : 'Create Destination'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}