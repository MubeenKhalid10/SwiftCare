'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getPatients, updatePatient, deletePatient, createPatient } from '@/lib/api'
import { PatientFormModal } from '@/components/admin/patient-form-modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Patient } from '@/lib/types'

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

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchPatients() {
      try {
        const data = await getPatients()
        setPatients(data)
      } catch (err) {
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

  const handleFormSubmit = async (data: Partial<Patient>) => {
    try {
      setIsSubmitting(true)
      if (selectedPatient) {
        await updatePatient(String(selectedPatient.id), data)
        setPatients(patients.map(p => String(p.id) === String(selectedPatient.id) ? { ...p, ...data } : p))
        toast({ description: 'Patient updated successfully' })
      } else {
        const newPatient = await createPatient(data as Omit<Patient, 'id'>)
        setPatients([...patients, newPatient])
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
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-gray-600">Dashboard / Patients</p>
          </div>
          <Button onClick={handleAddPatient} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Visit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id ?? patient.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">
                    {`#PAT${patient.id?.toString().padStart(3, '0') ?? '000'}`}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{patient.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.phone}</td>
                  <td className="px-6 py-4 text-sm">{patient.gender}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {patient.bloodType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePatient(String(patient.id))}
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
