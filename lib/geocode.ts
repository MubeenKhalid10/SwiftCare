import { buildApiUrl, API_ENDPOINTS } from '@/lib/api-config';

/**
 * Frontend Geocoding Utility
 * Converts addresses to latitude/longitude coordinates using backend geocoding APIs
 */

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  label: string;
  coordinates: [number, number]; // [longitude, latitude] for GeoJSON compatibility
}

/**
 * Geocode an address to coordinates using backend geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeoCoordinates | null> {
  try {
    const url = buildApiUrl(`${API_ENDPOINTS.MAPBOX.GEOCODE}?address=${encodeURIComponent(address)}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Geocoding failed for address "${address}": status ${response.status}`);
      return null;
    }
    const data = await response.json();

    if (data && Array.isArray(data.coordinates) && data.coordinates.length >= 2) {
      return {
        lat: data.coordinates[1],
        lng: data.coordinates[0],
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Get reverse geocoding (coordinates to address)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = buildApiUrl(`${API_ENDPOINTS.MAPBOX.REVERSE_GEOCODE}?lat=${lat}&lng=${lng}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Reverse geocoding failed for coordinates ${lat}, ${lng}: status ${response.status}`);
      return null;
    }
    const data = await response.json();

    return data?.label || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Create location object with address label and coordinates
 */
export async function createLocationData(address: string): Promise<LocationData> {
  const coordinates = await geocodeAddress(address);
  
  if (coordinates) {
    return {
      label: address,
      coordinates: [coordinates.lng, coordinates.lat],
    };
  }

  return {
    label: address,
    coordinates: [0, 0],
  };
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
