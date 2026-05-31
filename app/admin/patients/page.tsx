'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getPatients, updatePatient, deletePatient, createPatient, getAppointmentsByPatientId, getDoctors } from '@/lib/api'
import { PatientFormModal, type PatientFormData } from '@/components/admin/patient-form-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Appointment, Patient } from '@/lib/types'
import { LogoLoader } from '@/components/ui/logo-loader'

function normalizePatient(raw: any): Patient {
  return {
    ...raw,
    id: raw?.id || raw?._id,
    name: raw?.name || 'Unnamed Patient',
    email: String(raw?.email || raw?.credentials?.email || '').trim(),
    phone: String(raw?.phone || '').trim(),
    age: raw?.age ?? '',
    gender: raw?.gender || '',
    avatar: raw?.avatar || raw?.image || '',
  }
}

export default function PatientsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activePatient, setActivePatient] = useState<Patient | null>(null)
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [doctorNameById, setDoctorNameById] = useState<Record<string, string>>({})
  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchPatients() {
      try {
        const [data, doctors] = await Promise.all([
          getPatients(),
          getDoctors(undefined, undefined, true),
        ])

        const doctorMap = doctors.reduce<Record<string, string>>((acc, doctor: any) => {
          const key = String(doctor?.id || doctor?._id || '')
          if (key) acc[key] = doctor?.name || 'Unknown Doctor'
          return acc
        }, {})

        setDoctorNameById(doctorMap)
        setPatients(data.map((patient) => normalizePatient(patient)))
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message === 'Unauthorized') {
          router.push('/admin/login')
          return
        }

        setError('Failed to load patients')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchPatients()
    }
  }, [user, isAuthenticated, authLoading, router])

  const handleAddPatient = () => {
    setSelectedPatient(null)
    setIsFormOpen(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsFormOpen(true)
  }

  const getAppointmentTimestamp = (appointment: Appointment): number => {
    const dateSource = appointment.fullDateIso || appointment.timestamp || appointment.date
    if (!dateSource) return 0
    const ts = new Date(dateSource).getTime()
    return Number.isNaN(ts) ? 0 : ts
  }

  const formatStatus = (status?: string): string => {
    if (!status) return 'Pending'
    const normalized = String(status).trim().toLowerCase()
    if (normalized === 'in progress' || normalized === 'in-progress' || normalized === 'inprogress') return 'In Progress'
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const handleSelectPatient = async (patient: Patient) => {
    setActivePatient(patient)
    setIsAppointmentsModalOpen(true)
    setAppointmentsLoading(true)
    try {
      const appointments = await getAppointmentsByPatientId(String(patient.id))
      const sorted = [...appointments].sort((a, b) => getAppointmentTimestamp(b) - getAppointmentTimestamp(a))
      setRecentAppointments(sorted.slice(0, 10))
    } catch (err) {
      console.error(err)
      setRecentAppointments([])
      toast({ description: 'Failed to load patient appointments', variant: 'destructive' })
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const handleDeletePatient = async (id: string) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        setIsSubmitting(true)
        await deletePatient(id)
        setPatients(patients.filter(p => String(p.id) !== String(id)))
        toast({ description: 'Patient deleted successfully' })
      } catch (err) {
        toast({ description: 'Failed to delete patient', variant: 'destructive' })
        console.error(err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFormSubmit = async (data: PatientFormData) => {
    try {
      setIsSubmitting(true)
      if (selectedPatient) {
        const payload = {
          name: data.name.trim(),
          phone: data.phone.trim(),
          age: data.age.trim(),
          gender: data.gender.trim(),
          image: data.image.trim() || undefined,
          avatar: data.avatar.trim() || undefined,
        }
        const updated = await updatePatient(String(selectedPatient.id), payload)
        setPatients(patients.map((p) => String(p.id) === String(selectedPatient.id) ? normalizePatient(updated) : p))
        toast({ description: 'Patient updated successfully' })
      } else {
        const payload = {
          name: data.name.trim(),
          phone: data.phone.trim(),
          age: data.age.trim(),
          gender: data.gender.trim(),
          image: data.image.trim() || undefined,
          avatar: data.avatar.trim() || undefined,
        }
        const newPatient = await createPatient(payload)
        setPatients([...patients, normalizePatient(newPatient)])
        toast({ description: 'Patient created successfully' })
      }
      setIsFormOpen(false)
    } catch (err) {
      toast({ description: 'Failed to save patient', variant: 'destructive' })
      console.error(err)
    } finally {
      setIsSubmitting(false)
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
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-gray-600">Dashboard / Patients</p>
          </div>
          {/* <Button onClick={handleAddPatient} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button> */}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Patient List</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Age</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr
                  key={patient.id ?? patient.email}
                  className={`hover:bg-gray-50 cursor-pointer ${activePatient && String(activePatient.id) === String(patient.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {`#PAT${String(patient.id ?? '000').slice(-6).toUpperCase()}`}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{patient.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.age || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">{patient.gender || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditPatient(patient)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePatient(String(patient.id))
                      }}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 && !error && (
            <div className="text-center py-8 text-gray-600">No patients found</div>
          )}
        </div>

        <Dialog open={isAppointmentsModalOpen} onOpenChange={setIsAppointmentsModalOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {activePatient ? `Recent Appointments - ${activePatient.name}` : 'Recent Appointments'}
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[70vh] overflow-y-auto">
              {appointmentsLoading ? (
                <div className="flex justify-center py-8">
                  <LogoLoader size={24} className="h-6 w-6" />
                </div>
              ) : recentAppointments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Doctor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentAppointments.map((appointment) => {
                      const doctorId = String(appointment.doctorId || '')
                      const doctorName = appointment.doctorName || doctorNameById[doctorId] || 'Unknown Doctor'
                      const amountText = typeof appointment.amount === 'number' ? `RS. ${appointment.amount}` : 'N/A'
                      const statusLabel = formatStatus(appointment.status)
                      const statusTone = statusLabel === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : statusLabel === 'Pending' || statusLabel === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'

                      return (
                        <tr key={String(appointment.id || appointment._id || `${appointment.patientId}-${appointment.doctorId}-${appointment.time || ''}`)}>
                          <td className="px-4 py-3 text-sm font-medium">{doctorName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{appointment.date || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{appointment.time || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{amountText}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusTone}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-600">No appointments found for this patient</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <PatientFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedPatient}
          isLoading={isSubmitting}
        />
      </div>
    </AdminLayout>
  )
}
