import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getAuth } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === "production" || process.env.FORCE_CLERK_AUTH === "true")

    // Nếu Clerk bật mà chưa login thì dùng `dev-user` để vẫn cho tương tác chạy (MVP/test).
    let userId: string | null = null
    if (clerkEnabled) {
      try {
        userId = getAuth(_req).userId ?? null
      } catch {
        userId = null
      }
    }
    if (!userId) userId = "dev-user"

    // Ensure each user can like once (v2 table), keep counter as aggregate
    await prisma.communityPostLike.upsert({
      where: { postId_userId: { postId: params.id, userId: userId! } },
      update: {},
      create: { postId: params.id, userId: userId! },
    })

    const likesCount = await prisma.communityPostLike.count({ where: { postId: params.id } })
    const post = await prisma.communityPost.update({
      where: { id: params.id },
      data: { likesCount },
      select: { id: true, likesCount: true },
    })
    return NextResponse.json(post)
  } catch (error) {
    console.error("Error liking community post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

