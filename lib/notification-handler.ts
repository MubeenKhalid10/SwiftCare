/**
 * Notification Handler Service
 * Manages appointment reminders, queue updates, and doctor status notifications
 */

import { socket } from './socket'
import type { Appointment, Notification } from './types'
import { calculatePositionsAhead } from './dynamic-queue'

interface QueueReminderTracker {
  appointmentId: string
  shiftId: string
  queueNumber: number
  remindersSent: {
    fiveAway: boolean
    twoAway: boolean
    now: boolean
  }
}

interface DoctorStatusTracker {
  doctorId: string
  lastStatus: 'online' | 'offline' | 'in-consultation' | null
}

class NotificationHandler {
  private queueReminderTrackers: Map<string, QueueReminderTracker> = new Map()
  private doctorStatusTrackers: Map<string, DoctorStatusTracker> = new Map()
  private appointmentReminderTimers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Calculate how many positions away the patient is in queue
   * @param queueStates Map of current queue positions
   * @param shiftId Shift being tracked
   * @param userQueueNumber Patient's queue number
   * @returns Number of patients ahead
   */
  private calculatePositionsAway(
    queueStates: Record<string, number>,
    shiftId: string,
    userQueueNumber: number
  ): number {
    const currentServing = queueStates[shiftId] || 0
    return calculatePositionsAhead(userQueueNumber, currentServing)
  }

