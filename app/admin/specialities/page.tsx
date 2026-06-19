'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Stethoscope } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getDoctors } from '@/lib/api'
import type { Doctor } from '@/lib/types'
import { LogoLoader } from '@/components/ui/logo-loader'

type DoctorWithDerivedFields = Doctor & {
  registeredEmail: string
  specialtyLabel: string
}

export default function SpecialitiesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<DoctorWithDerivedFields[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchDoctors() {
      try {
        const data = await getDoctors(undefined, undefined, true)
        const normalized = data.map((doctor) => {
          const specialtyLabel = doctor.specialty || doctor.specialization || 'Unspecified'
          const registeredEmail = (doctor as any).email || (doctor as any).credentials?.email || 'N/A'

          return {
            ...doctor,
            specialtyLabel,
            registeredEmail,
          }
        })

        setDoctors(normalized)
      } catch (err) {
        setError('Failed to load specialities')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchDoctors()
    }
  }, [user, isAuthenticated, authLoading, router])

  const groupedSpecialties = useMemo(() => {
    const grouped = doctors.reduce<Record<string, DoctorWithDerivedFields[]>>((acc, doctor) => {
      const key = doctor.specialtyLabel
      if (!acc[key]) acc[key] = []
      acc[key].push(doctor)
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([label, items]) => ({
        label,
        count: items.length,
        doctors: items,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [doctors])

  useEffect(() => {
    if (!groupedSpecialties.length) {
      setSelectedSpecialty(null)
      return
    }

    const stillExists = groupedSpecialties.some((specialty) => specialty.label === selectedSpecialty)
    if (!stillExists) {
      setSelectedSpecialty(groupedSpecialties[0].label)
    }
  }, [groupedSpecialties, selectedSpecialty])

  const selectedDoctors = useMemo(() => {
    const selectedGroup = groupedSpecialties.find((specialty) => specialty.label === selectedSpecialty)
    return selectedGroup?.doctors || []
  }, [groupedSpecialties, selectedSpecialty])

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Specialities</h1>
            <p className="text-muted-foreground">Dashboard / Specialities</p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-icon-bg px-4 py-2 text-sm font-medium text-primary">
            {groupedSpecialties.length} total specialities
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupedSpecialties.map((specialty) => {
            const isActive = selectedSpecialty === specialty.label

            return (
              <button
                key={specialty.label}
                type="button"
                onClick={() => setSelectedSpecialty(specialty.label)}
                className={`rounded-xl border p-5 text-left transition-all ${
                  isActive
                    ? 'border-primary bg-icon-bg shadow-sm'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-icon-bg text-primary">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/80">
                    <Users className="h-3.5 w-3.5" />
                    {specialty.count}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-foreground">{specialty.label}</p>
                <p className="text-sm text-muted-foreground">{specialty.count} doctor{specialty.count !== 1 ? 's' : ''} registered</p>
              </button>
            )
          })}
        </div>

        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold">Doctors in {selectedSpecialty || 'Speciality'}</h2>
            <span className="text-sm text-muted-foreground">{selectedDoctors.length} entries</span>
          </div>

          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Doctor Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Speciality</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Registered Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selectedDoctors.map((doctor) => (
                <tr key={String(doctor.id)} className="hover:bg-muted">
                  <td className="px-6 py-4 text-sm font-medium">{doctor.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-icon-bg px-2.5 py-1 text-xs font-semibold text-primary">
                      {doctor.specialtyLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/80">{doctor.registeredEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedDoctors.length === 0 && (
            <div className="px-6 py-8 text-center text-muted-foreground">No doctors found for this speciality</div>
          )}
        </div>

        {groupedSpecialties.length === 0 && !error && (
          <div className="text-center py-12 text-muted-foreground">No speciality data available</div>
        )}
      </div>
    </AdminLayout>
  )
}
