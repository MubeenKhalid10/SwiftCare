'use client'

import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LocateFixed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { GoogleSignInButton } from '@/components/google-signin-button'
import { geocodeAddressWithMapbox, resolveCurrentLocation } from '@/lib/location'
import { LogoLoader } from '@/components/ui/logo-loader'
import Image from "next/image"

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const to12Hour = (value: string) => {
  if (!value || !value.includes(':')) return value
  const [rawHour, rawMinute] = value.split(':')
  const hour = Number(rawHour)
  const minute = Number(rawMinute)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value

  const period = hour >= 12 ? 'PM' : 'AM'
  const convertedHour = hour % 12 || 12
  const paddedHour = String(convertedHour).padStart(2, '0')
  const paddedMinute = String(minute).padStart(2, '0')
  return `${paddedHour}:${paddedMinute} ${period}`
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [location, setLocation] = useState({
    clinicName: '',
    label: '',
    longitude: '',
    latitude: '',
  })
  const [selectedDay, setSelectedDay] = useState('')
  const [availabilityRanges, setAvailabilityRanges] = useState<{ day: string; startTime: string; endTime: string }[]>([])
  const [rangeDraft, setRangeDraft] = useState({ startTime: '', endTime: '' })
  const [isResolvingLocation, setIsResolvingLocation] = useState(false)
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false)
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const selectDay = (day: string) => {
    setSelectedDay(day)
  }

  const addAvailabilityRange = () => {
    if (!selectedDay || !rangeDraft.startTime || !rangeDraft.endTime) {
      toast.error('Select a day and both times to add availability')
      return
    }

    if (rangeDraft.startTime >= rangeDraft.endTime) {
      toast.error('End time must be after start time')
      return
    }

    if (availabilityRanges.some((range) => range.day === selectedDay)) {
      toast.error('A timing for this day already exists. Remove it to add a new one.')
      return
    }

    setAvailabilityRanges((prev) => [
      ...prev,
      {
        day: selectedDay,
        startTime: rangeDraft.startTime,
        endTime: rangeDraft.endTime,
      },
    ])
    setRangeDraft({ startTime: '', endTime: '' })
    setSelectedDay('')
  }

  const removeAvailabilityRange = (index: number) => {
    setAvailabilityRanges((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUseCurrentLocation = async () => {
    setIsResolvingLocation(true)
    try {
      const resolved = await resolveCurrentLocation()
      if (!resolved) {
        toast.error('Unable to detect location. Please enter it manually.')
        return
      }

      setLocation((prev) => ({
        ...prev,
        label: resolved.label,
        longitude: String(resolved.coordinates[0]),
        latitude: String(resolved.coordinates[1]),
      }))
      toast.success('Current location detected')
    } finally {
      setIsResolvingLocation(false)
    }
  }

  const handleFetchCoordinatesFromAddress = async () => {
    const label = location.label.trim()
    if (!label) {
      toast.error('Please enter clinic location first')
      return
    }

    setIsFetchingCoordinates(true)
    try {
      const resolved = await geocodeAddressWithMapbox(label)
      if (!resolved) {
        toast.error('Unable to fetch coordinates.')
        return
      }

      setLocation((prev) => ({
        ...prev,
        label: resolved.label,
        longitude: String(resolved.coordinates[0]),
        latitude: String(resolved.coordinates[1]),
      }))
      toast.success('Coordinates fetched successfully')
    } finally {
      setIsFetchingCoordinates(false)
    }
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
      if (!location.label.trim()) {
        toast.error('Please enter clinic address')
        return
      }

      if (availabilityRanges.length === 0) {
        toast.error('Please add availability for at least one day')
        return
      }
    }

    setIsLoading(true)

    try {
      const parsedLongitude = Number(location.longitude)
      const parsedLatitude = Number(location.latitude)
      const hasValidCoordinates = Number.isFinite(parsedLongitude) && Number.isFinite(parsedLatitude)

      const schedule = role === 'doctor'
        ? {
          availableDays: availabilityRanges.map((range) => range.day),
          availableHours: availabilityRanges.map((range) => `${to12Hour(range.startTime)} - ${to12Hour(range.endTime)}`),
        }
        : undefined

      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        location: role === 'doctor' ? {
          label: location.label.trim(),
          clinicName: location.clinicName.trim() || undefined,
          ...(hasValidCoordinates
            ? { coordinates: [parsedLongitude, parsedLatitude] as [number, number] }
            : {})
        } : undefined,
        schedule,
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
    <div className="min-h-screen flex relative">
      <Link href="/admin/login" className="absolute right-4 top-4 z-20">
        <Button type="button" variant="outline" className="bg-white/90 backdrop-blur hover:bg-white">
          Admin Login
        </Button>
      </Link>

      {/* Left Side - Form */}
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
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${role === 'doctor'
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900">Clinic Location</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={isResolvingLocation || isLoading}
                  className="w-full"
                >
                  {isResolvingLocation ? (
                    <>
                      <LogoLoader size={16} className="h-4 w-4 mr-2" />
                      Detecting location...
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-4 h-4 mr-2" />
                      Use Current Location
                    </>
                  )}
                </Button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Clinic Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., SwiftCare Medical Center"
                      value={location.clinicName}
                      onChange={(e) => setLocation(prev => ({ ...prev, clinicName: e.target.value }))}
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Clinic Location
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., City Central Clinic, 5th Ave"
                      value={location.label}
                      onChange={(e) => setLocation(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFetchCoordinatesFromAddress}
                        disabled={isLoading || isFetchingCoordinates || !location.label.trim()}
                        className="w-full"
                      >
                        {isFetchingCoordinates ? (
                          <>
                            <LogoLoader size={16} className="h-4 w-4 mr-2" />
                            Fetching coordinates...
                          </>
                        ) : (
                          'Fetch Coordinates'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter clinic address and click Fetch Coordinates, or use current location.</p>
                  </div>
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
                    <p className="text-xs text-gray-500 mt-1">auto-filled or enter manually</p>
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
                    <p className="text-xs text-gray-500 mt-1">auto-filled or enter manually</p>
                  </div>
                </div>
                <p className="text-xs text-amber-700">If coordinates are unavailable, registration will continue with clinic address and patients can still open directions by address.</p>
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-gray-900">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                      const active = selectedDay === day
                      const alreadyAdded = availabilityRanges.some((range) => range.day === day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => !alreadyAdded && selectDay(day)}
                          disabled={alreadyAdded}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            alreadyAdded
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                              : active
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500">Selected day: {selectedDay || 'None'}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={rangeDraft.startTime}
                        onChange={(e) => setRangeDraft((prev) => ({ ...prev, startTime: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        End Time
                      </label>
                      <Input
                        type="time"
                        value={rangeDraft.endTime}
                        onChange={(e) => setRangeDraft((prev) => ({ ...prev, endTime: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={addAvailabilityRange} className="bg-slate-900 text-white hover:bg-slate-800">
                        Add Timing
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {availabilityRanges.length === 0 ? (
                      <p className="text-sm text-gray-500">No availability added yet.</p>
                    ) : availabilityRanges.map((range, index) => (
                      <div key={`${range.day}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{range.day}</p>
                          <p className="text-gray-600">{range.startTime} - {range.endTime}</p>
                        </div>
                        <button type="button" onClick={() => removeAvailabilityRange(index)} className="text-sm font-medium text-red-600 hover:text-red-700">
                          Remove
                        </button>
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
                  <LogoLoader size={16} className="h-4 w-4 mr-2" />
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
             
            </div>
          </div>

          {/* Google Sign Up */}
          {role === 'patient' && (
             <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or continue with</span>
            <div className="mt-6">
              <GoogleSignInButton roleHint={role} text="signup_with" />
            </div>
              </div>
          )}

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
      {/* Right Side - Gradient Background */}
     <div className="text-center flex flex-col items-center">
    
    <h2 className="text-5xl font-bold text-white mb-4">
      SwiftCare
    </h2>
    
    <p className="text-blue-100 text-xl">
      Join thousands of patients and doctors
    </p>
    
    <p className="text-blue-100 mt-2">
      Experience healthcare like never before
    </p>
    {/* Image in center */}
    <img
      src="https://plus.unsplash.com/premium_vector-1682298570780-c416aa7b710f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D" // change path as needed
      alt="SwiftCare"
       className="w-full h-auto object-contain mt-8 rounded-2xl shadow-2xl"
    />

  </div>
</div>
)}
