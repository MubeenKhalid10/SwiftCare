'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { 
  getNotifications, 
  getUnreadCount,
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationIcon,
  getNotificationStyle,
  getAdminNotificationRoute,
  NOTIFICATION_FILTER_OPTIONS,
} from '@/lib/notification.service'
import type { Notification } from '@/lib/types'
import { Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { socket, connectSocket } from '@/lib/socket'
import AdminLayout from '@/components/admin/admin-layout'
import { useRouter } from 'next/navigation'
import { LogoLoader } from '@/components/ui/logo-loader'

export default function AdminNotificationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (!socket.connected) connectSocket()
    
    const onNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    }
    
    socket.on('notification:new', onNewNotification)
    return () => { socket.off('notification:new', onNewNotification) }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications()
    }
  }, [isAuthenticated, user?.id, filter, page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Determine unreadOnly and type filters based on selected filter
      let unreadOnly = false
      let typeFilter = undefined
      
      if (filter === 'unread') {
        unreadOnly = true
      } else if (filter !== 'all') {
        typeFilter = filter
      }
      
      const response = await getNotifications(page, 20, unreadOnly, typeFilter)
      setNotifications(response.items)
      setTotalPages(response.totalPages)
      setTotal(response.total)
      const unread = await getUnreadCount().catch(() => 0)
      setUnreadCount(unread)
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => String(n.id || n._id) === String(notificationId) ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Failed to mark all as read')
    }
  }

  const notificationTypes = NOTIFICATION_FILTER_OPTIONS

  const handleNotificationClick = (notification: Notification) => {
    const notificationId = String(notification.id || notification._id || '')
    if (!notification.read && notificationId) {
      handleMarkAsRead(notificationId)
    }

    const route = getAdminNotificationRoute(notification.type)
    if (route) {
      router.push(route)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated with system activity</p>
          </div>
          <Badge className="bg-primary text-white text-lg px-3 py-1">
            {unreadCount} Unread
          </Badge>
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <select 
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="text-primary border-primary/30 hover:bg-icon-bg"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LogoLoader size={32} className="h-8 w-8" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No notifications yet</p>
            <p className="text-muted-foreground text-sm mt-2">
              {filter === 'all' 
                ? 'Notifications will appear here when there is system activity'
                : `No ${filter.replace(/_/g, ' ')} notifications`
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id || notification._id || `${notification.type}-${notification.createdAt}`}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border rounded-lg transition cursor-pointer hover:shadow-md ${
                  notification.read 
                    ? 'bg-card border-border' 
                    : `${getNotificationStyle(notification.type).bgColor} ${getNotificationStyle(notification.type).borderColor}`
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-1" aria-hidden>
                    {(() => {
                      const Icon = getNotificationIcon(notification.type)
                      return <Icon className="h-5 w-5 text-primary" />
                    })()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-foreground/80 mt-1">
                          {notification.body}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="inline-block w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleString()
                          : 'just now'
                        }
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {notification.type.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        const notificationId = String(notification.id || notification._id || '')
                        if (notificationId) handleMarkAsRead(notificationId)
                      }}
                      className="flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
