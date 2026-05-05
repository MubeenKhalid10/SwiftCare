const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  "";

export interface ResolvedLocation {
  label: string;
  coordinates: [number, number];
  source: "browser" | "ip" | "address" | "manual";
}

export function getMapboxToken() {
  return MAPBOX_TOKEN;
}

async function geocodeAddressWithNominatim(address: string): Promise<ResolvedLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : null;
    const lat = Number(first?.lat);
    const lng = Number(first?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      label: first?.display_name || address,
      coordinates: [lng, lat],
      source: "address",
    };
  } catch {
    return null;
  }
}

async function reverseGeocodeWithMapbox(lat: number, lng: number): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${MAPBOX_TOKEN}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data?.features?.[0]?.place_name || null;
  } catch {
    return null;
  }
}

export async function geocodeAddressWithMapbox(address: string): Promise<ResolvedLocation | null> {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) return null;

  if (!MAPBOX_TOKEN) {
    return geocodeAddressWithNominatim(trimmedAddress);
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmedAddress)}.json?limit=1&types=address,place,locality,neighborhood&access_token=${MAPBOX_TOKEN}`;
    const response = await fetch(url);
    if (!response.ok) {
      return geocodeAddressWithNominatim(trimmedAddress);
    }

    const data = await response.json();
    const feature = data?.features?.[0];
    const coordinates = feature?.center;

    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return geocodeAddressWithNominatim(trimmedAddress);
    }

    return {
      label: feature?.place_name || trimmedAddress,
      coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      source: "address",
    };
  } catch {
    return geocodeAddressWithNominatim(trimmedAddress);
  }
}

export function getBrowserCoordinates(): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

export async function getIpCoordinates(): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch("/api/location", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const lat = Number(data?.lat);
    const lng = Number(data?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

export async function resolveCurrentLocation(): Promise<ResolvedLocation | null> {
  const browserCoords = await getBrowserCoordinates();
  const fallbackCoords = browserCoords || (await getIpCoordinates());

  if (!fallbackCoords) return null;

  const label = (await reverseGeocodeWithMapbox(fallbackCoords.lat, fallbackCoords.lng)) || "Current clinic location";

  return {
    label,
    coordinates: [fallbackCoords.lng, fallbackCoords.lat],
    source: browserCoords ? "browser" : "ip",
  };
}

export function buildMapboxStaticMapUrl(
  coordinates?: [number, number] | null,
  zoom = 14
): string | null {
  if (!coordinates) return null;

  const [lng, lat] = coordinates;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return `/api/mapbox/static?lng=${encodeURIComponent(String(lng))}&lat=${encodeURIComponent(String(lat))}&zoom=${encodeURIComponent(String(zoom))}`;
}

export function buildClinicMapEmbedUrl(
  coordinates?: [number, number] | null,
  label?: string
): string | null {
  if (!coordinates) return null;

  const [lng, lat] = coordinates;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  const params = new URLSearchParams({
    lng: String(lng),
    lat: String(lat),
  });

  if (label?.trim()) {
    params.set('label', label.trim());
  }

  return `/api/mapbox/embed?${params.toString()}`;
}

export function buildExternalMapsUrl(
  coordinates?: [number, number] | null,
  label?: string
): string | null {
  if (coordinates) {
    const [lng, lat] = coordinates;
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
    }
  }

  if (label?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label.trim())}`;
  }

  return null;
}