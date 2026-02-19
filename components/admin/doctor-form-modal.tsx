'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Doctor } from '@/lib/types'

interface DoctorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Doctor>) => Promise<void>
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
  const [formData, setFormData] = useState<Partial<Doctor>>(
    initialData || {
      name: '',
      email: '',
      specialty: '',
      location: '',
      fee: '$0',
      experience: '0 years',
      rating: 0,
      available: true,
      phone: '',
      image: '',
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      setFormData(initialData || {
        name: '',
        email: '',
        specialty: '',
        location: '',
        fee: '$0',
        experience: '0 years',
        rating: 0,
        available: true,
        phone: '',
        image: '',
      })
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
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

          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              name="specialty"
              value={formData.specialty || ''}
              onChange={handleChange}
              placeholder="e.g., Cardiology"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="City/Address"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <Label htmlFor="fee">Consultation Fee</Label>
            <Input
              id="fee"
              name="fee"
              value={formData.fee || ''}
              onChange={handleChange}
              placeholder="$100"
            />
          </div>

          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              name="experience"
              value={formData.experience || ''}
              onChange={handleChange}
              placeholder="e.g., 5 years"
            />
          </div>

          <div>
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating || 0}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={formData.available || false}
              onChange={handleChange}
              className="rounded"
            />
            <Label htmlFor="available">Available</Label>
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
