'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { socket, connectSocket } from '@/lib/socket'
import type { Notification } from '@/lib/types'

interface NotificationHandlerConfig {
  showToasts?: boolean
  onAppointmentReminder?: (notif: Notification) => void
  onQueueTurnNow?: (notif: Notification) => void
  onQueueApproaching?: (notif: Notification) => void
  onReviewSubmitted?: (notif: Notification) => void
}

/**
 * Hook to handle real-time notifications with toast alerts
 * Automatically subscribes to WebSocket notification events
 */
export function useNotifications(config: NotificationHandlerConfig = {}) {
  const { 
    showToasts = true,
    onAppointmentReminder,
    onQueueTurnNow,
    onQueueApproaching,
    onReviewSubmitted
  } = config

  useEffect(() => {
    // Connect with current access token
    connectSocket()

    // Listen for new notifications
    const onNewNotification = (notification: Notification) => {
      const type = notification.type

      // Show toast if enabled
      if (showToasts) {
        const toastConfig = {
          description: notification.body,
          duration: getToastDuration(type)
        }

        switch (type) {
          case 'appointment_reminder':
            toast.info(notification.title, toastConfig)
            onAppointmentReminder?.(notification)
            break

          case 'queue_turn_now':
            toast.success('🟢 ' + notification.title, {
              ...toastConfig,
              duration: 5000
            })
            onQueueTurnNow?.(notification)
            break

          case 'queue_turn_approaching':
            toast.warning('🟡 ' + notification.title, toastConfig)
            onQueueApproaching?.(notification)
            break

          case 'feedback_moderation':
            toast.info('⭐ ' + notification.title, toastConfig)
            onReviewSubmitted?.(notification)
            break

          case 'appointment_created':
            toast.success(notification.title, toastConfig)
            break

          case 'appointment_cancelled':
            toast.error(notification.title, toastConfig)
            break

          case 'appointment_completed':
            toast.success(notification.title, toastConfig)
            break

          default:
            toast(notification.title, toastConfig)
        }
      }

      // Call appropriate handler
      switch (type) {
        case 'appointment_reminder':
          onAppointmentReminder?.(notification)
          break
        case 'queue_turn_now':
          onQueueTurnNow?.(notification)
          break
        case 'queue_turn_approaching':
          onQueueApproaching?.(notification)
          break
        case 'feedback_moderation':
          onReviewSubmitted?.(notification)
          break
      }
    }

    socket.on('notification:new', onNewNotification)

    return () => {
      socket.off('notification:new', onNewNotification)
    }
  }, [showToasts, onAppointmentReminder, onQueueTurnNow, onQueueApproaching, onReviewSubmitted])
}

/**
 * Get appropriate toast duration based on notification type
 */
function getToastDuration(type: string): number {
  const durations: Record<string, number> = {
    appointment_reminder: 8000,
    queue_turn_now: 10000,
    queue_turn_approaching: 6000,
    feedback_moderation: 7000,
    appointment_created: 5000,
    appointment_cancelled: 6000,
    appointment_completed: 5000
  }
  return durations[type] || 4000
}
