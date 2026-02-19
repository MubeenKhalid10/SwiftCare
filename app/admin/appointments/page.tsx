'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Video, Phone, MessageCircle, Calendar, Plus, Edit2, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getAppointments, updateAppointment, deleteAppointment, createAppointment } from '@/lib/api'
import { AppointmentFormModal } from '@/components/admin/appointment-form-modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Appointment } from '@/lib/types'

export default function AppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchAppointments() {
      try {
        const data = await getAppointments()
        setAppointments(Array.isArray(data) ? data : [])
      } catch (err) {
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

  const handleAddAppointment = () => {
    setSelectedAppointment(null)
    setIsFormOpen(true)
  }

  const handleEditAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsFormOpen(true)
  }

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

  const handleFormSubmit = async (data: Partial<Appointment>) => {
    try {
      setIsSubmitting(true)
      if (selectedAppointment) {
        await updateAppointment(String(selectedAppointment.id), data)
        setAppointments(appointments.map(a => String(a.id) === String(selectedAppointment.id) ? { ...a, ...data } : a))
        toast({ description: 'Appointment updated successfully' })
      } else {
        const newAppointment = await createAppointment(data as Omit<Appointment, 'id'>)
        setAppointments([...appointments, newAppointment])
        toast({ description: 'Appointment created successfully' })
      }
      setIsFormOpen(false)
    } catch (err) {
      toast({ description: 'Failed to save appointment', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsSubmitting(false)
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          <Button onClick={handleAddAppointment} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Speciality</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
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

                    <td className="px-6 py-4 text-sm text-blue-600">
                      {apt?.doctorSpecialty ?? 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      {apt?.patientName ?? 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p>{apt?.date ?? 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{apt?.time ?? ''}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(apt?.type)}
                        <span>{apt?.type ?? 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        apt?.status === 'upcoming'
                          ? 'bg-green-100 text-green-700'
                          : apt?.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {apt?.status
                          ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                          : 'Unknown'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAppointment(apt)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
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

        <AppointmentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedAppointment}
          isLoading={isSubmitting}
        />
      </div>
    </AdminLayout>
  )
}
