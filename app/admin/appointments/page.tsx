'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Phone, MessageCircle, Calendar, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getAppointments, deleteAppointment, getPatients } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Appointment } from '@/lib/types'
import { getAppointmentDisplayName } from '@/lib/utils'
import { LogoLoader } from '@/components/ui/logo-loader'

export default function AppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchAppointments() {
      try {
        const [appointmentsData, patientsData] = await Promise.all([
          getAppointments(),
          getPatients(),
        ])

        const isCancelled = (status?: string) => String(status || '').trim().toLowerCase() === 'cancelled'

        const patientNameById = new Map(
          patientsData.map((patient: any) => [String(patient.id || patient._id), patient.name || 'Unknown Patient'])
        )

        const hydrated = Array.isArray(appointmentsData)
          ? appointmentsData
              .filter((appointment: any) => !isCancelled(appointment.status))
              .map((appointment: any) => ({
                ...appointment,
                patientName: patientNameById.get(String(appointment.patientId)) || getAppointmentDisplayName(appointment),
              }))
          : []

        setAppointments(hydrated)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message === 'Unauthorized') {
          router.push('/admin/login')
          return
        }

        setError('Failed to load appointments')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchAppointments()
    }
  }, [user, isAuthenticated, authLoading, router])

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        setIsSubmitting(true)
        await deleteAppointment(id)
        setAppointments(appointments.filter(a => String(a.id) !== String(id)))
        toast({ description: 'Appointment deleted successfully' })
      } catch (err) {
        toast({ description: 'Failed to delete appointment', variant: 'destructive' })
        console.error(err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "Video Call":
        return <Video className="w-4 h-4" />
      case "Audio Call":
        return <Phone className="w-4 h-4" />
      case "Chat":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <LogoLoader size={32} className="h-8 w-8" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-gray-600">Dashboard / Appointments</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Appointment List</h2>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Doctor Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {appointments.map((apt, index) => {
                const safeId =
                  apt?.id !== undefined && apt?.id !== null
                    ? apt.id.toString().padStart(3, '0')
                    : '---'

                return (
                  <tr key={apt?.id ?? index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      #APT{safeId}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      {apt?.doctorName ?? 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      {getAppointmentDisplayName(apt)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p>{apt?.date ?? 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{apt?.time ?? ''}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const statusText = String(apt?.status || '').trim()
                        const normalized = statusText.toLowerCase()
                        const isCompleted = normalized === 'completed'
                        return (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isCompleted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {statusText
                              ? statusText.charAt(0).toUpperCase() + statusText.slice(1)
                              : 'Unknown'}
                          </div>
                        )
                      })()}
                    </td>

                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAppointment(String(apt.id))}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {appointments.length === 0 && !error && (
            <div className="text-center py-8 text-gray-600">No appointments found</div>
          )}

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {appointments.length} entries</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
