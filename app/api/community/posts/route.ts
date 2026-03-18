import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getAuth } from "@clerk/nextjs/server"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

function normalizeTags(tags: unknown): string | null {
  if (Array.isArray(tags)) {
    const s = tags.map((t) => String(t).trim()).filter(Boolean).join(",")
    return s || null
  }
  if (typeof tags === "string") {
    const s = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(",")
    return s || null
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get("q") ?? "").trim()
    const take = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 20)))

    const posts = await prisma.communityPost.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { authorName: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              { tags: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        comments: { orderBy: { createdAt: "desc" }, take: 2 },
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const clerkEnabled =
      !!process.env.CLERK_SECRET_KEY?.trim() &&
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      (process.env.NODE_ENV === "production" || process.env.FORCE_CLERK_AUTH === "true")

    let userId: string | null = null
    let authorNameFallback = "Ẩn danh"
    if (clerkEnabled) {
      userId = getAuth(req).userId ?? null
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      const u = await currentUser()
      authorNameFallback = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || u?.username || "Người dùng"
    } else {
      userId = "dev-user"
    }

    const body = (await req.json()) as Record<string, unknown>
    const authorName = String(body.authorName ?? "").trim() || authorNameFallback
    const titleRaw = String(body.title ?? "").trim()
    const content = String(body.content ?? "").trim()
    const imageData = typeof body.imageData === "string" ? body.imageData : null
    const location = typeof body.location === "string" ? body.location.trim() : null
    const tags = normalizeTags(body.tags)

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const created = await prisma.communityPost.create({
      data: {
        userId,
        authorName,
        title: titleRaw || null,
        content,
        imageData,
        location,
        tags,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating community post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

