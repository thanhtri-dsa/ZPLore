import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/about", "/contact", "/tours", "/blog", "/sign-in", "/sign-up"];

const isProtectedRoute = createRouteMatcher(["/management-portal(.*)"]);
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
