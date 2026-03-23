import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Public GET endpoint: /api/community/posts/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching community post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

