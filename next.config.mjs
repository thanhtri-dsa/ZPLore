import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

/** @type {import('next').NextConfig} */
const makeConfig = (phase) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**' },
        { protocol: 'http', hostname: '**' },
      ],
    },
  }

  return nextConfig
}

export default makeConfig
