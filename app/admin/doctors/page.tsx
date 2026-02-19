'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Phone, Mail, Star, Calendar, Plus, Edit2, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getDoctors, updateDoctor, deleteDoctor, createDoctor } from '@/lib/api'
import { DoctorFormModal } from '@/components/admin/doctor-form-modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Doctor } from '@/lib/types'

export default function DoctorsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchDoctors() {
      try {
        const data = await getDoctors()
        setDoctors(data)
      } catch (err) {
        setError('Failed to load doctors')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchDoctors()
    }
  }, [user, isAuthenticated, authLoading, router])

  const handleAddDoctor = () => {
    setSelectedDoctor(null)
    setIsFormOpen(true)
  }

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsFormOpen(true)
  }

  const handleDeleteDoctor = async (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      try {
        setIsSubmitting(true)
        await deleteDoctor(id)
        setDoctors(doctors.filter(d => String(d.id) !== String(id)))
        toast({ description: 'Doctor deleted successfully' })
      } catch (err) {
        toast({ description: 'Failed to delete doctor', variant: 'destructive' })
        console.error(err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFormSubmit = async (data: Partial<Doctor>) => {
    try {
      setIsSubmitting(true)
      if (selectedDoctor) {
        await updateDoctor(String(selectedDoctor.id), data)
        setDoctors(doctors.map(d => String(d.id) === String(selectedDoctor.id) ? { ...d, ...data } : d))
        toast({ description: 'Doctor updated successfully' })
      } else {
        const newDoctor = await createDoctor(data as Omit<Doctor, 'id'>)
        setDoctors([...doctors, newDoctor])
        toast({ description: 'Doctor created successfully' })
      }
      setIsFormOpen(false)
    } catch (err) {
      toast({ description: 'Failed to save doctor', variant: 'destructive' })
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
            <h1 className="text-3xl font-bold">Doctors</h1>
            <p className="text-gray-600">Dashboard / Doctors</p>
          </div>
          <Button onClick={handleAddDoctor} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-lg">{doctor.name}</h3>
                <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{doctor.totalAppointments} appointments</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  doctor.available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {doctor.available ? 'Available' : 'Unavailable'}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditDoctor(doctor)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteDoctor(String(doctor.id))}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {doctors.length === 0 && !error && (
          <div className="text-center py-12 text-gray-600">No doctors found</div>
        )}

        <DoctorFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedDoctor}
          isLoading={isSubmitting}
        />
      </div>
    </AdminLayout>
  )
}
