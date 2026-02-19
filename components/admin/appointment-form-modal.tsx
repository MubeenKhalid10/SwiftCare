'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Appointment } from '@/lib/types'

interface AppointmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Appointment>) => Promise<void>
  initialData?: Appointment | null
  isLoading?: boolean
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: AppointmentFormModalProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>(
    initialData || {
      patientName: '',
      doctorName: '',
      date: '',
      time: '',
      status: 'upcoming',
      type: 'Direct Visit',
      email: '',
      phone: '',
    }
  )

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
      setFormData(initialData || {
        patientName: '',
        doctorName: '',
        date: '',
        time: '',
        status: 'upcoming',
        type: 'Direct Visit',
        email: '',
        phone: '',
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
          <DialogTitle>{initialData ? 'Edit Appointment' : 'Add New Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              name="patientName"
              value={formData.patientName || ''}
              onChange={handleChange}
              placeholder="Patient name"
              required
            />
          </div>

          <div>
            <Label htmlFor="doctorName">Doctor Name</Label>
            <Input
              id="doctorName"
              name="doctorName"
              value={formData.doctorName || ''}
              onChange={handleChange}
              placeholder="Doctor name"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              name="time"
              placeholder="HH:MM AM/PM"
              value={formData.time || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Appointment Type</Label>
            <select
              id="type"
              name="type"
              value={formData.type || 'Direct Visit'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Direct Visit">Direct Visit</option>
              <option value="Video Call">Video Call</option>
              <option value="Audio Call">Audio Call</option>
              <option value="Chat">Chat</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status || 'upcoming'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="patient@example.com"
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
