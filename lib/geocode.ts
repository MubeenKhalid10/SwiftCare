/**
 * Frontend Geocoding Utility
 * Converts addresses to latitude/longitude coordinates using Google Maps Geocoding API
 * Mirrors the backend geocode.js functionality for frontend usage
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
 * Geocode an address to coordinates using Google Maps API
 * Note: Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env variable
 * 
 * @param address - The address string to geocode
 * @returns Promise with {lat, lng} or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeoCoordinates | null> {
  try {
    // If no API key available, return null
    // The backend will handle geocoding if needed
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured. Address will be stored as label only.");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.warn(`Geocoding failed for address "${address}":`, data.status);
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Get reverse geocoding (coordinates to address)
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with address string or null if reverse geocoding fails
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured.");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.warn(`Reverse geocoding failed for coordinates ${lat}, ${lng}:`, data.status);
      return null;
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Create location object with address label and coordinates
 * If geocoding fails, returns object with label only
 * 
 * @param address - The address string
 * @returns LocationData object {label, coordinates}
 */
export async function createLocationData(address: string): Promise<LocationData> {
  const coordinates = await geocodeAddress(address);
  
  if (coordinates) {
    // GeoJSON format: [longitude, latitude]
    return {
      label: address,
      coordinates: [coordinates.lng, coordinates.lat],
    };
  } else {
    // Return with null coordinates if geocoding fails
    // Backend can geocode later if needed
    return {
      label: address,
      coordinates: [0, 0], // Default fallback
    };
  }
}

/**
 * Calculate distance between two coordinates (in kilometers)
 * Uses Haversine formula
 * 
 * @param lat1 - First latitude
 * @param lng1 - First longitude
 * @param lat2 - Second latitude
 * @param lng2 - Second longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
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

/**
 * Validate if coordinates are within reasonable ranges
 * 
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @returns true if valid, false otherwise
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
