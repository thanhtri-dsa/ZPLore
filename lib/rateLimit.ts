import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextApiRequest, NextApiResponse } from 'next'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

// Rate limit configurations for different endpoints
export const rateLimits = {
  // General API endpoints - 20 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),
  
  // Authentication attempts - 5 attempts per 5 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  
  // Booking endpoints - 10 requests per hour
  booking: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'ratelimit:booking',
  }),

  // Add more rate limit configurations as needed
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'), // 3 contact form submissions per 15 minutes
    analytics: true,
    prefix: 'ratelimit:contact',
  }),

  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 search requests per minute
    analytics: true,
    prefix: 'ratelimit:search',
  }),
}


// Helper function for middleware
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimits = 'api'
) {
  const ip = request.ip ?? '127.0.0.1'
  const limit = rateLimits[type]
  
  const { success, pending, limit: rateLimitInfo, reset } = await limit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        rateLimitInfo: {
          pending,
          limit: rateLimitInfo,
          reset,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitInfo.toString(),
          'X-RateLimit-Remaining': pending.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }
  
  return null
}

// Helper function for API routes
export async function rateLimitAPI(
  req: NextApiRequest,
  res: NextApiResponse,
  type: keyof typeof rateLimits = 'api'
) {
  const ip = req.headers['x-forwarded-for'] as string ?? '127.0.0.1'
  const limit = rateLimits[type]
  
  try {
    const { success, pending, limit: rateLimitInfo, reset } = await limit.limit(ip)
    
    if (!success) {
      res.status(429).json({
        error: 'Too many requests',
        rateLimitInfo: {
          pending,
          limit: rateLimitInfo,
          reset,
        },
      })
      return false
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitInfo.toString())
    res.setHeader('X-RateLimit-Remaining', pending.toString())
    res.setHeader('X-RateLimit-Reset', reset.toString())
    
    return true
  } catch (error) {
    console.error('Rate limit error:', error)
    return true // Allow request to proceed on error
  }
}

// Helper to check remaining limits
export async function getRateLimitInfo(
  identifier: string,
  type: keyof typeof rateLimits = 'api'
) {
  const limit = rateLimits[type]
  
  try {
    const { success, pending, limit: rateLimitInfo, reset } = await limit.limit(
      identifier,
      {} 
    )
    
    return {
      remaining: pending,
      limit: rateLimitInfo,
      reset,
      isBlocked: !success,
    }
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return null
  }
}