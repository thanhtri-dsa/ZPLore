import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Public GET endpoint - /api/blogs
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageData: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        authorName: true,
      },
    })
    return NextResponse.json(blogs)
  } catch (error) {
    console.error('no blogs available:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Protected POST endpoint - /api/blogs
export async function POST(request: Request) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

    let userId: string | null = null
    let authorName = 'Dev Admin'
    if (clerkEnabled) {
      const authRes = await auth()
      userId = authRes.userId ?? null
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      authorName = `${user.firstName} ${user.lastName}`.trim()
    } else {
      userId = 'dev-admin'
    }

    const { title, content, tags, image } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        tags,
        imageData: image,
        authorId: userId,
        authorName,
      },
    })

    return NextResponse.json(newBlog, { status: 201 })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
