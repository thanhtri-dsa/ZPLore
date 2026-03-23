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

async function sanitizeTable(modelName, readRows, updateMany) {
  const rows = await readRows()
  const ids = rows.filter((r) => isInvalidImage(r.imageData)).map((r) => r.id)
  if (ids.length === 0) {
    console.log(`${modelName}: 0 invalid rows`)
    return 0
  }
  const res = await updateMany(ids)
  console.log(`${modelName}: sanitized ${res.count} rows`)
  return res.count
}

async function main() {
  let total = 0

  total += await sanitizeTable(
    'Package',
    () => prisma.package.findMany({ select: { id: true, imageData: true } }),
    (ids) => prisma.package.updateMany({ where: { id: { in: ids } }, data: { imageData: null } })
  )
  total += await sanitizeTable(
    'Destination',
    () => prisma.destination.findMany({ select: { id: true, imageData: true } }),
    (ids) => prisma.destination.updateMany({ where: { id: { in: ids } }, data: { imageData: null } })
  )
  total += await sanitizeTable(
    'Blog',
    () => prisma.blog.findMany({ select: { id: true, imageData: true } }),
    (ids) => prisma.blog.updateMany({ where: { id: { in: ids } }, data: { imageData: null } })
  )
  total += await sanitizeTable(
    'CommunityPost',
    () => prisma.communityPost.findMany({ select: { id: true, imageData: true } }),
    (ids) => prisma.communityPost.updateMany({ where: { id: { in: ids } }, data: { imageData: null } })
  )
  total += await sanitizeTable(
    'EcoReward',
    () => prisma.ecoReward.findMany({ select: { id: true, imageData: true } }),
    (ids) => prisma.ecoReward.updateMany({ where: { id: { in: ids } }, data: { imageData: null } })
  )

  console.log('Total sanitized rows:', total)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

