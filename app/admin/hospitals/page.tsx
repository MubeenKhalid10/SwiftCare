'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Edit2, Trash2, MapPin, Users } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { getFacilities, createFacility, updateFacility, deleteFacility, getDoctors } from '@/lib/api'
import { geocodeAddressWithMapbox } from '@/lib/location'
import { FacilityFormModal, type FacilityFormData } from '@/components/admin/facility-form-modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Facility, Doctor } from '@/lib/types'

export default function FacilitiesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
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
        toast({ description: 'Facility deleted successfully' })
      } catch (err) {
        toast({ description: 'Failed to delete facility', variant: 'destructive' })
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
        toast({ description: 'Facility location is required', variant: 'destructive' })
        return
      }

      const resolvedLocation = await geocodeAddressWithMapbox(trimmedLocationLabel)
      if (!resolvedLocation) {
        toast({ description: 'Unable to fetch coordinates for this location', variant: 'destructive' })
        return
      }

      const [lng, lat] = resolvedLocation.coordinates

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
          label: resolvedLocation.label || trimmedLocationLabel,
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
        toast({ description: 'Facility updated successfully' })
      } else {
        // Create new facility
        const created = await createFacility(facilityPayload)
        setFacilities([created, ...facilities])
        toast({ description: 'Facility created successfully' })
      }

      setIsFormOpen(false)
      setSelectedFacility(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save facility'
      toast({ description: errorMessage, variant: 'destructive' })
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            <p className="text-gray-600">Dashboard / Facilities Management</p>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {facilities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No facilities found</p>
              <Button onClick={handleAddFacility} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Facility
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Doctors</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {facilities.map((facility) => (
                      <tr key={facility.id || facility._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {facility.image ? (
                              <img 
                                src={facility.image} 
                                alt={facility.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <span className="text-xs text-gray-400">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{facility.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            {facility.location?.label || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{getAffiliatedDoctorsCount(facility)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {facility.about || 'No description'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
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
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
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
