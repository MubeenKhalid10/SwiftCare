'use client'

import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { GoogleSignInButton } from '@/components/google-signin-button'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
  })
  const [location, setLocation] = useState({
    label: '',
    longitude: '',
    latitude: '',
  })
  const [scheduleSlots, setScheduleSlots] = useState([{ day: 'Monday', hours: '09:00 AM - 05:00 PM' }])
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (role === 'doctor') {
      if (!location.label || !location.longitude || !location.latitude) {
        toast.error('Please fill in doctor location details')
        return
      }
      if (scheduleSlots.length === 0) {
        toast.error('Please add at least one schedule slot')
        return
      }
    }

    setIsLoading(true)

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        specialization: role === 'doctor' ? formData.specialization || 'General Physician' : undefined,
        location: role === 'doctor' ? {
          label: location.label,
          coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)] as [number, number]
        } : undefined,
        schedule: role === 'doctor' ? {
          availableDays: scheduleSlots.map(s => s.day),
          availableHours: scheduleSlots.map(s => s.hours),
        } : undefined,
      })

      if (!result.success) {
        toast.error(result.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      toast.success('Verification code sent to your email!')

      // Redirect to OTP verification page
      const params = new URLSearchParams({
        email: result.email || formData.email,
        role: result.role || role,
      })
      router.push(`/auth/verify-email?${params.toString()}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-4">SwiftCare</h2>
          <p className="text-blue-100 text-xl">Join thousands of patients and doctors</p>
          <p className="text-blue-100 mt-2">Experience healthcare like never before</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Register to access SwiftCare services</p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${role === 'patient'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${role === 'doctor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {role === 'doctor' && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-semibold text-gray-900 mb-2">
                  Specialization (Optional)
                </label>
                <Input
                  id="specialization"
                  type="text"
                  name="specialization"
                  placeholder="e.g., General Physician, Cardiologist, Dentist"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Defaults to 'General Physician' if left empty</p>
              </div>
            )}

            {role === 'doctor' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900">Clinic Location</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location Name / Address
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., City Central Clinic, 5th Ave"
                    value={location.label}
                    onChange={(e) => setLocation(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Longitude
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 74.3587"
                      value={location.longitude}
                      onChange={(e) => setLocation(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Latitude
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 31.5204"
                      value={location.latitude}
                      onChange={(e) => setLocation(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Weekly Schedule</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setScheduleSlots([...scheduleSlots, { day: 'Monday', hours: '09:00 AM - 05:00 PM' }])}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Slot
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {scheduleSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <select
                          className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm"
                          value={slot.day}
                          onChange={(e) => {
                            const newSlots = [...scheduleSlots]
                            newSlots[index].day = e.target.value
                            setScheduleSlots(newSlots)
                          }}
                          disabled={isLoading}
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <Input
                          className="flex-[2]"
                          placeholder="09:00 AM - 05:00 PM"
                          value={slot.hours}
                          onChange={(e) => {
                            const newSlots = [...scheduleSlots]
                            newSlots[index].hours = e.target.value
                            setScheduleSlots(newSlots)
                          }}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setScheduleSlots(scheduleSlots.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          disabled={isLoading || scheduleSlots.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Register as ${role === 'patient' ? 'Patient' : 'Doctor'}`
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign Up */}
          <div className="mt-6">
            <GoogleSignInButton roleHint={role} text="signup_with" />
          </div>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
