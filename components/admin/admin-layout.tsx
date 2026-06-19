'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { getDoctors } from '@/lib/api'
import { getNotifications } from '@/lib/notification.service'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Menu, ChevronDown, LogOut, LayoutDashboard, ClipboardList, Calendar, Building2, Stethoscope, UserRound, Users, Star, User, type LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { resolvePatientImage, onPatientImageError } from '@/lib/image-utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [actionCount, setActionCount] = useState<number>(0)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Poll for verification requests count (do not modify backend)
  useEffect(() => {
    let mounted = true
    const fetchCount = async () => {
      try {
        const docs = await getDoctors()
        if (!mounted) return
        const count = docs.filter(d => d.verificationStatus === 'submitted').length
        setActionCount(count)
      } catch (e) {
        // ignore
      }
    }

    fetchCount()
    const id = setInterval(fetchCount, 30000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Fetch unread notifications count
  useEffect(() => {
    let mounted = true
    const fetchUnreadCount = async () => {
      try {
        const response = await getNotifications(1, 1, true)
        if (!mounted) return
        setUnreadCount(response.total)
      } catch (e) {
        // ignore
      }
    }

    fetchUnreadCount()
    const id = setInterval(fetchUnreadCount, 15000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const adminInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD'

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} border-r-2 border-primary/30 bg-gradient-to-b from-primary-700 to-primary-900 text-white transition-all duration-300 overflow-y-auto shadow-[0_20px_60px_rgba(1,101,252,0.3)]`}>
        <div className="p-6">
          <Link href="/admin/dashboard" className="text-2xl font-bold tracking-[0.2em] text-white">
            SWIFTCARE
          </Link>
        </div>

        <nav className="mt-8 space-y-2">
          <div className="px-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Main</p>
          </div>

          <NavLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" open={sidebarOpen} />
          <NavLink href="/admin/verification" icon={ClipboardList} label="Verification Requests" open={sidebarOpen} badgeCount={actionCount} />
          <NavLink href="/admin/appointments" icon={Calendar} label="Appointments" open={sidebarOpen} />
          <NavLink href="/admin/hospitals" icon={Building2} label="Hospitals" open={sidebarOpen} />
          <NavLink href="/admin/specialities" icon={Stethoscope} label="Specialities" open={sidebarOpen} />
          <NavLink href="/admin/doctors" icon={UserRound} label="Doctors" open={sidebarOpen} />
          <NavLink href="/admin/patients" icon={Users} label="Patients" open={sidebarOpen} />
          <NavLink href="/admin/reviews" icon={Star} label="Reviews" open={sidebarOpen} />
          <NavLink href="/admin/notifications" icon={Bell} label="Notifications" open={sidebarOpen} />
          <NavLink href="/admin/profile" icon={User} label="Profile" open={sidebarOpen} />

          <div className="px-4 mt-8">
            <Link href="/logout" className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-red-300 transition hover:bg-white/5 hover:text-red-200">
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-white/80 px-8 py-4 backdrop-blur-xl dark:bg-slate-950/70">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <Link href="/admin/notifications" className="group relative rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-white/10">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/25">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                  <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-xs text-white opacity-0 transition pointer-events-none group-hover:opacity-100">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={resolvePatientImage(user?.avatar)}
                      alt={user?.name}
                      onError={onPatientImageError}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white">{adminInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name || 'Admin'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-border/60 bg-background/95 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'admin@swiftcare.com'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, icon: Icon, label, open, badgeCount = 0 }: { href: string; icon: LucideIcon; label: string; open: boolean; badgeCount?: number }) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/10"
    >
      <Icon className="w-5 h-5" />
      {open && <span className="text-sm">{label}</span>}
      {badgeCount > 0 && (
        <span className="absolute right-4 top-3 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold leading-none text-white">{badgeCount}</span>
      )}
    </Link>
  )
}
