/**
 * Appointment Socket Event Handlers
 * Listens for real-time appointment updates and triggers notifications
 */

import { socket } from './socket'
import type { Appointment, Notification } from './types'
import { notificationHandler } from './notification-handler'

interface AppointmentSocketConfig {
  onAppointmentConfirmed?: (appointment: Appointment) => void
  onAppointmentCancelled?: (appointment: Appointment) => void
  onAppointmentCompleted?: (appointment: Appointment) => void
  onQueueUpdated?: (data: { shiftId: string; currentServing: number }) => void
  onDoctorCheckIn?: (data: { doctorId: string; doctorName: string }) => void
  onDoctorCheckOut?: (data: { doctorId: string; doctorName: string }) => void
}

/**
 * Initialize appointment socket event listeners
 */
export function initializeAppointmentSocketEvents(config: AppointmentSocketConfig): () => void {
  if (!socket) return () => {}

  // Listen for appointment confirmations
  if (config.onAppointmentConfirmed) {
    socket.on('appointment:confirmed', (appointment: Appointment) => {
      console.log('[v0] Appointment confirmed via socket:', appointment)
      config.onAppointmentConfirmed?.(appointment)
    })
  }

  // Listen for appointment cancellations
  if (config.onAppointmentCancelled) {
    socket.on('appointment:cancelled', (appointment: Appointment) => {
      console.log('[v0] Appointment cancelled via socket:', appointment)
      config.onAppointmentCancelled?.(appointment)
    })
  }

  // Listen for appointment completions
  if (config.onAppointmentCompleted) {
    socket.on('appointment:completed', (appointment: Appointment) => {
      console.log('[v0] Appointment completed via socket:', appointment)
      config.onAppointmentCompleted?.(appointment)
    })
  }

  // Listen for queue updates
  if (config.onQueueUpdated) {
    socket.on('queueUpdated', (data: { shiftId: string; currentServing: number }) => {
      console.log('[v0] Queue updated via socket:', data)
      config.onQueueUpdated?.(data)
    })
  }

  // Listen for doctor check-ins
  if (config.onDoctorCheckIn) {
    socket.on('doctor:checked-in', (data: { doctorId: string; doctorName: string }) => {
      console.log('[v0] Doctor checked in via socket:', data)
      config.onDoctorCheckIn?.(data)
    })
  }

  // Listen for doctor check-outs
  if (config.onDoctorCheckOut) {
    socket.on('doctor:checked-out', (data: { doctorId: string; doctorName: string }) => {
      console.log('[v0] Doctor checked out via socket:', data)
      config.onDoctorCheckOut?.(data)
    })
  }

  // Return cleanup function
  return () => {
    if (socket) {
      socket.off('appointment:confirmed')
      socket.off('appointment:cancelled')
      socket.off('appointment:completed')
      socket.off('queueUpdated')
      socket.off('doctor:checked-in')
      socket.off('doctor:checked-out')
    }
  }
}

/**
 * Join a queue room for real-time queue updates
 */
export function joinQueueRoom(shiftId: string): void {
  if (socket) {
    socket.emit('joinQueueRoom', shiftId)
    console.log('[v0] Joined queue room:', shiftId)
  }
}

/**
 * Leave a queue room
 */
export function leaveQueueRoom(shiftId: string): void {
  if (socket) {
    socket.emit('leaveQueueRoom', shiftId)
    console.log('[v0] Left queue room:', shiftId)
  }
}

/**
 * Join user-specific room for personal notifications
 */
export function joinUserRoom(userId: string): void {
  if (socket) {
    socket.emit('joinUserRoom', userId)
    console.log('[v0] Joined user room:', userId)
  }
}

/**
 * Leave user-specific room
 */
export function leaveUserRoom(userId: string): void {
  if (socket) {
    socket.emit('leaveUserRoom', userId)
    console.log('[v0] Left user room:', userId)
  }
}
