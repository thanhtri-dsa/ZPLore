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

    const userId = clerkEnabled ? getAuth(_req).userId : "dev-user"
    if (clerkEnabled && !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await prisma.communityPostSave.upsert({
      where: { postId_userId: { postId: params.id, userId: userId! } },
      update: {},
      create: { postId: params.id, userId: userId! },
    })

    const savesCount = await prisma.communityPostSave.count({ where: { postId: params.id } })
    const post = await prisma.communityPost.update({
      where: { id: params.id },
      data: { savesCount },
      select: { id: true, savesCount: true },
    })
    return NextResponse.json(post)
  } catch (error) {
    console.error("Error saving community post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

