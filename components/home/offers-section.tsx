import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"

interface Blog {
  id: string
  title: string
  content: string
  imageData: string
  createdAt: string
  authorName: string
}

export function BlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blogs')
        if (!response.ok) {
          throw new Error('Failed to fetch blogs')
        }
        const data = await response.json()
        // Ensure data is an array before slicing
        const blogsData = Array.isArray(data) ? data.slice(0, 3) : []
        setBlogs(blogsData)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to load blogs')
        setIsLoading(false)
        console.error(err)
      }
    }

    fetchBlogs()
  }, [])

  // Rendering skeletons for loading state
  if (isLoading) {
    return (
      <section className="py-16 vn-pattern">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center rounded-full bg-secondary/20 px-4 py-1 text-sm text-primary font-bold">
            Tin tức mới nhất
          </div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="vn-title text-2xl font-bold mt-4 mb-2">Đọc các bài viết của chúng tôi</h2>
            <Link href="/blogs" className="text-primary text-md hover:underline font-bold">
              Xem tất cả bài viết
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <Skeleton className="h-[200px] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error State
  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center text-red-500">
          {error}
        </div>
      </section>
    )
  }

  // No Blogs State
  if (blogs.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          No blogs available
        </div>
      </section>
    )
  }

  // Blogs Render
  return (
    <section className="py-16 vn-pattern">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="vn-title text-2xl font-bold">Bài viết mới nhất</h2>
          <Link href="/blogs" className="text-primary hover:underline font-bold">
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card key={blog.id} className="vn-card overflow-hidden group">
              <CardContent className="relative p-0">
                <Image
                  src={blog.imageData || '/placeholder-image.jpg'}
                  alt={blog.title}
                  width={400}
                  height={200}
                  {...(blog.imageData.startsWith('data:') 
                    ? { unoptimized: true } 
                    : {})}
                  className="h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 p-6 flex flex-col justify-end">
                  <h3 className="mb-2 text-xl font-bold text-white group-hover:text-secondary transition-colors">{blog.title}</h3>
                  <p className="mb-4 text-xs text-white/70">
                    Bởi {blog.authorName} • {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-fit bg-secondary text-primary hover:bg-white hover:text-primary font-bold rounded-full"
                    asChild
                  >
                    <Link href={`/blogs/${blog.id}`}>
                      Đọc thêm
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
