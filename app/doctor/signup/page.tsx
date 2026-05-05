'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, MapPin, Clock, CalendarDays, LocateFixed } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { geocodeAddressWithMapbox, resolveCurrentLocation, type ResolvedLocation } from '@/lib/location'

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

type AvailabilityRange = {
  day: string
  startTime: string
  endTime: string
}

export default function DoctorSignup() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    clinicName: '',
    clinicAddress: '',
  })
  const [draftDays, setDraftDays] = useState<string[]>([])
  const [availabilityRanges, setAvailabilityRanges] = useState<AvailabilityRange[]>([])
  const [rangeDraft, setRangeDraft] = useState({ startTime: '', endTime: '' })
  const [locationPreview, setLocationPreview] = useState<ResolvedLocation | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'resolving' | 'ready' | 'fallback'>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const availableDays = useMemo(() => Array.from(new Set(availabilityRanges.map((range) => range.day))), [availabilityRanges])
  const availableHours = useMemo(
    () => availabilityRanges.map((range) => `${to12Hour(range.startTime)} - ${to12Hour(range.endTime)}`),
    [availabilityRanges]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleDraftDay = (day: string) => {
    setDraftDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]))
  }

  const syncLocationFromAddress = async (address: string) => {
    if (!address.trim()) {
      setLocationPreview(null)
      setLocationStatus('idle')
      return
    }

    const resolved = await geocodeAddressWithMapbox(address)
    if (resolved) {
      setLocationPreview(resolved)
      setLocationStatus('ready')
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      void syncLocationFromAddress(formData.clinicAddress)
    }, 700)

    return () => clearTimeout(debounce)
  }, [formData.clinicAddress])

  const handleUseCurrentLocation = async () => {
    setLocationStatus('resolving')
    const resolved = await resolveCurrentLocation()

    if (resolved) {
      setLocationPreview(resolved)
      setLocationStatus(resolved.source === 'ip' ? 'fallback' : 'ready')
      setFormData((prev) => ({
        ...prev,
        clinicAddress: resolved.label,
      }))
    } else {
      setLocationStatus('idle')
      setError('Unable to detect clinic location. Please enter the address manually.')
    }
  }

  const addAvailabilityRange = () => {
    if (draftDays.length === 0 || !rangeDraft.startTime || !rangeDraft.endTime) {
      setError('Select at least one day and both times to add a shift')
      return
    }
    if (rangeDraft.startTime >= rangeDraft.endTime) {
      setError('End time must be after start time')
      return
    }

    setAvailabilityRanges((prev) => [
      ...prev,
      ...draftDays.map((day) => ({
        day,
        startTime: rangeDraft.startTime,
        endTime: rangeDraft.endTime,
      })),
    ])
    setRangeDraft({ startTime: '', endTime: '' })
    setError('')
  }

  const removeAvailabilityRange = (index: number) => {
    setAvailabilityRanges((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const resolvedLocation = locationPreview || (formData.clinicAddress.trim()
        ? await geocodeAddressWithMapbox(formData.clinicAddress)
        : null)

      const schedule = {
        availableDays,
        availableHours,
      }

      const payloadLocation = resolvedLocation
        ? {
            label: resolvedLocation.label,
            coordinates: resolvedLocation.coordinates,
            clinicName: formData.clinicName || undefined,
            source: resolvedLocation.source,
          }
        : {
            label: formData.clinicAddress || formData.clinicName || 'Clinic location',
            coordinates: [0, 0] as [number, number],
            clinicName: formData.clinicName || undefined,
            source: 'manual' as const,
          }

      const res = await register({
        ...formData,
        role: 'doctor',
        location: payloadLocation,
        schedule,
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to sign up')
      }

      router.push('/doctor/verification')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#ffffff_50%,_#f8fafc)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 lg:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">SwiftCare Doctor Onboarding</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Create your doctor account with schedule and clinic location.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            The signup form now captures the fields your doctor model expects at onboarding: specialization, availability days, consultation hours, and clinic location with coordinates.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <CalendarDays className="h-5 w-5 text-blue-300" />
              <p className="mt-3 text-sm font-semibold">Availability Days</p>
              <p className="text-sm text-slate-300">Select Monday through Sunday as needed.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <MapPin className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold">Clinic Coordinates</p>
              <p className="text-sm text-slate-300">Use browser location first, then IP fallback if permission is denied.</p>
            </div>
          </div>
        </div>

        <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold text-slate-950">Doctor Signup</h2>
              <p className="text-sm text-slate-500">Join SwiftCare and publish your availability to patients.</p>
            </div>

            {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Dr. Ayesha Khan" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@clinic.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03xx-xxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Cardiology" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input id="clinicName" name="clinicName" value={formData.clinicName} onChange={handleInputChange} placeholder="SwiftCare Medical Center" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <CalendarDays className="h-4 w-4 text-blue-600" /> Availability Days
                  </h3>
                  <p className="text-sm text-slate-500">Pick one or more days for the shift you want to add next.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const active = draftDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDraftDay(day)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Selected days: {draftDays.length > 0 ? draftDays.join(', ') : 'None'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Clock className="h-4 w-4 text-blue-600" /> Consultation Hours
                  </h3>
                  <p className="text-sm text-slate-500">Add different shifts for the selected day(s) using the time range below.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input type="time" value={rangeDraft.startTime} onChange={(e) => setRangeDraft((prev) => ({ ...prev, startTime: e.target.value }))} />
                <Input type="time" value={rangeDraft.endTime} onChange={(e) => setRangeDraft((prev) => ({ ...prev, endTime: e.target.value }))} />
                <Button type="button" onClick={addAvailabilityRange} className="bg-slate-900 text-white hover:bg-slate-800">
                  Add Shift
                </Button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Example: select Monday and Wednesday, choose 09:00 to 12:00, then click Add Shift. Repeat for another shift if needed.
              </p>

              <div className="mt-4 space-y-2">
                {availabilityRanges.length === 0 ? (
                  <p className="text-sm text-slate-500">No availability added yet.</p>
                ) : availabilityRanges.map((range, index) => (
                  <div key={`${range.day}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{range.day}</p>
                      <p className="text-slate-600">{range.startTime} - {range.endTime}</p>
                    </div>
                    <button type="button" onClick={() => removeAvailabilityRange(index)} className="text-sm font-medium text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <MapPin className="h-4 w-4 text-blue-600" /> Clinic Location
                  </h3>
                  <p className="text-sm text-slate-500">Enter your clinic address, then auto-fetch coordinates from browser or IP fallback.</p>
                </div>
                <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={locationStatus === 'resolving'} className="gap-2">
                  {locationStatus === 'resolving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                  Use Current Location
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Clinic Address</Label>
                <Input
                  id="clinicAddress"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleInputChange}
                  placeholder="Clinic address or landmark"
                  required
                />
                <p className="text-xs text-slate-500">Mapbox geocoding is used when a public token is configured.</p>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Location preview</p>
                <p>{locationPreview?.label || formData.clinicAddress || 'No location detected yet'}</p>
                <p className="text-xs text-slate-500">
                  {locationPreview ? `Coordinates: ${locationPreview.coordinates[1].toFixed(6)}, ${locationPreview.coordinates[0].toFixed(6)}` : 'Coordinates will be attached to your doctor profile.'}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.specialization || availableDays.length === 0 || availabilityRanges.length === 0 || !formData.clinicAddress}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Create Doctor Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
