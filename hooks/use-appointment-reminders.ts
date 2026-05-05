'use client'

import { useEffect, useCallback, useRef } from 'react'
import { notificationHandler } from '@/lib/notification-handler'
import { socket } from '@/lib/socket'
import type { Appointment, Notification } from '@/lib/types'

interface UseAppointmentRemindersConfig {
  appointments?: Appointment[]
  queueStates?: Record<string, number>
  onReminder?: (notification: Notification) => void
  enabled?: boolean
}

/**
 * Hook to manage appointment reminders and queue notifications
 * Handles:
 * - Queue position reminders (5 away, 2 away, your turn)
 * - Appointment time reminders (15 minutes before)
 * - Doctor check-in/out notifications
 */
export function useAppointmentReminders({
  appointments = [],
  queueStates = {},
  onReminder,
  enabled = true
}: UseAppointmentRemindersConfig = {}) {
  
  const onReminderRef = useRef(onReminder)
  
  useEffect(() => {
    onReminderRef.current = onReminder
  }, [onReminder])

  // Check queue positions for reminders
  useEffect(() => {
    if (!enabled || !appointments.length) return

    appointments.forEach(appointment => {
      notificationHandler.checkQueueReminder(
        appointment,
        queueStates,
        (reminder) => {
          onReminderRef.current?.(reminder)
        }
      )
    })
  }, [appointments, queueStates, enabled])

  // Schedule appointment time reminders
  useEffect(() => {
    if (!enabled || !appointments.length) return

    appointments.forEach(appointment => {
      const normalizedStatus = String(appointment.status || '').trim().toLowerCase()

      // Only schedule reminders for upcoming appointments
      if (normalizedStatus === 'pending' || normalizedStatus === 'confirmed') {
        notificationHandler.scheduleAppointmentReminder(
          appointment,
          (reminder) => {
            onReminderRef.current?.(reminder)
          }
        )
      }
    })

    return () => {
      // Clean up timers on unmount
      notificationHandler.clearAllTimers()
    }
  }, [appointments, enabled])

  // Reset queue reminders when queue updates
  useEffect(() => {
    if (enabled) {
      notificationHandler.resetQueueReminders()
    }
  }, [queueStates, enabled])

  const confirmAppointment = useCallback((appointment: Appointment) => {
    if (enabled) {
      notificationHandler.handleAppointmentConfirmation(
        appointment,
        (notification) => {
          onReminderRef.current?.(notification)
        }
      )
    }
  }, [enabled])

  return {
    confirmAppointment,
    clearReminders: () => notificationHandler.clearAllTimers()
  }
}
