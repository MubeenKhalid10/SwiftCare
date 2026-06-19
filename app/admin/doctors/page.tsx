'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Mail, Star, Calendar, Plus, Edit2, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getDoctors, getDoctorByEmail, updateDoctor, deleteDoctor, createDoctor, getAppointments, getReviews } from '@/lib/api'
import { DoctorFormModal, type DoctorFormData } from '@/components/admin/doctor-form-modal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Doctor } from '@/lib/types'
import { LogoLoader } from '@/components/ui/logo-loader'
import { resolveDoctorImage, onDoctorImageError } from '@/lib/image-utils'

function normalizeDoctor(raw: any, totalAppointments?: number, computedRating?: number): Doctor {
  const locationObject = typeof raw?.location === 'object' ? raw.location : undefined
  const specialization = raw?.specialty || raw?.specialization || raw?.professionalInfo?.specialization || ''
  const consultationFee = typeof raw?.consultationFee === 'number'
    ? raw.consultationFee
    : raw?.fee
      ? Number(String(raw.fee).replace(/[^0-9.]/g, ''))
      : 0

  return {
    ...raw,
    id: raw?.id || raw?._id,
    name: raw?.name || 'Unnamed Doctor',
    email: String(raw?.email || raw?.credentials?.email || raw?.professionalInfo?.email || '').trim(),
    age: raw?.age,
    gender: raw?.gender || '',
    specialty: specialization,
    specialization,
    phone: String(raw?.phone || raw?.contactNo || raw?.clinicPhone || raw?.clinicInfo?.phone || '').trim(),
    experience: raw?.experience || '',
    about: raw?.about || '',
    image: raw?.image || '',
    clinicName: raw?.clinicName || locationObject?.clinicName || '',
    locationLabel: raw?.locationLabel || locationObject?.label || (typeof raw?.location === 'string' ? raw.location : ''),
    fee: `RS. ${Number.isFinite(consultationFee) ? consultationFee : 0}`,
    rating: computedRating ?? raw?.rating ?? raw?.averageRating ?? 0,
    totalAppointments: totalAppointments ?? raw?.totalAppointments ?? 0,
  }
}

function splitCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatTimeToken(value: string, suffix?: 'AM' | 'PM'): string | null {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const tokenSuffix = (match[3] || suffix || '').toUpperCase() as 'AM' | 'PM' | ''

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes > 59) {
    return null
  }

  if (tokenSuffix) {
    if (hours < 1 || hours > 12) return null
    const paddedHours = String(hours).padStart(2, '0')
    const paddedMinutes = String(minutes).padStart(2, '0')
    return `${paddedHours}:${paddedMinutes} ${tokenSuffix}`
  }

  if (hours < 0 || hours > 23) return null

  const detectedSuffix: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12

  const paddedHours = String(hours).padStart(2, '0')
  const paddedMinutes = String(minutes).padStart(2, '0')
  return `${paddedHours}:${paddedMinutes} ${detectedSuffix}`
}

function normalizeTimeRangeEntry(entry: string): string | null {
  const raw = String(entry || '').trim()
  if (!raw) return null

  const parts = raw.split('-').map((item) => item.trim()).filter(Boolean)
  if (parts.length !== 2) return null

  const start = formatTimeToken(parts[0])
  const end = formatTimeToken(parts[1])
  if (!start || !end) return null

  return `${start} - ${end}`
}

function normalizeAvailableHours(value: string): string[] {
  return value
    .split(',')
    .map((item) => normalizeTimeRangeEntry(item))
    .filter((item): item is string => Boolean(item))
}

