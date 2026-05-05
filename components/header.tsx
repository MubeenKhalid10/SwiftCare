"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Bell, MessageSquare, LogOut, User, Calendar, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api"
import type { Notification } from "@/lib/types"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user) {
       getUnreadNotificationCount().then(setUnreadCount).catch(() => setUnreadCount(0))
       getNotifications(false).then(res => setNotifications(res.items)).catch(() => setNotifications([]))
    }
  }, [isAuthenticated, user])

  const getDashboardLink = () => {
    if (!user) return '/auth/login'
    switch (user.role) {
      case 'doctor':
        return '/doctor/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/patient/dashboard'
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-lg text-gray-900">SwiftCare</span>
        </Link>

        {(!isAuthenticated || user?.role === 'admin') && (
          <nav className="hidden md:flex items-center space-x-6 text-gray-600 text-sm">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="hover:text-gray-900">
              About
            </Link>
            <Link href="/faq" className="hover:text-gray-900">
              FAQ
            </Link>
            <Link href="/doctors" className="hover:text-gray-900">
              Doctors
            </Link>
            <Link href="/contact-us" className="hover:text-gray-900">
              Contact
            </Link>
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className="hover:text-gray-900">
                  Login
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent">
                    Admin Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={getDashboardLink()} className="hover:text-gray-900 font-medium text-blue-600">
                Dashboard
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 hover:bg-gray-100 rounded-full outline-none">
                      <Bell className="w-5 h-5 text-gray-500" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                         <span className="font-semibold text-gray-900">Notifications</span>
                         {unreadCount > 0 && (
                             <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-auto p-0 hover:text-blue-800 hover:bg-transparent" onClick={async (e) => {
                                 e.preventDefault();
                                 try {
                                     await markAllNotificationsAsRead();
                                     setUnreadCount(0);
                                     setNotifications(prev => prev.map(n => ({...n, read: true})));
                                 } catch (err) {
                                     console.error(err)
                                 }
                             }}>Mark all as read</Button>
                         )}
                      </div>
                      <div className="overflow-y-auto max-h-96">
                         {notifications.length === 0 ? (
                             <div className="p-8 text-center text-sm text-gray-500">No new notifications</div>
                         ) : (
                             notifications.map((n, i) => (
                                 <div key={n._id || n.id || i} className="group">
                                    <div className={`flex flex-col items-start p-4 hover:bg-gray-50 transition cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`} onClick={async () => {
                                        if (!n.read) {
                                            try {
                                                await markNotificationAsRead(String(n._id || n.id));
                                                setUnreadCount(prev => Math.max(0, prev - 1));
                                                setNotifications(prev => prev.map(notif => (notif._id === n._id || notif.id === n.id) ? {...notif, read: true} : notif));
                                            } catch (err) {
                                                console.error(err)
                                            }
                                        }
                                    }}>
                                        <div className="flex justify-between w-full gap-2">
                                            <div className={`font-semibold text-sm ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</div>
                                            {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></div>}
                                        </div>
                                        <div className={`text-xs mt-1 line-clamp-2 ${!n.read ? 'text-gray-700' : 'text-gray-500'}`}>{n.body}</div>
                                        <div className="text-[10px] text-gray-400 mt-2 font-medium">{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</div>
                                    </div>
                                    {i < notifications.length - 1 && <DropdownMenuSeparator className="m-0" />}
                                 </div>
                             ))
                         )}
                      </div>
                      <DropdownMenuSeparator className="m-0" />
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="cursor-pointer justify-center text-center font-medium text-blue-600 hover:text-blue-700 py-3">
                          View All Notifications
                        </Link>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-full p-1 pr-3">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hidden md:block">
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 capitalize mt-1">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                  </DropdownMenuItem>
                  {user?.role === 'patient' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/patient/appointments" className="cursor-pointer">
                          <Calendar className="w-4 h-4 mr-2" />
                          My Appointments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/doctors" className="cursor-pointer">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Find Doctors
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === 'doctor' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/doctor/appointments" className="cursor-pointer">
                          <Calendar className="w-4 h-4 mr-2" />
                          Appointments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/doctor/my-patients" className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          My Patients
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button className="md:hidden bg-transparent" variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
          <Button className="md:hidden" variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
