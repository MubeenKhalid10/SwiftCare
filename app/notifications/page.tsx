'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/use-require-auth'
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationIcon,
  getNotificationStyle,
  getNotificationRoute,
} from '@/lib/notification.service'
import type { Notification } from '@/lib/types'
import { Bell, Check } from 'lucide-react'
import { toast } from 'sonner'
import { socket, connectSocket } from '@/lib/socket'
import { LogoLoader } from '@/components/ui/logo-loader'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

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
    if (authLoading || !user?.id) return
    fetchNotifications()
  }, [authLoading, user?.id, page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await getNotifications(page, 20)
      setNotifications(response.items)
      setTotalPages(response.totalPages)
      setTotal(response.total)
      const unread = await getUnreadCount().catch(() => 0)
      setUnreadCount(unread)
    } catch {
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
    } catch {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    const notificationId = String(notification.id || notification._id || '')
    if (!notification.read && notificationId) {
      await handleMarkAsRead(notificationId)
    }

    const route = getNotificationRoute(notification.type)
    if (route) {
      router.push(route)
    }
  }

  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-muted flex items-center justify-center">
          <LogoLoader size={32} />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted">
        <div className="p-6 max-w-5xl mx-auto w-full">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span>{user?.role === 'doctor' ? 'Doctor' : 'Patient'}</span>
                  <span>&gt;</span>
                  <span>Notifications</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-base px-3 py-1">
                        {unreadCount} unread
                      </Badge>
                    )}
                    {unreadCount > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary/30 hover:bg-icon-bg"
                        onClick={handleMarkAllAsRead}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark All as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Card>
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <LogoLoader size={32} className="h-8 w-8" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">No notifications yet</p>
                      <p className="text-sm text-muted-foreground">
                        You&apos;re all caught up! We&apos;ll notify you when something important happens.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => {
                        const style = getNotificationStyle(notification.type)
                        const Icon = getNotificationIcon(notification.type)
                        const isRecent = notification.createdAt ?
                          (new Date().getTime() - new Date(notification.createdAt).getTime()) < 60000 : false

                        return (
                          <div
                            key={notification.id || notification._id || `${notification.type}-${notification.createdAt}`}
                            className={`p-4 border rounded-lg transition-colors cursor-pointer hover:shadow-sm ${
                              notification.read ? 'bg-card' : style.bgColor + ' border-2 border-current'
                            } ${style.borderColor}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 pt-1">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1">
                                    <h3 className={`font-semibold ${notification.read ? 'text-foreground/80' : style.textColor}`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.read && (
                                      <span className="inline-block w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                                    )}
                                    {isRecent && (
                                      <Badge className="bg-red-500 text-white text-xs ml-auto">NEW</Badge>
                                    )}
                                  </div>
                                </div>

                                <p className={`text-sm mb-2 ${notification.read ? 'text-muted-foreground' : style.textColor}`}>
                                  {notification.body}
                                </p>

                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {notification.createdAt ?
                                      new Date(notification.createdAt).toLocaleString() : 'just now'
                                    }
                                  </span>

                                  <Badge variant="outline" className="text-xs">
                                    {notification.type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                              </div>

                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const notificationId = String(notification.id || notification._id || '')
                                    if (notificationId) handleMarkAsRead(notificationId)
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} notifications
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
        </div>
      </div>
    </>
  )
}
