// app/sitemap.ts
import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Blog {
  id: string
  slug?: string
  updatedAt: Date | string
}

interface Package {
  id: string
  slug?: string
  updatedAt: Date | string
}

async function fetchBlogs() {
  try {
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        updatedAt: true,
      }
    })
    return blogs
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error)
    return []
  }
}

async function fetchPackages() {
  try {
    const packages = await prisma.package.findMany({
      select: {
        id: true,
        updatedAt: true,
      }
    })
    return packages
  } catch (error) {
    console.error('Error fetching packages for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.forestlinetours.com'

  // Fetch dynamic data
  const [blogs, packages] = await Promise.all([
    fetchBlogs(),
    fetchPackages(),
  ])

  // Create static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/destinations/africa`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations/middle-east`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-and-condition`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Create blog routes
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog: Blog) => ({
    url: `${baseUrl}/blogs/${blog.id}`, // Using id since slug might not exist or be different
    lastModified: new Date(blog.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Create package routes
  const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg: Package) => ({
    url: `${baseUrl}/packages/${pkg.id}`, // Using id since slug might not exist or be different
    lastModified: new Date(pkg.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...blogRoutes, ...packageRoutes]
}
