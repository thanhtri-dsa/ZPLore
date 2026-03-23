/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const targetName = process.argv[2] || 'pham thanh tri'
  const addPoints = Number(process.argv[3] || '10000')

  if (!Number.isFinite(addPoints) || addPoints <= 0) {
    throw new Error('Points must be a positive number')
  }

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { fullName: { contains: targetName, mode: 'insensitive' } },
        { email: { contains: targetName, mode: 'insensitive' } },
        { firstName: { contains: targetName, mode: 'insensitive' } },
        { lastName: { contains: targetName, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      firstName: true,
      lastName: true,
      email: true,
      ecoPoints: true,
    },
  })

  if (customers.length === 0) {
    console.log('No matching customer found.')
    return
  }

  const customer = customers[0]

  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: { ecoPoints: { increment: addPoints } },
    select: { id: true, fullName: true, email: true, ecoPoints: true },
  })

  await prisma.ecoPointLog.create({
    data: {
      customerId: customer.id,
      actionType: 'EARN_CHALLENGE',
      pointsChange: addPoints,
      description: `Manual admin bonus +${addPoints} points`,
    },
  })

  console.log('Updated customer:', updated)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

