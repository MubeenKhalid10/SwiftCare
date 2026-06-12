/**
 * Notification Service
 * Handles all notification-related API calls and real-time updates
 */

import type { Notification } from './types'
import { getAccessToken } from './auth.service'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

interface NotificationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
  items: Notification[]
}

export type NotificationFilterOption = {
  value: string
  label: string
}

export const NOTIFICATION_FILTER_OPTIONS: NotificationFilterOption[] = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread' },
  { value: 'appointment_created', label: 'Appointments Created' },
  { value: 'appointment_status_changed', label: 'Appointment Status Changes' },
  { value: 'appointment_reminder', label: 'Appointment Reminders' },
  { value: 'queue_turn_now', label: 'Queue Turn Now' },
  { value: 'queue_turn_approaching', label: 'Queue Turn Approaching' },
  { value: 'queue_progress', label: 'Queue Progress' },
  { value: 'feedback_moderation', label: 'Feedback Moderation' },
  { value: 'feedback_response', label: 'Feedback Responses' },
  { value: 'new_doctor', label: 'New Doctor Signups' },
  { value: 'new_patient', label: 'New Patient Signups' },
  { value: 'shift_late', label: 'Shift Late Alerts' },
  { value: 'system_test', label: 'System Tests' },
  { value: 'system', label: 'System' },
]

/**
 * Fetch all notifications for the current user
 * @param page - Page number (1-indexed)
 * @param limit - Items per page (1-100)
 * @param unreadOnly - Filter to unread only
 * @param type - Filter by notification type
 */
export async function getNotifications(
  page = 1,
  limit = 20,
  unreadOnly?: boolean,
  type?: string
): Promise<NotificationResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(Math.max(limit, 1), 100))
  })

  if (unreadOnly !== undefined) {
    params.append('unreadOnly', String(unreadOnly))
  }
  if (type) {
    params.append('type', type)
  }

  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
    method: 'GET',
    headers,
    credentials: 'include'
  })

  if (!response.ok) throw new Error('Failed to fetch notifications')
  return response.json()
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(): Promise<number> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers,
    credentials: 'include'
  })

  if (!response.ok) throw new Error('Failed to fetch unread count')
  const data = await response.json()
  return data.unreadCount || 0
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers,
    credentials: 'include'
  })

  if (!response.ok) throw new Error('Failed to mark notification as read')
  return response.json()
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers,
    credentials: 'include'
  })

  if (!response.ok) throw new Error('Failed to mark all notifications as read')
  return response.json()
}

/**
 * Register device token for push notifications
 */
export async function registerDeviceToken(
  token: string,
  platform: 'web' | 'ios' | 'android'
): Promise<any> {
  const accessToken = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}/notifications/devices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ token, platform }),
    credentials: 'include'
  })

  if (!response.ok) throw new Error('Failed to register device token')
  return response.json()
}

/**
 * Get notification message based on type
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    appointment_created: '📅',
    appointment_status_changed: '📝',
    appointment_cancelled: '❌',
    appointment_completed: '✅',
    appointment_reminder: '🔔',
    queue_turn_now: '🟢',
    queue_turn_approaching: '🟡',
    queue_progress: '📊',
    feedback_moderation: '⭐',
    feedback_response: '💬',
    new_doctor: '🩺',
    new_patient: '🧑',
    shift_late: '⏰',
    system_test: '🧪',
    system: 'ℹ️'
  }
  return icons[type] || '📢'
}

/**
 * Get notification style based on type
 */
export function getNotificationStyle(type: string): {
  bgColor: string
  textColor: string
  borderColor: string
} {
  const styles: Record<string, any> = {
    appointment_created: { bgColor: 'bg-cyan-50', textColor: 'text-cyan-900', borderColor: 'border-cyan-200' },
    appointment_status_changed: { bgColor: 'bg-indigo-50', textColor: 'text-indigo-900', borderColor: 'border-indigo-200' },
    appointment_reminder: { bgColor: 'bg-blue-50', textColor: 'text-blue-900', borderColor: 'border-blue-200' },
    queue_turn_now: { bgColor: 'bg-green-50', textColor: 'text-green-900', borderColor: 'border-green-200' },
    queue_turn_approaching: { bgColor: 'bg-yellow-50', textColor: 'text-yellow-900', borderColor: 'border-yellow-200' },
    queue_progress: { bgColor: 'bg-sky-50', textColor: 'text-sky-900', borderColor: 'border-sky-200' },
    feedback_moderation: { bgColor: 'bg-purple-50', textColor: 'text-purple-900', borderColor: 'border-purple-200' },
    feedback_response: { bgColor: 'bg-fuchsia-50', textColor: 'text-fuchsia-900', borderColor: 'border-fuchsia-200' },
    new_doctor: { bgColor: 'bg-violet-50', textColor: 'text-violet-900', borderColor: 'border-violet-200' },
    new_patient: { bgColor: 'bg-emerald-50', textColor: 'text-emerald-900', borderColor: 'border-emerald-200' },
    shift_late: { bgColor: 'bg-amber-50', textColor: 'text-amber-900', borderColor: 'border-amber-200' },
    system_test: { bgColor: 'bg-slate-50', textColor: 'text-slate-900', borderColor: 'border-slate-200' },
    appointment_completed: { bgColor: 'bg-emerald-50', textColor: 'text-emerald-900', borderColor: 'border-emerald-200' },
    appointment_cancelled: { bgColor: 'bg-red-50', textColor: 'text-red-900', borderColor: 'border-red-200' }
  }
  return styles[type] || { bgColor: 'bg-gray-50', textColor: 'text-gray-900', borderColor: 'border-gray-200' }
}

export function getNotificationRoute(type: string): string | null {
  switch (type) {
    case 'feedback_moderation':
      return '/notifications'
    case 'feedback_response':
      return '/notifications'
    case 'appointment_created':
    case 'appointment_status_changed':
    case 'appointment_reminder':
    case 'queue_turn_now':
    case 'queue_turn_approaching':
      return '/patient/appointments'
    case 'queue_progress':
    case 'shift_late':
      return '/doctor/dashboard'
    case 'new_doctor':
    case 'new_patient':
      return '/notifications'
    default:
      return null
  }
}

export function getAdminNotificationRoute(type: string): string | null {
  switch (type) {
    case 'feedback_moderation':
      return '/admin/reviews'
    case 'appointment_created':
    case 'appointment_status_changed':
      return '/admin/appointments'
    case 'new_doctor':
      return '/admin/verification'
    case 'new_patient':
      return '/admin/patients'
    default:
      return '/admin/notifications'
  }
}
