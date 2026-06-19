import type { SyntheticEvent } from 'react'
import { getApiBaseUrl } from './api-config'

export const FALLBACK_IMAGES = {
  doctor: '/assets/doctor.jpg',
  patientMale: '/assets/male.jpg',
  patientFemale: '/assets/female.jpg',
  hospital: '/assets/hospital.jpg',
} as const

function normalizeImageUrl(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  if (trimmed.startsWith('http') || trimmed.startsWith('data:')) {
    return trimmed
  }

  if (trimmed.startsWith('/assets/')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return `${getApiBaseUrl()}${trimmed}`
  }

  return `${getApiBaseUrl()}/${trimmed.replace(/^\/+/, '')}`
}

export function isFemaleGender(gender?: string | null): boolean {
  const value = String(gender || '').trim().toLowerCase()
  return value === 'female' || value === 'f' || value === 'woman'
}

export function getPatientFallbackImage(gender?: string | null): string {
  return isFemaleGender(gender) ? FALLBACK_IMAGES.patientFemale : FALLBACK_IMAGES.patientMale
}

export function resolveDoctorImage(image?: string | null, avatar?: string | null): string {
  return normalizeImageUrl(image || avatar) || FALLBACK_IMAGES.doctor
}

export function resolvePatientImage(
  image?: string | null,
  gender?: string | null,
  avatar?: string | null
): string {
  return normalizeImageUrl(image || avatar) || getPatientFallbackImage(gender)
}

export function resolveFacilityImage(image?: string | null): string {
  return normalizeImageUrl(image) || FALLBACK_IMAGES.hospital
}

export function onDoctorImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = FALLBACK_IMAGES.doctor
}

export function onPatientImageError(
  event: SyntheticEvent<HTMLImageElement>,
  gender?: string | null
) {
  event.currentTarget.src = getPatientFallbackImage(gender)
}

export function onFacilityImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = FALLBACK_IMAGES.hospital
}
