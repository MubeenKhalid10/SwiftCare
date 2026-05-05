import { NextRequest } from 'next/server'

type ProviderResult = {
  lat: number
  lng: number
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('true-client-ip'),
    forwardedFor?.split(',')[0]?.trim(),
  ]

  const ip = candidates.find((candidate) => candidate && candidate !== 'unknown')
  return ip || ''
}

async function fetchCoordinatesFromProviders(ip?: string): Promise<ProviderResult | null> {
  const suffix = ip ? `/${encodeURIComponent(ip)}` : ''
  const providers = [
    async () => {
      const response = await fetch(`https://ipapi.co${suffix}/json/`, { cache: 'no-store' })
      if (!response.ok) return null

      const data = await response.json()
      const lat = Number(data?.latitude)
      const lng = Number(data?.longitude)

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      return { lat, lng }
    },
    async () => {
      const response = await fetch(`https://ipwho.is${suffix}`, { cache: 'no-store' })
      if (!response.ok) return null

      const data = await response.json()
      const lat = Number(data?.latitude)
      const lng = Number(data?.longitude)

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      return { lat, lng }
    },
    async () => {
      const response = await fetch(`https://ipinfo.io${suffix}/json`, { cache: 'no-store' })
      if (!response.ok) return null

      const data = await response.json()
      const loc = typeof data?.loc === 'string' ? data.loc.split(',') : []
      const lat = Number(loc[0])
      const lng = Number(loc[1])

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      return { lat, lng }
    },
  ]

  for (const provider of providers) {
    try {
      const result = await provider()
      if (result) return result
    } catch {
      continue
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const location = await fetchCoordinatesFromProviders(ip)

  if (!location) {
    return Response.json({ error: 'Unable to resolve location' }, { status: 502 })
  }

  return Response.json(location, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}