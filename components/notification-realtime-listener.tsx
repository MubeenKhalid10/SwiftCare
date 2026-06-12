'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import { connectSocket, disconnectSocket } from '@/lib/socket'

export function NotificationRealtimeListener() {
  const { isAuthenticated, user } = useAuth()

  useNotifications({
    showToasts: isAuthenticated,
  })

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnectSocket()
      return
    }

    connectSocket()

    return () => {
      // Keep cleanup explicit to avoid stale unauthorized sockets after logout.
      disconnectSocket()
    }
  }, [isAuthenticated, user?.id])

  return null
}
