import { buildApiUrl, API_ENDPOINTS } from './api-config';

export interface ResolvedLocation {
  label: string;
  coordinates: [number, number];
  source: "browser" | "ip" | "address" | "manual";
}

async function reverseGeocodeWithMapbox(lat: number, lng: number): Promise<string | null> {
  try {
    const url = buildApiUrl(`${API_ENDPOINTS.MAPBOX.REVERSE_GEOCODE}?lat=${lat}&lng=${lng}`);
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data?.label || null;
  } catch {
    return null;
  }
}

export async function geocodeAddressWithMapbox(address: string): Promise<ResolvedLocation | null> {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) return null;

  try {
    const url = buildApiUrl(`${API_ENDPOINTS.MAPBOX.GEOCODE}?address=${encodeURIComponent(trimmedAddress)}`);
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data || null;
  } catch {
    return null;
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
    const response = await fetch(buildApiUrl(API_ENDPOINTS.LOCATION), {
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

  return buildApiUrl(`${API_ENDPOINTS.MAPBOX.STATIC}?lng=${encodeURIComponent(String(lng))}&lat=${encodeURIComponent(String(lat))}&zoom=${encodeURIComponent(String(zoom))}`);
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

  return buildApiUrl(`${API_ENDPOINTS.MAPBOX.EMBED}?${params.toString()}`);
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
