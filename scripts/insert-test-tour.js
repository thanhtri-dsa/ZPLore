/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const pkg = await prisma.package.create({
    data: {
      name: 'TEST - Dubai Eco Route',
      location: 'Dubai, UAE',
      imageData: '/images/banner_style.png',
      duration: '4 Ngày',
      groupSize: '2-10 Người',
      price: 4500000,
      description: 'Tour test để kiểm tra map route + thứ tự lộ trình hiển thị trên trang packages/[id].',
      authorId: 'dev-admin',
      authorName: 'Test Admin',
      included: {
        create: [{ item: 'Test included item' }],
      },
      itinerary: {
        create: [
          {
            order: 0,
            day: 1,
            mode: 'CAR',
            fromName: 'Dubai Mall',
            toName: 'Burj Khalifa',
            fromLat: 25.197197,
            fromLng: 55.274376,
            toLat: 25.197167,
            toLng: 55.279717,
            note: 'Leg 1 - test',
          },
          {
            order: 1,
            day: 1,
            mode: 'CAR',
            fromName: 'Burj Khalifa',
            toName: 'Dubai Marina',
            fromLat: 25.197167,
            fromLng: 55.279717,
            toLat: 25.081657,
            toLng: 55.139400,
            note: 'Leg 2 - test',
          },
          {
            order: 2,
            day: 1,
            mode: 'CAR',
            fromName: 'Dubai Marina',
            toName: 'Jumeirah Beach',
            fromLat: 25.081657,
            fromLng: 55.139400,
            toLat: 25.143876,
            toLng: 55.163895,
            note: 'Leg 3 - test',
          },
        ],
      },
    },
    include: {
      itinerary: { orderBy: { order: 'asc' } },
    },
  })

  console.log('TEST TOUR CREATED')
  console.log('package id:', pkg.id)
  console.log('itinerary legs (order):')
  for (const l of pkg.itinerary) {
    console.log(
      `- ${l.order}: ${l.fromName} (${l.fromLat},${l.fromLng}) -> ${l.toName} (${l.toLat},${l.toLng})`,
    )
  }
}

main()
  .catch((e) => {
    console.error('Failed to insert test tour:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