  /**
   * Check appointment queue and send reminders at key intervals
   */
  checkQueueReminder(
    appointment: Appointment,
    queueStates: Record<string, number>,
    onReminder: (reminder: Notification) => void
  ): void {
    if (!appointment.queueNumber || !appointment.shiftId) return

    const trackerId = appointment.id || appointment._id
    if (!trackerId) return

    const tracker = this.queueReminderTrackers.get(trackerId) || {
      appointmentId: trackerId,
      shiftId: appointment.shiftId,
      queueNumber: appointment.queueNumber,
      remindersSent: { fiveAway: false, twoAway: false, now: false }
    }

    const positionsAway = this.calculatePositionsAway(queueStates, appointment.shiftId, appointment.queueNumber)
    const estimatedWaitMinutes = positionsAway * 10

    // 5+ patients away - initial notification
    if (positionsAway >= 5 && !tracker.remindersSent.fiveAway) {
      tracker.remindersSent.fiveAway = true
      onReminder({
        id: `${trackerId}-5away`,
        userId: '',
        role: 'patient',
        type: 'queue_turn_approaching',
        title: 'Queue Update',
        body: `You're ${positionsAway} patients away. Estimated wait is about ${estimatedWaitMinutes} minutes.`,
        data: {
          appointmentId: trackerId,
          positionsAway,
          estimatedWaitMinutes,
          doctorName: appointment.doctorName
        },
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    // 2 or fewer patients away - urgent reminder
    if (positionsAway <= 2 && !tracker.remindersSent.twoAway && positionsAway > 0) {
      tracker.remindersSent.twoAway = true
      onReminder({
        id: `${trackerId}-2away`,
        userId: '',
        role: 'patient',
        type: 'queue_turn_approaching',
        title: '🟡 Almost Your Turn!',
        body: `Only ${positionsAway} patient${positionsAway > 1 ? 's' : ''} ahead of you. About ${estimatedWaitMinutes} minutes to go.`,
        data: {
          appointmentId: trackerId,
          positionsAway,
          estimatedWaitMinutes,
          doctorName: appointment.doctorName
        },
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    // Your turn now
    if (positionsAway === 0 && !tracker.remindersSent.now) {
      tracker.remindersSent.now = true
      onReminder({
        id: `${trackerId}-now`,
        userId: '',
        role: 'patient',
        type: 'queue_turn_now',
        title: '🟢 Your Turn Now!',
        body: `It's your turn! Dr. ${appointment.doctorName} is ready for you.`,
        data: {
          appointmentId: trackerId,
          estimatedWaitMinutes: 0,
          doctorName: appointment.doctorName
        },
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    this.queueReminderTrackers.set(trackerId, tracker)
  }

  /**
   * Schedule appointment reminder notification
   * Sends reminder 15 minutes before appointment time
   */
  scheduleAppointmentReminder(
    appointment: Appointment,
    onReminder: (reminder: Notification) => void
  ): void {
    if (!appointment.id && !appointment._id) return
    if (!appointment.time) return

    const appointmentId = appointment.id || appointment._id
    const reminderId = `${appointmentId}-reminder`

    // Clear existing timer if any
    if (this.appointmentReminderTimers.has(reminderId)) {
      clearTimeout(this.appointmentReminderTimers.get(reminderId)!)
    }

    // Parse appointment time and calculate reminder time (15 minutes before)
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`)
    const reminderTime = new Date(appointmentDate.getTime() - 15 * 60 * 1000)
    const now = new Date()

    if (reminderTime > now) {
      const delayMs = reminderTime.getTime() - now.getTime()

      const timerId = setTimeout(() => {
        onReminder({
          id: reminderId,
          userId: '',
          role: 'patient',
          type: 'appointment_reminder',
          title: '📅 Appointment Reminder',
          body: `Your appointment with Dr. ${appointment.doctorName} is in 15 minutes!`,
          data: {
            appointmentId,
            doctorName: appointment.doctorName,
            time: appointment.time
          },
          read: false,
          createdAt: new Date().toISOString()
        })

        this.appointmentReminderTimers.delete(reminderId)
      }, delayMs)

      this.appointmentReminderTimers.set(reminderId, timerId)
    }
  }

  /**
   * Handle doctor check-in notification
   */
  handleDoctorCheckIn(
    doctorId: string,
    doctorName: string,
    onNotification: (notif: Notification) => void
  ): void {
    const tracker = this.doctorStatusTrackers.get(doctorId) || {
      doctorId,
      lastStatus: null
    }

    if (tracker.lastStatus !== 'online') {
      onNotification({
        id: `${doctorId}-checkin`,
        userId: '',
        role: 'patient',
        type: 'appointment_created',
        title: '✅ Doctor Checked In',
        body: `Dr. ${doctorName} has checked in and is now available.`,
        data: {
          doctorId,
          doctorName,
          status: 'checked-in'
        },
        read: false,
        createdAt: new Date().toISOString()
      })

      tracker.lastStatus = 'online'
    }

    this.doctorStatusTrackers.set(doctorId, tracker)
  }

  /**
   * Handle doctor check-out notification
   */
  handleDoctorCheckOut(
    doctorId: string,
    doctorName: string,
    onNotification: (notif: Notification) => void
  ): void {
    const tracker = this.doctorStatusTrackers.get(doctorId) || {
      doctorId,
      lastStatus: null
    }

    if (tracker.lastStatus !== 'offline') {
      onNotification({
        id: `${doctorId}-checkout`,
        userId: '',
        role: 'patient',
        type: 'appointment_cancelled',
        title: '🔴 Doctor Checked Out',
        body: `Dr. ${doctorName} has finished their shift and is no longer available.`,
        data: {
          doctorId,
          doctorName,
          status: 'checked-out'
        },
        read: false,
        createdAt: new Date().toISOString()
      })

      tracker.lastStatus = 'offline'
    }

    this.doctorStatusTrackers.set(doctorId, tracker)
  }

  /**
   * Handle appointment confirmation notification
   */
  handleAppointmentConfirmation(
    appointment: Appointment,
    onNotification: (notif: Notification) => void
  ): void {
    onNotification({
      id: `${appointment.id || appointment._id}-confirmed`,
      userId: '',
      role: 'patient',
      type: 'appointment_created',
      title: '✅ Appointment Confirmed',
      body: `Your appointment with Dr. ${appointment.doctorName} has been confirmed for ${appointment.date} at ${appointment.time}`,
      data: {
        appointmentId: appointment.id || appointment._id,
        doctorName: appointment.doctorName,
        date: appointment.date,
        time: appointment.time
      },
      read: false,
      createdAt: new Date().toISOString()
    })
  }

  /**
   * Clear all timers (call on page unmount or logout)
   */
  clearAllTimers(): void {
    this.appointmentReminderTimers.forEach(timerId => clearTimeout(timerId))
    this.appointmentReminderTimers.clear()
    this.queueReminderTrackers.clear()
    this.doctorStatusTrackers.clear()
  }

  /**
   * Reset queue reminders for fresh tracking
   */
  resetQueueReminders(): void {
    this.queueReminderTrackers.forEach(tracker => {
      tracker.remindersSent = { fiveAway: false, twoAway: false, now: false }
    })
  }
}

export const notificationHandler = new NotificationHandler()
