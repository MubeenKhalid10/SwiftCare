'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Patient } from '@/lib/types'

export interface PatientFormData {
  name: string
  phone: string
  age: string
  gender: string
  image: string
  avatar: string
}

const EMPTY_FORM: PatientFormData = {
  name: '',
  phone: '',
  age: '',
  gender: '',
  image: '',
  avatar: '',
}

function buildFormFromPatient(patient?: Patient | null): PatientFormData {
  if (!patient) return EMPTY_FORM

  const anyPatient = patient as any

  return {
    name: patient.name || '',
    phone: patient.phone || '',
    age: String(patient.age ?? ''),
    gender: patient.gender || '',
    image: anyPatient.image || '',
    avatar: anyPatient.avatar || '',
  }
}

interface PatientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PatientFormData) => Promise<void>
  initialData?: Patient | null
  isLoading?: boolean
}

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState<PatientFormData>(buildFormFromPatient(initialData))

  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormFromPatient(initialData))
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setFormData(buildFormFromPatient(initialData))
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Patient name"
              required
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
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age || ''}
              onChange={handleChange}
              min="0"
              max="150"
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              name="avatar"
              value={formData.avatar || ''}
              onChange={handleChange}
              placeholder="https://..."
            />
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
