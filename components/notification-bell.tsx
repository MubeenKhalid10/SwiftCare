'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getUnreadCount } from '@/lib/notification.service'
import { socket, connectSocket } from '@/lib/socket'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUnreadCount()
    
    // Set up socket listener for new notifications
    if (!socket.connected) connectSocket()
    
    const onNewNotification = () => {
      setUnreadCount(prev => prev + 1)
    }
    
    const onNotificationRead = () => {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    
    socket.on('notification:new', onNewNotification)
    socket.on('notification:read', onNotificationRead)
    
    return () => {
      socket.off('notification:new', onNewNotification)
      socket.off('notification:read', onNotificationRead)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true)
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href="/notifications" className="relative">
      <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <Badge className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    </Link>
  )
}
