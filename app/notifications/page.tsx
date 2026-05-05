'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar'
import { PatientSidebar } from '@/components/patient/patient-sidebar'
import { useAuth } from '@/lib/auth-context'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationIcon,
  getNotificationStyle 
} from '@/lib/notification.service'
import type { Notification } from '@/lib/types'
import { Loader2, Bell, Trash2, Check, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { socket, connectSocket } from '@/lib/socket'

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!socket.connected) connectSocket()
    
    // Listen for new notifications
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
      const filterType = filter !== 'all' ? filter : undefined
      const response = await getNotifications(page, 20, filter === 'unread', filterType)
      setNotifications(response.items)
      setTotalPages(response.totalPages)
      setTotal(response.total)
      setUnreadCount(response.items.filter(n => !n.read).length)
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
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n)
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

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
  ]

  const SidebarComponent = user?.role === 'doctor' ? DoctorSidebar : PatientSidebar

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {user && <SidebarComponent />}
          <div className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{user?.role === 'doctor' ? 'Doctor' : 'Patient'}</span>
                  <span>&gt;</span>
                  <span>Notifications</span>
                </div>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
              </div>

              <Card>
                <div className="p-6">
                  {/* Header with filters and actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filter by type:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notificationTypes.map(type => (
                        <Button
                          key={type.value}
                          variant={filter === type.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => { setFilter(type.value); setPage(1) }}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {unreadCount > 0 && (
                    <div className="flex gap-2 mb-6 pb-6 border-b">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={handleMarkAllAsRead}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark All as Read
                      </Button>
                    </div>
                  )}

                  {/* Notifications List */}
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">No notifications yet</p>
                      <p className="text-sm text-gray-500">
                        {filter === 'all' 
                          ? "You're all caught up! We'll notify you when something important happens."
                          : `No ${filter.replace(/_/g, ' ')} notifications found.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => {
                        const style = getNotificationStyle(notification.type)
                        const icon = getNotificationIcon(notification.type)
                        const isRecent = notification.createdAt ? 
                          (new Date().getTime() - new Date(notification.createdAt).getTime()) < 60000 : false

                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border rounded-lg transition-colors cursor-pointer hover:shadow-sm ${
                              notification.read ? 'bg-white' : style.bgColor + ' border-2 border-current'
                            } ${style.borderColor}`}
                            onClick={() => !notification.read && notification.id && handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className="text-2xl flex-shrink-0 pt-1">{icon}</div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-1">
                                    <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : style.textColor}`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.read && (
                                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                    )}
                                    {isRecent && (
                                      <Badge className="bg-red-500 text-white text-xs ml-auto">NEW</Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <p className={`text-sm mb-2 ${notification.read ? 'text-gray-600' : style.textColor}`}>
                                  {notification.body}
                                </p>

                                {/* Metadata */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className={notification.read ? 'text-gray-500' : 'text-gray-600'}>
                                    {notification.createdAt ? 
                                      new Date(notification.createdAt).toLocaleString() : 'just now'
                                    }
                                  </span>
                                  
                                  {/* Action Badge */}
                                  <Badge variant="outline" className="text-xs">
                                    {notification.type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                              </div>

                              {/* Quick Action */}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (notification.id) handleMarkAsRead(notification.id)
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                      <p className="text-sm text-gray-600">
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
        </div>
      </div>
      <Footer />
    </>
  )
}
