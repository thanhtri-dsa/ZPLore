/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * Usage:
 *   node scripts/clear-other-itineraries.js
 *
 * It will delete PackageItineraryLeg for ALL packages except the keep list below.
 */
async function main() {
  // Keep only the tour test we inserted earlier.
  // Change if you want to keep multiple tours.
  const KEEP_PACKAGE_IDS = ['cmmwmbhzr0000ic3p06qg6egi']

  console.log('KEEP_PACKAGE_IDS:', KEEP_PACKAGE_IDS)

  const before = await prisma.packageItineraryLeg.count()
  console.log('Total PackageItineraryLeg before:', before)

  const result = await prisma.packageItineraryLeg.deleteMany({
    where: {
      NOT: {
        packageId: { in: KEEP_PACKAGE_IDS },
      },
    },
  })

  const after = await prisma.packageItineraryLeg.count()
  console.log('Deleted rows:', result.count)
  console.log('Total PackageItineraryLeg after:', after)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

