import { NextRequest, NextResponse } from 'next/server'

type OrsRequestBody = {
  coordinates: Array<[number, number]>
  profile?: string
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ORS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ORS_API_KEY is not configured' }, { status: 500 })
    }

    const body = (await req.json()) as OrsRequestBody
    const coordinates = Array.isArray(body.coordinates) ? body.coordinates : []
    if (coordinates.length < 2) {
      return NextResponse.json({ error: 'coordinates must have at least 2 points' }, { status: 400 })
    }
    const profile = typeof body.profile === 'string' && body.profile.trim().length > 0 ? body.profile.trim() : 'driving-car'

    const orsRes = await fetch(`https://api.openrouteservice.org/v2/directions/${encodeURIComponent(profile)}/geojson`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates,
      }),
      cache: 'no-store',
    })

    const text = await orsRes.text()
    if (!orsRes.ok) {
      return NextResponse.json(
        { error: 'OpenRouteService request failed', status: orsRes.status, details: text },
        { status: 502 }
      )
    }

    try {
      const json = JSON.parse(text)
      return NextResponse.json(json)
    } catch {
      return NextResponse.json({ error: 'Invalid OpenRouteService response' }, { status: 502 })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

