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
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-lg shadow-md shadow-primary/8 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 transition-transform duration-300 hover:-translate-y-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-600 font-bold text-white shadow-md shadow-primary/30">S</div>
          <span className="text-lg font-bold tracking-tight text-foreground dark:text-white">SwiftCare</span>
        </Link>

        {(!isAuthenticated || user?.role === 'admin') && (
          <nav className="hidden flex-1 items-center md:grid md:grid-cols-3">
            <div />
            <div className="flex items-center justify-center gap-7 text-sm text-foreground/70 -translate-x-10 dark:text-slate-300">
              <Link href="/" className="transition hover:text-foreground dark:hover:text-white">
                Home
              </Link>
              <Link href="/about" className="transition hover:text-foreground dark:hover:text-white">
                About
              </Link>
              <Link href="/faq" className="transition hover:text-foreground dark:hover:text-white">
                FAQ
              </Link>
              <Link href="/doctors" className="transition hover:text-foreground dark:hover:text-white">
                Doctors
              </Link>
              <Link href="/hospitals" className="transition hover:text-foreground dark:hover:text-white">
                Hospitals
              </Link>
              <Link href="/contact-us" className="transition hover:text-foreground dark:hover:text-white">
                Contact
              </Link>
            </div>
            <div className="ml-auto flex items-center justify-end gap-2">
              {!isAuthenticated ? (
                <>
                  <Link href="/auth/login">
                    <Button
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" variant="outline" className="rounded-full px-5">
                      Register
                    </Button>
                  </Link>
                  <Link href="/admin/login">
                    <Button size="sm" variant="outline" className="rounded-full px-5">
                      Admin Login
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={getDashboardLink()} className="font-medium text-primary transition hover:text-primary-600">
                  Dashboard
                </Link>
              )}
            </div>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-lg p-2 text-foreground/60 outline-none transition hover:bg-muted hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-600 text-[10px] font-bold text-white shadow-md shadow-primary/30">
                              {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-2xl border border-border bg-white/95 p-0 shadow-lg shadow-primary/10 backdrop-blur-xl dark:bg-slate-900/95">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                         <span className="font-semibold tracking-tight text-foreground dark:text-white">Notifications</span>
                         {unreadCount > 0 && (
                             <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary-600" onClick={async (e) => {
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
                        <div className="max-h-96 overflow-y-auto">
                         {notifications.length === 0 ? (
                           <div className="p-8 text-center text-sm text-muted-foreground dark:text-slate-400">No new notifications</div>
                         ) : (
                             notifications.map((n, i) => (
                                 <div key={n._id || n.id || i} className="group">
                              <div className={`flex cursor-pointer flex-col items-start p-4 transition hover:bg-muted dark:hover:bg-white/5 ${!n.read ? 'bg-icon-bg dark:bg-primary/10' : ''}`} onClick={async () => {
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
                                        <div className="flex w-full justify-between gap-2">
                                            <div className={`text-sm font-semibold ${!n.read ? 'text-foreground dark:text-white' : 'text-foreground/70 dark:text-slate-200'}`}>{n.title}</div>
                                            {!n.read && <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>}
                                        </div>
                                        <div className={`mt-1 line-clamp-2 text-xs ${!n.read ? 'text-foreground/70 dark:text-slate-300' : 'text-muted-foreground dark:text-slate-400'}`}>{n.body}</div>
                                        <div className="mt-2 text-[10px] font-medium text-muted-foreground">{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</div>
                                    </div>
                                    {i < notifications.length - 1 && <DropdownMenuSeparator className="m-0" />}
                                 </div>
                             ))
                         )}
                      </div>
                      <DropdownMenuSeparator className="m-0" />
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="cursor-pointer justify-center py-3 text-center font-medium text-primary hover:text-primary-600">
                          View All Notifications
                        </Link>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 rounded-full p-1 pr-3 transition hover:bg-muted dark:hover:bg-white/10">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-icon-bg text-xs font-bold text-primary">
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium text-foreground/80 md:block dark:text-slate-200">
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-border bg-white/95 shadow-lg shadow-primary/10 backdrop-blur-xl dark:bg-slate-900/95">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground dark:text-white">{user?.name}</p>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">{user?.email}</p>
                    <p className="mt-1 text-xs capitalize text-primary">{user?.role}</p>
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
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
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