export default function DoctorsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
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
        const [doctorData, appointmentData, reviewData] = await Promise.all([
          getDoctors(undefined, undefined, true),
          getAppointments(),
          getReviews(),
        ])

        const appointmentCountByDoctor = new Map<string, number>()
        for (const apt of appointmentData) {
          const key = String(apt.doctorId || '')
          if (!key) continue
          appointmentCountByDoctor.set(key, (appointmentCountByDoctor.get(key) || 0) + 1)
        }

        const reviewStatsByDoctor = new Map<string, { sum: number; count: number }>()
        for (const review of reviewData) {
          const key = String(review.doctorId || '')
          if (!key) continue
          const current = reviewStatsByDoctor.get(key) || { sum: 0, count: 0 }
          reviewStatsByDoctor.set(key, {
            sum: current.sum + Number(review.rating || 0),
            count: current.count + 1,
          })
        }

        const normalizedDoctors = doctorData.map((doc: any) => {
          const doctorId = String((doc as any)?.id || (doc as any)?._id || '')
          const appointmentCount = appointmentCountByDoctor.get(doctorId) || 0
          const ratingStats = reviewStatsByDoctor.get(doctorId)
          const averageRating = ratingStats && ratingStats.count > 0
            ? ratingStats.sum / ratingStats.count
            : Number((doc as any).averageRating || (doc as any).rating || 0)

          return normalizeDoctor(doc, appointmentCount, averageRating)
        })

        setDoctors(normalizedDoctors)
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
    try {
      setIsSubmitting(true)
      await deleteDoctor(id)
      setDoctors(doctors.filter(d => String(d.id) !== String(id)))
      toast.success('Doctor deleted from the database.')
    } catch (err) {
      toast.error('Failed to delete doctor')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: DoctorFormData) => {
    try {
      setIsSubmitting(true)
      if (selectedDoctor) {
        const selectedDoctorAny = selectedDoctor as any
        const currentLocation = typeof selectedDoctorAny.location === 'object' ? selectedDoctorAny.location : {}
        const currentGeo = currentLocation?.geo || {
          type: 'Point',
          coordinates: selectedDoctorAny.locationCoordinates || [0, 0],
        }

        const feeValue = Number(data.consultationFee)

        const payload: any = {
          name: data.name.trim(),
          specialization: data.specialization.trim(),
          experience: data.experience.trim(),
          about: data.about.trim(),
          image: data.image.trim() || undefined,
          contactNo: data.phone.trim() || undefined,
          age: data.age ? Number(data.age) : undefined,
          gender: data.gender.trim() || undefined,
          consultationFee: Number.isFinite(feeValue) ? feeValue : undefined,
          credentials: {
            ...(selectedDoctorAny.credentials || {}),
            email: data.email.trim(),
          },
          professionalInfo: {
            ...(selectedDoctorAny.professionalInfo || {}),
            specialization: data.specialization.trim(),
          },
          location: {
            ...currentLocation,
            clinicName: data.clinicName.trim() || undefined,
            label: data.clinicLocation.trim() || undefined,
            geo: currentGeo,
          },
          schedule: {
            availableDays: splitCommaSeparated(data.availableDays),
            availableHours: splitCommaSeparated(data.availableHours),
          },
        }

        const updated = await updateDoctor(String(selectedDoctor.id), payload)
        const normalizedUpdated = normalizeDoctor(updated)
        setDoctors(doctors.map((d) => String(d.id) === String(selectedDoctor.id) ? normalizedUpdated : d))
        toast.success('Doctor updated successfully')
      } else {
        const normalizedEmail = data.email.trim().toLowerCase()
        const existingDoctor = await getDoctorByEmail(normalizedEmail)
        if (existingDoctor) {
          toast.error('A doctor with this email already exists')
          setIsSubmitting(false)
          return
        }

        const tempPassword = `unregistered-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        const newDoctorPayload: any = {
          name: data.name.trim(),
          specialization: data.specialization.trim(),
          experience: data.experience.trim(),
          about: data.about.trim(),
          image: data.image.trim() || undefined,
          contactNo: data.phone.trim() || undefined,
          age: data.age ? Number(data.age) : undefined,
          gender: data.gender.trim() || undefined,
          consultationFee: Number.isFinite(Number(data.consultationFee)) ? Number(data.consultationFee) : undefined,
          location: {
            label: data.clinicLocation.trim() || undefined,
            clinicName: data.clinicName.trim() || undefined,
            geo: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          schedule: {
            availableDays: splitCommaSeparated(data.availableDays),
            availableHours: normalizeAvailableHours(data.availableHours),
          },
          credentials: {
            email: normalizedEmail,
            password: tempPassword,
            provider: 'manual',
            emailVerified: false,
          },
          accountStatus: {
            registered: false,
            verificationStatus: 'pending',
          },
        }

        const newDoctor = await createDoctor(newDoctorPayload as Omit<Doctor, 'id'>)
        setDoctors([...doctors, normalizeDoctor(newDoctor)])
        toast.success('Doctor created successfully as unregistered information only')
      }
      setIsFormOpen(false)
    } catch (err) {
      toast.error('Failed to save doctor')
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
            <h1 className="text-3xl font-bold">Doctors</h1>
            <p className="text-muted-foreground">Dashboard / Doctors</p>
          </div>
          <Button onClick={handleAddDoctor} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Unregistered Doctor
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="doctor-card"
            >
              <div className="h-32 flex items-center justify-center bg-gradient-to-br from-icon-bg to-primary/5">
                <img
                  src={resolveDoctorImage(doctor.image)}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={onDoctorImageError}
                />
              </div>
              
              <div className="doctor-card-content text-center">
                <h3 className="doctor-card-name justify-center">{doctor.name}</h3>
                <p className="doctor-card-specialty justify-center">{doctor.specialty || 'Unspecified'}</p>
                <div className="flex items-center justify-center gap-1 my-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-foreground">{Number(doctor.rating || 0).toFixed(1)}</span>
                </div>
                
                <div className="space-y-2 text-sm divide-y divide-border/50 py-3 border-y border-border/50">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground pb-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{doctor.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2 pb-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs truncate">{doctor.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2 pb-2">
                    <span className="text-xs font-medium">Age/Gender:</span>
                    <span className="text-xs">{doctor.age ?? 'N/A'} / {doctor.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{doctor.totalAppointments ?? 0} appointments</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
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
          <div className="text-center py-12 text-muted-foreground">No doctors found</div>
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
