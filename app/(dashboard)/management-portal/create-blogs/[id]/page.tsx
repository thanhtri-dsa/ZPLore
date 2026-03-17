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

interface BlogFormData {
  title: string
  content: string
  tags: string[]
  imageData?: string
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    tags: [],
    imageData: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()
  
  const fetchBlog = useCallback(async () => {
    try {
      const response = await fetch(`/api/blogs/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch blog')
      const data = await response.json()
      setFormData({
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        imageData: data.imageData || '',
      })
      toast({
        title: "Blog Loaded",
        description: "The blog post has been loaded successfully for editing.",
      })
    } catch (error) {
      console.error('Error fetching blog:', error)
      setError('Failed to fetch blog data')
      toast({
        title: "Error",
        description: "Failed to load blog data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [params.id, toast])

  useEffect(() => {
    fetchBlog()
  }, [fetchBlog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update blog')
      }

      toast({
        title: "Blog Updated Successfully",
        description: `"${formData.title}" has been updated with ${formData.tags.length} tags and ${formData.content.length} characters of content.`,
        duration: 5000,
      })
      
      router.push('/blogs')
      router.refresh()
    } catch (error) {
      console.error('Error updating blog:', error)
      toast({
        title: "Update Failed",
        description: "There was a problem updating your blog. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    toast({
      title: "Edit Cancelled",
      description: "Your changes have been discarded.",
      duration: 3000,
    })
    router.push('/management-portal/create-blogs')
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
        <CardTitle>Edit Blog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[200px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageData">Image URL (optional)</Label>
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