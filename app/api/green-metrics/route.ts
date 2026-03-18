import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

const KG_CO2_PER_KM_CAR = 0.192 // rough average passenger car
const KG_PLASTIC_SAVED_PER_GREEN_BOOKING = 0.15 // demo heuristic (e.g., avoid single-use items)
const KG_CO2_PER_TREE_PER_YEAR = 21 // rough absorption per mature tree/year

function toMode(m: unknown) {
  return String(m ?? "").trim().toUpperCase()
}

export async function GET() {
  try {
    // Count "green" distance from package itineraries marked as WALK/BIKE/BICYCLE
    const greenBookings = await prisma.packageBooking.findMany({
      where: {
        status: { not: "CANCELLED" },
      },
      select: {
        numberOfGuests: true,
        package: {
          select: {
            itinerary: {
              select: { mode: true, distanceKm: true },
            },
          },
        },
      },
    })

    let greenBookingsCount = 0
    let greenGuests = 0
    let greenKm = 0

    for (const b of greenBookings) {
      const legs = b.package?.itinerary ?? []
      const km = legs
        .filter((l) => ["WALK", "BIKE", "BICYCLE"].includes(toMode(l.mode)))
        .reduce((sum, l) => sum + (l.distanceKm ?? 0), 0)

      if (km > 0) {
        greenBookingsCount += 1
        greenGuests += b.numberOfGuests ?? 1
        greenKm += km
      }
    }

    const co2SavedKg = Math.round(greenKm * KG_CO2_PER_KM_CAR * Math.max(1, greenGuests))
    const plasticSavedKg = Math.round(greenBookingsCount * KG_PLASTIC_SAVED_PER_GREEN_BOOKING * 10) / 10
    const treesEquivalent = Math.max(0, Math.round(co2SavedKg / KG_CO2_PER_TREE_PER_YEAR))

    return NextResponse.json({
      co2SavedKg,
      plasticSavedKg,
      treesEquivalent,
      greenBookingsCount,
      greenGuests,
      greenKm: Math.round(greenKm * 10) / 10,
    })
  } catch (error) {
    console.error("Error computing green metrics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

