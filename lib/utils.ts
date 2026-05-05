import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FAVOURITES_KEY_PREFIX = 'swiftcare_favourite_doctors'

function getFavouritesStorageKey(patientId?: string | number) {
  return `${FAVOURITES_KEY_PREFIX}:${patientId || 'guest'}`
}

export function getFavouriteDoctorIds(patientId?: string | number): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(getFavouritesStorageKey(patientId))
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((id) => String(id))
      .filter((id) => id.trim().length > 0)
  } catch {
    return []
  }
}

export function migrateGuestFavouritesToPatient(patientId?: string | number) {
  if (typeof window === 'undefined' || !patientId) return

  const guestIds = getFavouriteDoctorIds('guest')
  if (guestIds.length === 0) return

  const patientIds = getFavouriteDoctorIds(patientId)
  setFavouriteDoctorIds([...patientIds, ...guestIds], patientId)
  window.localStorage.removeItem(getFavouritesStorageKey('guest'))
}

export function setFavouriteDoctorIds(doctorIds: Array<string | number>, patientId?: string | number) {
  if (typeof window === 'undefined') return

  const normalizedIds = Array.from(
    new Set(
      doctorIds
        .map((id) => String(id))
        .filter((id) => id.trim().length > 0)
    )
  )
  window.localStorage.setItem(getFavouritesStorageKey(patientId), JSON.stringify(normalizedIds))
}

export function isDoctorFavourite(doctorId: string | number, patientId?: string | number): boolean {
  return getFavouriteDoctorIds(patientId).includes(String(doctorId))
}

export function toggleFavouriteDoctor(doctorId: string | number, patientId?: string | number): boolean {
  const doctorKey = String(doctorId)
  const current = getFavouriteDoctorIds(patientId)

  const exists = current.includes(doctorKey)
  const next = exists ? current.filter((id) => id !== doctorKey) : [...current, doctorKey]
  setFavouriteDoctorIds(next, patientId)

  return !exists
}

export function getAppointmentDisplayName(appointment: { patientName?: string; bookingFor?: string } | null | undefined): string {
  const explicitName = String(appointment?.patientName || '').trim()
  if (explicitName && explicitName.toLowerCase() !== 'self') return explicitName

  const bookingFor = String(appointment?.bookingFor || '').trim()
  if (!bookingFor || bookingFor.toLowerCase() === 'self') return 'Patient'

  return bookingFor
}
