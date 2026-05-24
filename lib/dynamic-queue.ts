/**
 * Dynamic Queue Number Utility
 * Converts static slot-based queue numbers to dynamic queue numbers
 * based on actual number of patients in queue, assigned in ascending order
 */

import type { Appointment } from './types'

/**
 * Recalculate queue numbers dynamically for a shift
 * Assigns queue numbers sequentially (1, 2, 3...) based on appointment booking order
 * regardless of the original slot-based queue number
 * 
 * @param appointments - All appointments for a shift
 * @returns Appointments with dynamically assigned queue numbers
 */
export function assignDynamicQueueNumbers(appointments: Appointment[]): Appointment[] {
  if (!Array.isArray(appointments) || appointments.length === 0) {
    return appointments
  }

  // Sort by creation time (createdAt) or fallback to date/time
  const sortedByBookingOrder = [...appointments].sort((a, b) => {
    // Primary: sort by createdAt (booking order)
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
    
    if (aCreated !== bCreated) {
      return aCreated - bCreated
    }

    // Fallback: sort by date and time
    const aDateTime = new Date(`${a.date || ''} ${a.time || ''}`).getTime()
    const bDateTime = new Date(`${b.date || ''} ${b.time || ''}`).getTime()
    
    if (!Number.isNaN(aDateTime) && !Number.isNaN(bDateTime) && aDateTime !== bDateTime) {
      return aDateTime - bDateTime
    }

    // Final fallback: sort by appointment ID
    return String(a._id || a.id || '').localeCompare(String(b._id || b.id || ''))
  })

  // Assign sequential queue numbers (1, 2, 3, ...)
  return sortedByBookingOrder.map((apt, index) => ({
    ...apt,
    queueNumber: index + 1 // Queue numbers start at 1
  }))
}

/**
 * Get all non-cancelled appointments in queue order for a shift
 * with dynamically assigned queue numbers
 * 
 * @param appointments - All appointments for a shift
 * @returns Active queue appointments with dynamic queue numbers
 */
export function getOrderedQueueAppointments(appointments: Appointment[]): Appointment[] {
  // Filter out cancelled appointments
  const activeAppointments = appointments.filter(apt => {
    const status = String(apt.status || '').trim().toLowerCase()
    return status !== 'cancelled'
  })

  // Assign dynamic queue numbers
  return assignDynamicQueueNumbers(activeAppointments)
}

/**
 * Find patient's queue position with dynamic numbering
 * 
 * @param appointmentId - Patient's appointment ID
 * @param appointments - All appointments for the shift
 * @returns Queue number (1-based) or null if not found
 */
export function getPatientQueuePosition(appointmentId: string | undefined, appointments: Appointment[]): number | null {
  if (!appointmentId) return null

  const orderedQueue = getOrderedQueueAppointments(appointments)
  const index = orderedQueue.findIndex(apt => {
    const aptId = String(apt._id || apt.id || '')
    return aptId === String(appointmentId)
  })

  return index >= 0 ? index + 1 : null
}

/**
 * Calculate positions ahead for a patient given dynamic queue numbering
 * 
 * @param patientQueueNumber - Patient's dynamic queue number
 * @param currentServing - Currently serving queue number
 * @returns Number of patients ahead (0 if it's patient's turn or before)
 */
export function calculatePositionsAhead(patientQueueNumber: number | null, currentServing: number): number {
  if (patientQueueNumber === null || patientQueueNumber <= 0) {
    return 0
  }

  if (currentServing <= 0) {
    // Doctor hasn't started, patient is first - 1
    return patientQueueNumber - 1
  }

  // Number of patients ahead = patient's queue number - currently serving number - 1
  return Math.max(0, patientQueueNumber - currentServing - 1)
}
