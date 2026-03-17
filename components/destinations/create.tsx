'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

export function CreateDestinationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageData, setImageData] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageData(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    const destinationData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      city: formData.get('city') as string,
      amount: parseFloat(formData.get('amount') as string),
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
      imageData: imageData,
      description: formData.get('description') as string,
      daysNights: parseInt(formData.get('daysNights') as string),
      tourType: formData.get('tourType') as 'DAYS' | 'NIGHTS',
    }

    try {
      const response = await fetch('/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(destinationData),
      })

      if (!response.ok) {
        throw new Error('Failed to create destination')
      }

      toast.success('Destination created successfully')
      router.push(`/management-portal/create-destinations`)
    } catch (error) {
      console.error('Error creating destination:', error)
      toast.error('Failed to create destination')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Label htmlFor="name">Destination Name</Label>
        <Input id="name" name="name" placeholder="Enter destination name" required />
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" placeholder="Enter country" required />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" placeholder="Enter city" required />
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" placeholder="Enter amount" required />
      </div>
      <div>
        <Label htmlFor="tags">Tags/Whats Included</Label>
        <Input id="tags" name="tags" placeholder="Enter tags (comma-separated)" required />
      </div>
      <div>
        <Label htmlFor="imageData">Upload Image</Label>
        <Input id="imageData" type="file" accept="image/*" onChange={handleImageChange} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Enter destination description" required />
      </div>
      <div>
        <Label htmlFor="daysNights">Duration</Label>
        <Input id="daysNights" name="daysNights" type="number" placeholder="Enter number of days/nights" required />
      </div>
      <div>
        <Label>Tour Type</Label>
        <RadioGroup name="tourType" defaultValue="DAYS">
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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Destination'}
      </Button>
    </form>
  )
}

