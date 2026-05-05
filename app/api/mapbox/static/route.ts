import { NextRequest } from 'next/server'

const MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  ''

function buildStaticMapUrl(lng: number, lat: number, zoom: number) {
  const marker = `pin-s+2563eb(${lng},${lat})`
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${marker}/${lng},${lat},${zoom},0/960x540?access_token=${MAPBOX_TOKEN}`
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const lng = Number(url.searchParams.get('lng'))
  const lat = Number(url.searchParams.get('lat'))
  const zoom = Number(url.searchParams.get('zoom') || '14')

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return new Response('Invalid coordinates', { status: 400 })
  }

  if (!MAPBOX_TOKEN) {
    return new Response('Mapbox token is not configured', { status: 500 })
  }

  const mapUrl = buildStaticMapUrl(lng, lat, Number.isFinite(zoom) ? zoom : 14)
  return Response.redirect(mapUrl, 302)
}
