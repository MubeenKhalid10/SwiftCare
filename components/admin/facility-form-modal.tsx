'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { geocodeAddressWithMapbox } from '@/lib/location'
import { toast } from 'sonner'
import type { Facility } from '@/lib/types'
import { resolveFacilityImage, onFacilityImageError } from '@/lib/image-utils'

export interface FacilityFormData {
  name: string
  about: string
  image: string
  locationLabel: string
  locationCoordinates?: [number, number] | null
  doctorIds: string
}

const EMPTY_FORM: FacilityFormData = {
  name: '',
  about: '',
  image: '',
  locationLabel: '',
  locationCoordinates: null,
  doctorIds: '',
}

function buildFormFromFacility(facility?: Facility | null): FacilityFormData {
  if (!facility) return EMPTY_FORM

  const doctorIds = Array.isArray(facility.doctorList)
    ? facility.doctorList
        .map(d => typeof d === 'string' ? d : (d as any).id || (d as any)._id)
        .join(', ')
    : ''

  return {
    name: facility.name || '',
    about: facility.about || '',
    image: facility.image || '',
    locationLabel: facility.location?.label || '',
    locationCoordinates: facility.location?.coordinates || facility.location?.geo?.coordinates || null,
    doctorIds,
  }
}

interface FacilityFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FacilityFormData) => Promise<void>
  initialData?: Facility | null
  isLoading?: boolean
}

export function FacilityFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: FacilityFormModalProps) {
  const [formData, setFormData] = useState<FacilityFormData>(buildFormFromFacility(initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormFromFacility(initialData))
      setErrors({})
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'locationLabel' ? { locationCoordinates: null } : {}),
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFetchCoordinates = async () => {
    const trimmedLocation = formData.locationLabel.trim()
    if (!trimmedLocation) {
      setErrors(prev => ({ ...prev, locationLabel: 'Location/Address is required' }))
      toast.error('Enter a location first')
      return
    }

    try {
      setIsFetchingCoordinates(true)
      const resolvedLocation = await geocodeAddressWithMapbox(trimmedLocation)

      if (!resolvedLocation || !Array.isArray(resolvedLocation.coordinates) || resolvedLocation.coordinates.length < 2) {
        toast.error('Unable to fetch coordinates for this location')
        return
      }

      setFormData(prev => ({
        ...prev,
        locationLabel: resolvedLocation.label || trimmedLocation,
        locationCoordinates: resolvedLocation.coordinates,
      }))

      setErrors(prev => {
        const next = { ...prev }
        delete next.locationLabel
        return next
      })

      toast.success('Coordinates fetched successfully')
    } catch (error) {
      console.error('Error fetching coordinates:', error)
      toast.error('Failed to fetch coordinates')
    } finally {
      setIsFetchingCoordinates(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required'
    }

    if (!formData.locationLabel.trim()) {
      newErrors.locationLabel = 'Location/Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      setFormData(EMPTY_FORM)
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Facility' : 'Add New Facility'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <Label htmlFor="name">Facility Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., City Hospital, Health Center"
              value={formData.name || ''}
              onChange={handleChange}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="locationLabel">Location/Address *</Label>
            <div className="flex gap-2">
              <Input
                id="locationLabel"
                name="locationLabel"
                placeholder="e.g., 123 Main Street, City, Country"
                value={formData.locationLabel || ''}
                onChange={handleChange}
                className={errors.locationLabel ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchCoordinates}
                disabled={isLoading || isFetchingCoordinates}
              >
                {isFetchingCoordinates ? 'Fetching...' : 'Fetch Coordinates'}
              </Button>
            </div>
            {errors.locationLabel && <p className="text-red-500 text-sm mt-1">{errors.locationLabel}</p>}
            <p className="text-xs text-muted-foreground mt-1">Use fetch button to geocode this address before saving.</p>
            {formData.locationCoordinates && (
              <p className="text-xs text-green-700 mt-1">
                Coordinates: {formData.locationCoordinates[1].toFixed(6)}, {formData.locationCoordinates[0].toFixed(6)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              placeholder="e.g., https://example.com/hospital-image.jpg"
              value={formData.image || ''}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground mt-1">Paste a direct image URL (JPG, PNG, WebP)</p>
            {formData.image ? (
              <div className="mt-2 rounded-lg overflow-hidden border border-border max-w-xs">
                <img
                  src={resolveFacilityImage(formData.image)}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={onFacilityImageError}
                />
              </div>
            ) : null}
          </div>

          <div>
            <Label htmlFor="about">About/Description</Label>
            <Textarea
              id="about"
              name="about"
              placeholder="Describe the facility, specialties, services, etc."
              value={formData.about || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="doctorIds">
              Affiliated Doctor IDs (comma-separated)
            </Label>
            <Input
              id="doctorIds"
              name="doctorIds"
              placeholder="e.g., 60d5ec49c1234567890abc12, 60d5ec49c1234567890abc13"
              value={formData.doctorIds || ''}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground mt-1">Paste MongoDB doctor IDs separated by commas</p>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'} Facility
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
