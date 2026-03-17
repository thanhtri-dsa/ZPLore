import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function looksMojibake(value) {
  if (typeof value !== 'string') return false
  if (!value) return false
  return /Ã|Â|Ä|áº|Æ|â€”|â€“|â€™|â€œ|â€|ï¿½/.test(value)
}

function fixMojibake(value) {
  if (!looksMojibake(value)) return value
  try {
    const fixed = Buffer.from(value, 'latin1').toString('utf8')
    if (!fixed || fixed === value) return value
    if (fixed.includes('�')) return value
    return fixed
  } catch {
    return value
  }
}

function fixObjectStrings(obj, keys) {
  const out = {}
  let changed = false
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string') {
      const nv = fixMojibake(v)
      out[k] = nv
      if (nv !== v) changed = true
    }
  }
  return { data: out, changed }
}

async function main() {
  const summary = {
    packages: 0,
    included: 0,
    itinerary: 0,
    destinations: 0,
    blogs: 0,
  }

  const packages = await prisma.package.findMany({
    include: { included: true, itinerary: true },
  })
  for (const p of packages) {
    const { data, changed } = fixObjectStrings(p, ['name', 'location', 'duration', 'groupSize', 'description', 'imageData', 'authorName'])
    if (changed) {
      await prisma.package.update({ where: { id: p.id }, data })
      summary.packages++
    }

    for (const inc of p.included) {
      const fixedItem = fixMojibake(inc.item)
      if (fixedItem !== inc.item) {
        await prisma.included.update({ where: { id: inc.id }, data: { item: fixedItem } })
        summary.included++
      }
    }

    for (const leg of p.itinerary) {
      const fixedFrom = fixMojibake(leg.fromName)
      const fixedTo = fixMojibake(leg.toName)
      const fixedNote = leg.note != null ? fixMojibake(leg.note) : leg.note
      if (fixedFrom !== leg.fromName || fixedTo !== leg.toName || fixedNote !== leg.note) {
        await prisma.packageItineraryLeg.update({
          where: { id: leg.id },
          data: { fromName: fixedFrom, toName: fixedTo, note: fixedNote },
        })
        summary.itinerary++
      }
    }
  }

  const destinations = await prisma.destination.findMany()
  for (const d of destinations) {
    const { data, changed } = fixObjectStrings(d, ['name', 'country', 'city', 'tags', 'imageData', 'description', 'tourType'])
    if (changed) {
      await prisma.destination.update({ where: { id: d.id }, data })
      summary.destinations++
    }
  }

  const blogs = await prisma.blog.findMany()
  for (const b of blogs) {
    const { data, changed } = fixObjectStrings(b, ['title', 'content', 'tags', 'authorName', 'imageData'])
    if (changed) {
      await prisma.blog.update({ where: { id: b.id }, data })
      summary.blogs++
    }
  }

  console.log('fix-mojibake summary', summary)
}

await main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

