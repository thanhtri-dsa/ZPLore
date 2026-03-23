/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function isInvalidImage(value) {
  if (typeof value !== 'string') return false
  const v = value.trim()
  if (!v) return false
  return !(
    v.startsWith('/') ||
    /^https?:\/\//i.test(v) ||
    /^data:image\//i.test(v)
  )
}

async function main() {
  const [packages, destinations, blogs, posts, rewards] = await Promise.all([
    prisma.package.findMany({ select: { id: true, imageData: true } }),
    prisma.destination.findMany({ select: { id: true, imageData: true } }),
    prisma.blog.findMany({ select: { id: true, imageData: true } }),
    prisma.communityPost.findMany({ select: { id: true, imageData: true } }),
    prisma.ecoReward.findMany({ select: { id: true, imageData: true } }),
  ])

  const counts = {
    package: packages.filter((x) => isInvalidImage(x.imageData)).length,
    destination: destinations.filter((x) => isInvalidImage(x.imageData)).length,
    blog: blogs.filter((x) => isInvalidImage(x.imageData)).length,
    communityPost: posts.filter((x) => isInvalidImage(x.imageData)).length,
    ecoReward: rewards.filter((x) => isInvalidImage(x.imageData)).length,
  }

  console.log('Invalid imageData counts:', counts)

  const samples = {
    package: packages.find((x) => isInvalidImage(x.imageData)),
    destination: destinations.find((x) => isInvalidImage(x.imageData)),
    blog: blogs.find((x) => isInvalidImage(x.imageData)),
    communityPost: posts.find((x) => isInvalidImage(x.imageData)),
    ecoReward: rewards.find((x) => isInvalidImage(x.imageData)),
  }
  console.log('Sample invalid rows:', samples)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

