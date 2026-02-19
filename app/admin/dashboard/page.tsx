'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Calendar, DollarSign, UserRound, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getDashboardStats } from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

const revenueData = [
  { year: 2020, revenue: 100 },
  { year: 2021, revenue: 250 },
  { year: 2022, revenue: 150 },
  { year: 2023, revenue: 200 },
  { year: 2024, revenue: 300 },
  { year: 2025, revenue: 350 }
]

const statusData = [
  { year: 2021, doctors: 50, patients: 30 },
  { year: 2022, doctors: 80, patients: 60 },
  { year: 2023, doctors: 120, patients: 100 },
  { year: 2024, doctors: 140, patients: 120 },
  { year: 2025, doctors: 150, patients: 140 }
]

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchStats() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchStats()
    }
  }, [user, isAuthenticated, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: 'Doctors',
      value: stats?.totalDoctors || 0,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
      barColor: 'bg-blue-500',
    },
    {
      title: 'Patients',
      value: stats?.totalPatients || 0,
      icon: UserRound,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      barColor: 'bg-green-500',
    },
    {
      title: 'Appointments',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      barColor: 'bg-red-500',
    },
    {
      title: 'Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      barColor: 'bg-yellow-500',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome Admin!</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-full`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className={`mt-4 h-1 ${stat.barColor} rounded`}></div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#93c5fd" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="doctors" stroke="#0ea5e9" />
                <Line type="monotone" dataKey="patients" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Top Doctors</h3>
            <div className="space-y-3">
              {(stats?.topDoctors || []).slice(0, 5).map((doctor, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{doctor.name}</p>
                      <p className="text-sm text-blue-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{doctor.totalAppointments}</p>
                    <p className="text-xs text-gray-500">appointments</p>
                  </div>
                </div>
              ))}
              {(!stats?.topDoctors || stats.topDoctors.length === 0) && (
                <p className="text-gray-500 text-center py-4">No doctors data</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Recent Appointments</h3>
            <div className="space-y-3">
              {(stats?.recentAppointments || []).slice(0, 5).map((apt, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded">
                  <div>
                    <p className="font-semibold">{apt.patientName}</p>
                    <p className="text-sm text-gray-600">{apt.doctorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{apt.date}</p>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      apt.status === 'upcoming' 
                        ? 'bg-green-100 text-green-700' 
                        : apt.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {apt.status}
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.recentAppointments || stats.recentAppointments.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
