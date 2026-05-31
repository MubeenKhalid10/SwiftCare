'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Doctor } from '@/lib/types'

export interface DoctorFormData {
  name: string
  email: string
  phone: string
  age: string
  gender: string
  specialization: string
  experience: string
  about: string
  image: string
  clinicName: string
  clinicLocation: string
  consultationFee: string
  availableDays: string
  availableHours: string
}

const EMPTY_FORM: DoctorFormData = {
  name: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  specialization: '',
  experience: '',
  about: '',
  image: '',
  clinicName: '',
  clinicLocation: '',
  consultationFee: '',
  availableDays: '',
  availableHours: '',
}

function buildFormFromDoctor(doctor?: Doctor | null): DoctorFormData {
  if (!doctor) return EMPTY_FORM

  const anyDoctor = doctor as any
  const schedule = anyDoctor.schedule || {}
  const locationObject = typeof anyDoctor.location === 'object' ? anyDoctor.location : undefined
  const feeText = anyDoctor.consultationFee != null
    ? String(anyDoctor.consultationFee)
    : doctor.fee
      ? doctor.fee.replace(/[^0-9.]/g, '')
      : ''

  return {
    name: doctor.name || '',
    email: doctor.email || anyDoctor.credentials?.email || '',
    phone: doctor.phone || anyDoctor.contactNo || '',
    age: doctor.age != null ? String(doctor.age) : '',
    gender: doctor.gender || '',
    specialization: doctor.specialty || doctor.specialization || anyDoctor.professionalInfo?.specialization || '',
    experience: String(doctor.experience || ''),
    about: doctor.about || '',
    image: doctor.image || '',
    clinicName: anyDoctor.clinicName || locationObject?.clinicName || '',
    clinicLocation: doctor.locationLabel || locationObject?.label || (typeof doctor.location === 'string' ? doctor.location : ''),
    consultationFee: feeText,
    availableDays: Array.isArray(schedule.availableDays) ? schedule.availableDays.join(', ') : '',
    availableHours: Array.isArray(schedule.availableHours) ? schedule.availableHours.join(', ') : '',
  }
}

interface DoctorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DoctorFormData) => Promise<void>
  initialData?: Doctor | null
  isLoading?: boolean
}

export function DoctorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DoctorFormModalProps) {
  const [formData, setFormData] = useState<DoctorFormData>(buildFormFromDoctor(initialData))

  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormFromDoctor(initialData))
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      setFormData(buildFormFromDoctor(initialData))
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold mb-3">Personal Information</h3>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Doctor name"
              required
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="doctor@example.com"
              required
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="+92..."
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                value={formData.age || ''}
                onChange={handleChange}
                placeholder="35"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                placeholder="Male / Female"
              />
            </div>
          </div>

          <div className="mt-3">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              name="specialization"
              value={formData.specialization || ''}
              onChange={handleChange}
              placeholder="e.g., Cardiology"
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              name="experience"
              value={formData.experience || ''}
              onChange={handleChange}
              placeholder="e.g., 8+ years"
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              name="about"
              value={formData.about || ''}
              onChange={handleChange}
              placeholder="Doctor profile/biography"
              rows={3}
            />
          </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold mb-3">Clinic Information</h3>

          <div>
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              name="clinicName"
              value={formData.clinicName || ''}
              onChange={handleChange}
              placeholder="Clinic name"
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="clinicLocation">Clinic Location Label</Label>
            <Input
              id="clinicLocation"
              name="clinicLocation"
              value={formData.clinicLocation || ''}
              onChange={handleChange}
              placeholder="City / Area"
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="consultationFee">Consultation Fee (RS)</Label>
            <Input
              id="consultationFee"
              name="consultationFee"
              type="number"
              min="0"
              step="1"
              value={formData.consultationFee || ''}
              onChange={handleChange}
              placeholder="2000"
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="availableDays">Available Days (comma separated)</Label>
            <Input
              id="availableDays"
              name="availableDays"
              value={formData.availableDays || ''}
              onChange={handleChange}
              placeholder="Mon, Tue, Wed"
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="availableHours">Available Hours (comma separated)</Label>
            <Input
              id="availableHours"
              name="availableHours"
              value={formData.availableHours || ''}
              onChange={handleChange}
              placeholder="09:00-12:00, 17:00-20:00"
            />
          </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
