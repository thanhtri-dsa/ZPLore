import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getAuth, currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.communityComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching community comments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === "production" || process.env.FORCE_CLERK_AUTH === "true")

    let userId: string | null = null
    let authorNameFallback = "Ẩn danh"
    if (clerkEnabled) {
      try {
        userId = getAuth(req).userId ?? null
      } catch {
        userId = null
      }
      try {
        const u = await currentUser()
        authorNameFallback = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || u?.username || "Người dùng"
      } catch {
        // ignore
      }
    } else {
      userId = 'dev-user'
    }

    // MVP/test: nếu chưa login Clerk thì vẫn ghi comment bằng `dev-user`.
    if (!userId) userId = 'dev-user'

    const body = (await req.json()) as Record<string, unknown>
    const authorName = String(body.authorName ?? "").trim() || authorNameFallback
    const content = String(body.content ?? "").trim()
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const created = await prisma.communityComment.create({
      data: {
        postId: params.id,
        userId,
        authorName,
        content,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating community comment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

