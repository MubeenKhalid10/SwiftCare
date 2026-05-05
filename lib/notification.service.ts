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
    appointment_updated: '📝',
    appointment_cancelled: '❌',
    appointment_completed: '✅',
    appointment_reminder: '🔔',
    queue_turn_now: '🟢',
    queue_turn_approaching: '🟡',
    feedback_moderation: '⭐',
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
    appointment_reminder: { bgColor: 'bg-blue-50', textColor: 'text-blue-900', borderColor: 'border-blue-200' },
    queue_turn_now: { bgColor: 'bg-green-50', textColor: 'text-green-900', borderColor: 'border-green-200' },
    queue_turn_approaching: { bgColor: 'bg-yellow-50', textColor: 'text-yellow-900', borderColor: 'border-yellow-200' },
    feedback_moderation: { bgColor: 'bg-purple-50', textColor: 'text-purple-900', borderColor: 'border-purple-200' },
    appointment_completed: { bgColor: 'bg-emerald-50', textColor: 'text-emerald-900', borderColor: 'border-emerald-200' },
    appointment_cancelled: { bgColor: 'bg-red-50', textColor: 'text-red-900', borderColor: 'border-red-200' }
  }
  return styles[type] || { bgColor: 'bg-gray-50', textColor: 'text-gray-900', borderColor: 'border-gray-200' }
}
