import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Public pages (SEO/content) should remain accessible without login
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/blogs",
  "/packages",
  "/destinations",
  "/explore",
  "/green-travel",
  "/community",
  "/dream-journey",
  "/ai-planner",
  "/sign-in",
  "/sign-up",
];

const isProtectedRoute = createRouteMatcher(["/admin/dashboard(.*)"]); // or just remove if not needed
const isPublicRoute = createRouteMatcher(publicRoutes);

const clerkHandler = clerkMiddleware((auth, req) => {
  const response = NextResponse.next();

  if (isPublicRoute(req)) {
    response.headers.set('X-Robots-Tag', 'index, follow');
  }

  if (isPublicRoute(req)) {
    return response;
  }

  if (isProtectedRoute(req)) {
    return auth.protect().then((authObject) => {
      if (authObject.userId) {
        return response;
      }
      return NextResponse.redirect(new URL('/sign-in', req.url));
    });
  }

  return response;
});

export default function middleware(req: NextRequest, event: any) {
  if (req.nextUrl.pathname === '/@vite/client') {
    return new NextResponse('', {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }

  const clerkEnabled =
    !!process.env.CLERK_SECRET_KEY?.trim() &&
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
    (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

  if (!clerkEnabled) {
    const res = NextResponse.next();
    if (isPublicRoute(req) || req.nextUrl.pathname.startsWith("/api")) {
      res.headers.set('X-Robots-Tag', 'index, follow');
    }
    return res;
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
