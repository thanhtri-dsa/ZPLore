import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const domain = 'https://www.forestlinetours.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tours',
          '/destinations',
          '/about',
          '/contact',
          '/services'
        ],
        disallow: [
          '/management-portal/*',
          '/sign-in',
          '/sign-up',
          '/api/*',
          '/user/*',
          '/profile',
          '/draft/*',
          '/preview/*'
        ],
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
    host: domain,
  }
}