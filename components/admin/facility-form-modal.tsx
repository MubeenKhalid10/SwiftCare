'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Facility } from '@/lib/types'

export interface FacilityFormData {
  name: string
  about: string
  image: string
  locationLabel: string
  doctorIds: string
}

const EMPTY_FORM: FacilityFormData = {
  name: '',
  about: '',
  image: '',
  locationLabel: '',
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
            <Input
              id="locationLabel"
              name="locationLabel"
              placeholder="e.g., 123 Main Street, City, Country"
              value={formData.locationLabel || ''}
              onChange={handleChange}
              className={errors.locationLabel ? 'border-red-500' : ''}
            />
            {errors.locationLabel && <p className="text-red-500 text-sm mt-1">{errors.locationLabel}</p>}
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
            <p className="text-xs text-gray-500 mt-1">Paste a direct image URL (JPG, PNG, WebP)</p>
            {formData.image && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%238b5cf6"%3EImage not found%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
            )}
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
            <p className="text-xs text-gray-500 mt-1">Paste MongoDB doctor IDs separated by commas</p>
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
