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

export interface AppointmentStatusSyncEntry {
  status: string
  updatedAt: number
  shiftId?: string
  queueNumber?: number
}

const APPOINTMENT_STATUS_SYNC_STORAGE_KEY = 'swiftcare_appointment_status_sync'
const APPOINTMENT_STATUS_SYNC_EVENT_NAME = 'swiftcare:appointment-status-sync'

export function readAppointmentStatusSync(): Record<string, AppointmentStatusSyncEntry> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(APPOINTMENT_STATUS_SYNC_STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    return parsed as Record<string, AppointmentStatusSyncEntry>
  } catch {
    return {}
  }
}

export function applyAppointmentStatusSync<T extends { id?: string | number; _id?: string | number; status?: string }>(appointments: T[]): T[] {
  const snapshot = readAppointmentStatusSync()

  return appointments.map((appointment) => {
    const appointmentId = String(appointment.id || appointment._id || '')
    const override = snapshot[appointmentId]

    if (!override) return appointment

    return {
      ...appointment,
      status: override.status,
    }
  })
}

export function upsertAppointmentStatusSync(appointmentId: string, entry: Omit<AppointmentStatusSyncEntry, 'updatedAt'> & { updatedAt?: number }): void {
  if (typeof window === 'undefined' || !appointmentId) return

  try {
    const snapshot = readAppointmentStatusSync()
    snapshot[appointmentId] = {
      ...entry,
      updatedAt: entry.updatedAt ?? Date.now(),
    }

    window.localStorage.setItem(APPOINTMENT_STATUS_SYNC_STORAGE_KEY, JSON.stringify(snapshot))
    window.dispatchEvent(
      new CustomEvent(APPOINTMENT_STATUS_SYNC_EVENT_NAME, {
        detail: {
          appointmentId,
          ...snapshot[appointmentId],
        },
      })
    )
  } catch {
    // Ignore storage failures so appointment actions can still continue.
  }
}

export function getAppointmentStatusSyncEventName(): string {
  return APPOINTMENT_STATUS_SYNC_EVENT_NAME
}
