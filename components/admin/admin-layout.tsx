'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
          <NavLink href="/admin/appointments" icon="📅" label="Appointments" open={sidebarOpen} />
          <NavLink href="/admin/specialities" icon="🏥" label="Specialities" open={sidebarOpen} />
          <NavLink href="/admin/doctors" icon="👨‍⚕️" label="Doctors" open={sidebarOpen} />
          <NavLink href="/admin/patients" icon="🧑" label="Patients" open={sidebarOpen} />
          <NavLink href="/admin/reviews" icon="⭐" label="Reviews" open={sidebarOpen} />
          <NavLink href="/admin/transactions" icon="💳" label="Transactions" open={sidebarOpen} />
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
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
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

function NavLink({ href, icon, label, open }: { href: string; icon: string; label: string; open: boolean }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 flex items-center gap-3 hover:bg-blue-800 rounded-lg transition-colors"
    >
      <span className="text-lg">{icon}</span>
      {open && <span className="text-sm">{label}</span>}
    </Link>
  )
}
