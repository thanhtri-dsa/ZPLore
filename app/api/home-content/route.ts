import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [featured, reviews] = await Promise.all([
      prisma.homeFeaturedBlog.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 3,
      }),
      prisma.homeReview.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 6,
      }),
    ])

    const blogIds = featured.map((f) => f.blogId)
    const blogsRaw = blogIds.length
      ? await prisma.blog.findMany({ where: { id: { in: blogIds } } })
      : []

    // Preserve configured ordering
    const blogs = blogIds
      .map((id) => blogsRaw.find((b) => b.id === id))
      .filter(Boolean)

    return NextResponse.json({ blogs, reviews })
  } catch (error) {
    console.error('Error loading home content:', error)
    return NextResponse.json({ blogs: [], reviews: [] }, { status: 200 })
  }
}

