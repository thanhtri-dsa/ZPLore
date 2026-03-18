'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useClerkEnabled } from '@/components/clerk-enabled'
import { Loader2, Bold, Italic, Heading, List } from 'lucide-react'

type FormData = {
  title: string
  content: string
  tags: string
}

export default function CreateBlog() {
  const clerkEnabled = useClerkEnabled()
  return clerkEnabled ? <CreateBlogWithClerk /> : <CreateBlogInner isSignedIn={true} userId="dev-admin" redirectToSignIn={false} />
}

function CreateBlogWithClerk() {
  const { isSignedIn, userId } = useAuth()
  return <CreateBlogInner isSignedIn={!!isSignedIn} userId={userId ?? null} redirectToSignIn={true} />
}

function CreateBlogInner({ isSignedIn, userId, redirectToSignIn }: { isSignedIn: boolean; userId: string | null; redirectToSignIn: boolean }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    tags: '',
  })

  React.useEffect(() => {
    if (redirectToSignIn && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isSignedIn, redirectToSignIn, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 10MB",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTextFormat = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'heading':
        formattedText = `\n# ${selectedText}`
        break
      case 'list':
        formattedText = `\n- ${selectedText}`
        break
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    setFormData(prev => ({
      ...prev,
      content: newContent
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSignedIn) {
      toast({
        title: "Error",
        description: "You must be signed in to create a blog post",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)

    try {
      let imageData = null

      if (selectedImage) {
        const reader = new FileReader()
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(selectedImage)
        })
      }

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          image: imageData,
          authorId: userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creating blog post')
      }

      const result = await response.json()
      console.log('Blog post created:', result)

      toast({
        title: "Success",
        description: "Blog post created successfully",
      })

      router.push('/admin/manage-blogs')
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSignedIn) {
    return null // or a loading state
  }

  return (
    <Card className="w-full max-w-4xl  mx-auto">
      <CardHeader>
        <CardTitle className='ml-8 lg:ml-0'>Create New Blog Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">Title</label>
            <Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">Content</label>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTextFormat('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTextFormat('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTextFormat('heading')}
                  title="Heading"
                >
                  <Heading className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTextFormat('list')}
                  title="List"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="content"
                ref={textareaRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your blog content here... (Supports Markdown formatting)"
                className="w-full p-4 min-h-[18rem] outline-none resize-y"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium">Tags</label>
            <Input
              id="tags"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Blog Image</label>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {previewUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Blog Post'
            )}
          </Button>
        </form>  
      </CardContent>
    </Card>
  )
}
