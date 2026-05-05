'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { getDoctors } from '@/lib/api'
import { getNotifications } from '@/lib/notification.service'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 overflow-y-auto`}>
        <div className="p-6">
          <Link href="/admin/dashboard" className="text-2xl font-bold">
            SWIFTCARE
          </Link>
        </div>

        <nav className="mt-8 space-y-2">
          <div className="px-4">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-4">Main</p>
          </div>

          <NavLink href="/admin/dashboard" icon="📊" label="Dashboard" open={sidebarOpen} />
          <NavLink href="/admin/verification" icon="📋" label="Verification Requests" open={sidebarOpen} badgeCount={actionCount} />
          <NavLink href="/admin/appointments" icon="📅" label="Appointments" open={sidebarOpen} />
          <NavLink href="/admin/specialities" icon="🏥" label="Specialities" open={sidebarOpen} />
          <NavLink href="/admin/doctors" icon="👨‍⚕️" label="Doctors" open={sidebarOpen} />
          <NavLink href="/admin/patients" icon="🧑" label="Patients" open={sidebarOpen} />
          <NavLink href="/admin/reviews" icon="⭐" label="Reviews" open={sidebarOpen} />
          <NavLink href="/admin/transactions" icon="💳" label="Transactions" open={sidebarOpen} />
          <NavLink href="/admin/notifications" icon="🔔" label="Notifications" open={sidebarOpen} />
          <NavLink href="/admin/profile" icon="👤" label="Profile" open={sidebarOpen} />

          <div className="px-4 mt-8">
            <Link href="/logout" className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300">
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search here"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <Link href="/admin/notifications" className="p-2 hover:bg-gray-100 rounded-lg relative group">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-blue-600 text-white">{adminInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@swiftcare.com'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
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

function NavLink({ href, icon, label, open, badgeCount = 0 }: { href: string; icon: string; label: string; open: boolean; badgeCount?: number }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 flex items-center gap-3 hover:bg-blue-800 rounded-lg transition-colors relative"
    >
      <span className="text-lg">{icon}</span>
      {open && <span className="text-sm">{label}</span>}
      {badgeCount > 0 && (
        <span className="absolute right-4 top-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{badgeCount}</span>
      )}
    </Link>
  )
}
