'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, MapPin, Users } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getFacilities, createFacility, updateFacility, deleteFacility, getDoctors } from '@/lib/api'
import { geocodeAddressWithMapbox } from '@/lib/location'
import { FacilityFormModal, type FacilityFormData } from '@/components/admin/facility-form-modal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Facility, Doctor } from '@/lib/types'
import { LogoLoader } from '@/components/ui/logo-loader'
import { resolveFacilityImage, onFacilityImageError } from '@/lib/image-utils'

export default function FacilitiesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 10

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    async function fetchData() {
      try {
        setIsLoading(true)
        const [facilitiesData, doctorsData] = await Promise.all([
          getFacilities(currentPage, itemsPerPage),
          getDoctors(undefined, undefined, true),
        ])

        setFacilities(facilitiesData.items)
        setDoctors(doctorsData)
        setTotalPages(Math.ceil(facilitiesData.totalCount / itemsPerPage))
      } catch (err) {
        setError('Failed to load facilities')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user, isAuthenticated, authLoading, router, currentPage])

  const handleAddFacility = () => {
    setSelectedFacility(null)
    setIsFormOpen(true)
  }

  const handleEditFacility = (facility: Facility) => {
    setSelectedFacility(facility)
    setIsFormOpen(true)
  }

  const handleDeleteFacility = async (id: string) => {
    if (confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      try {
        setIsSubmitting(true)
        await deleteFacility(id)
        setFacilities(facilities.filter(f => String(f.id || f._id) !== String(id)))
        toast.success('Facility deleted successfully')
      } catch (err) {
        toast.error('Failed to delete facility')
        console.error(err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFormSubmit = async (data: FacilityFormData) => {
    try {
      setIsSubmitting(true)

      const trimmedLocationLabel = data.locationLabel.trim()
      if (!trimmedLocationLabel) {
        toast.error('Facility location is required')
        return
      }

      let finalLabel = trimmedLocationLabel
      let coordinates = data.locationCoordinates || null

      if (!coordinates) {
        const resolvedLocation = await geocodeAddressWithMapbox(trimmedLocationLabel)
        if (!resolvedLocation) {
          toast.error('Unable to fetch coordinates for this location')
          return
        }
        coordinates = resolvedLocation.coordinates
        finalLabel = resolvedLocation.label || trimmedLocationLabel
      }

      const [lng, lat] = coordinates

      // Parse doctor IDs
      const doctorList = data.doctorIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)

      const facilityPayload: any = {
        name: data.name.trim(),
        about: data.about.trim() || undefined,
        image: data.image.trim() || undefined,
        location: {
          label: finalLabel,
          coordinates: [lng, lat],
          geo: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
        doctorList: doctorList.length > 0 ? doctorList : [],
      }

      if (selectedFacility) {
        // Update existing facility
        const updated = await updateFacility(String(selectedFacility.id || selectedFacility._id), facilityPayload)
        setFacilities(facilities.map(f =>
          String(f.id || f._id) === String(selectedFacility.id || selectedFacility._id) ? updated : f
        ))
        toast.success('Facility updated successfully')
      } else {
        // Create new facility
        const created = await createFacility(facilityPayload)
        setFacilities([created, ...facilities])
        toast.success('Facility created successfully')
      }

      setIsFormOpen(false)
      setSelectedFacility(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save facility'
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAffiliatedDoctorsCount = (facility: Facility): number => {
    if (!facility.doctorList) return 0
    return Array.isArray(facility.doctorList) ? facility.doctorList.length : 0
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Facilities</h1>
            <p className="text-muted-foreground">Dashboard / Facilities Management</p>
          </div>
          <Button onClick={handleAddFacility} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Facility
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Facilities Table */}
        <div className="bg-card rounded-lg shadow overflow-hidden">
          {facilities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No facilities found</p>
              <Button onClick={handleAddFacility} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Facility
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Image</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Doctors</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/80">Created</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {facilities.map((facility) => (
                      <tr key={facility.id || facility._id} className="hover:bg-muted">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <img
                              src={resolveFacilityImage(facility.image)}
                              alt={facility.name}
                              className="w-full h-full object-cover"
                              onError={onFacilityImageError}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{facility.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            {facility.location?.label || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-medium">{getAffiliatedDoctorsCount(facility)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {facility.about || 'No description'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {facility.createdAt
                            ? new Date(facility.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditFacility(facility)}
                              disabled={isSubmitting}
                              className="gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteFacility(String(facility.id || facility._id))}
                              disabled={isSubmitting}
                              className="gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Facility Form Modal */}
      <FacilityFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedFacility(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedFacility}
        isLoading={isSubmitting}
      />
    </AdminLayout>
  )
}
