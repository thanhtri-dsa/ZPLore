import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

/** @type {import('next').NextConfig} */
const makeConfig = (phase) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    images: {
      domains: [
        'images.unsplash.com',
        'cms.travelworld.nl',
        'tse2.mm.bing.net',
        'handmadeak.com',
        'battrangplaza.com',
        'media.giphy.com',
        'i.giphy.com',
        'giphy.com',
        'media.tenor.com',
        'tenor.com'
      ],
      remotePatterns: [
        { protocol: 'https', hostname: 'images.unsplash.com' },
        { protocol: 'https', hostname: 'cms.travelworld.nl' },
        { protocol: 'https', hostname: 'tse2.mm.bing.net' },
        { protocol: 'https', hostname: 'handmadeak.com' },
        { protocol: 'https', hostname: 'battrangplaza.com' },
        { protocol: 'https', hostname: 'media.giphy.com' },
        { protocol: 'https', hostname: 'i.giphy.com' },
        { protocol: 'https', hostname: 'giphy.com' },
        { protocol: 'https', hostname: 'media.tenor.com' },
        { protocol: 'https', hostname: 'tenor.com' }
      ],
    },
    webpack: (config, { dev }) => {
      if (dev) {
        config.cache = false
      }
      return config
    },
  }

  return nextConfig
}

export default makeConfig
