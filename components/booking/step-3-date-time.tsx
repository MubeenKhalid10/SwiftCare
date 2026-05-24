"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSlotAvailability, getDoctorShiftsForBooking } from "@/lib/api"
import { Loader2 } from "lucide-react"
import type { Shift } from "@/lib/types"

type ShiftAvailability = {
  shiftId: string
  nextAvailableTime: string | null
  patientsBefore: number
}

interface AvailableDate {
  date: Date
  dateString: string
  dayName: string
  shifts: Shift[]
}

function getDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split('T')[0]
}

export default function BookingStep3({ data, onNext, onBack }: any) {
  const doctorSchedule = data.doctor || {}
  // Handle both nested schedule object and top-level fields
  const availableDays = (doctorSchedule as any).schedule?.availableDays || doctorSchedule.availableDays || []
  const availableHours = (doctorSchedule as any).schedule?.availableHours || doctorSchedule.availableHours || []
  
  console.log("[step3] Doctor availability:", { availableDays, availableHours, doctorSchedule })
  
  const [selectedDate, setSelectedDate] = useState<AvailableDate | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedShiftId, setSelectedShiftId] = useState<string>("")
  const [shiftAvailability, setShiftAvailability] = useState<Record<string, ShiftAvailability>>({})
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loadingShifts, setLoadingShifts] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

  // Generate available dates from actual generated shifts
  const availableDates = useMemo(() => {
    if (shifts.length === 0) return []
    
    const dateMap = new Map<string, AvailableDate>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 90)
    
    shifts.forEach((shift) => {
      const shiftDate = new Date(shift.date)
      if (Number.isNaN(shiftDate.getTime())) return
      shiftDate.setHours(0, 0, 0, 0)
      if (shiftDate < today || shiftDate > maxDate) return

      const dateString = getDateKey(shift.date)
      if (!dateString) return

      const dayName = shiftDate.toLocaleDateString('en-US', { weekday: 'long' })
      const existing = dateMap.get(dateString)

      if (existing) {
        existing.shifts.push(shift)
      } else {
        dateMap.set(dateString, {
          date: shiftDate,
          dateString,
          dayName,
          shifts: [shift]
        })
      }
    })

    return Array.from(dateMap.values()).sort((a, b) => a.dateString.localeCompare(b.dateString))
  }, [shifts])

  useEffect(() => {
    setSelectedTime("")
    setSelectedShiftId("")
  }, [selectedDate?.dateString])

  useEffect(() => {
    if (!selectedDate || !data.doctor.id || selectedDate.shifts.length === 0) {
      setShiftAvailability({})
      setSelectedTime("")
      setSelectedShiftId("")
      return
    }

    const fetchAvailability = async () => {
      try {
        setLoadingSlots(true)
        const entries = await Promise.all(
          selectedDate.shifts.map(async (shift) => {
            const shiftId = String(shift._id || shift.id || '')
            if (!shiftId) {
              return [shiftId, { shiftId: '', nextAvailableTime: null, patientsBefore: 0 }] as const
            }

            const res = await getSlotAvailability(String(data.doctor.id), selectedDate.dateString, shiftId)
            return [shiftId, { shiftId, nextAvailableTime: res.nextAvailableTime, patientsBefore: res.patientsBefore }] as const
          })
        )

        const nextAvailability: Record<string, ShiftAvailability> = {}
        entries.forEach(([shiftId, availability]) => {
          if (!shiftId) return
          nextAvailability[shiftId] = availability
        })

        setShiftAvailability(nextAvailability)

        const firstShift = selectedDate.shifts[0]
        const firstShiftId = String(firstShift?._id || firstShift?.id || '')
        const firstAvailability = firstShiftId ? nextAvailability[firstShiftId] : null
        setSelectedShiftId(firstShiftId)
        setSelectedTime(firstAvailability?.nextAvailableTime || "")
      } catch (err) {
        console.error("Failed to load queue availability:", err)
        setShiftAvailability({})
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailability()
  }, [selectedDate, data.doctor.id])

  useEffect(() => {
    if (!data.doctor.id) return

    const fetchShifts = async () => {
      try {
        setLoadingShifts(true)
        const fetched = await getDoctorShiftsForBooking(String(data.doctor.id))
        setShifts(fetched || [])
      } catch (err) {
        console.error("Failed to fetch shifts for booking:", err)
        setShifts([])
      } finally {
        setLoadingShifts(false)
      }
    }

    fetchShifts()
  }, [data.doctor.id])

  const handleNext = () => {
    if (!selectedDate || !selectedTime || !selectedShiftId) return
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const fullDate = `${months[selectedDate.date.getMonth()]} ${selectedDate.date.getDate()}, ${selectedDate.date.getFullYear()}`
    
    onNext({
      dateTime: {
        date: selectedDate.date.getDate(),
        time: selectedTime,
        period: getPeriod(selectedTime),
        fullDate: fullDate,
        dayName: selectedDate.dayName,
        dateString: selectedDate.dateString,
        shiftId: selectedShiftId,
      },
    })
  }

  const getPeriod = (timeStr: string): string => {
    try {
      const hours = parseInt(timeStr.split(':')[0])
      if (hours < 12) return "morning"
      else if (hours < 17) return "afternoon"
      else return "evening"
    } catch {
      return "morning"
    }
  }

  // Generate calendar grid for current view month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) {
    const match = availableDates.find(ad => ad.date.getDate() === i && ad.date.getMonth() === currentMonth && ad.date.getFullYear() === currentYear)
    const isPast = new Date(currentYear, currentMonth, i) < new Date(new Date().setHours(0, 0, 0, 0))
    calendarDays.push(match || { date: i, isPast, available: false })
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 1 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}>
              {step}
            </div>
            {step < 3 && <div className={`w-6 h-0.5 ${step < 1 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
          </div>
        ))}
      </div>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Booking Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Doctor</p>
            <p className="font-semibold text-gray-900">{data.doctor.name || "Doctor"}</p>
          </div>
          <div>
            <p className="text-gray-600">Specialty</p>
            <p className="font-semibold text-gray-900">{data.doctor.specialty || "General"}</p>
          </div>
          <div>
            <p className="text-gray-600">Appointment Type</p>
            <p className="font-semibold text-gray-900">{data.appointmentType || "Clinic"}</p>
          </div>
          <div>
            <p className="text-gray-600">Fee</p>
            <p className="font-semibold text-green-600">{data.doctor.fee || "$0"}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Date & Time</h3>
        
        {availableDays.length === 0 || availableHours.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-amber-800 font-semibold">No Availability Set</p>
            <p className="text-amber-700 text-sm mt-1">This doctor has not set their schedule yet.</p>
          </div>
        ) : loadingShifts ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : availableDates.length === 0 ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-800 font-semibold">No Generated Shifts</p>
            <p className="text-red-700 text-sm mt-1">This doctor has not generated shifts yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  ← Prev
                </button>
                <div className="font-bold text-lg text-gray-800">
                  {monthNames[currentMonth]} {currentYear}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Next →
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-600 mb-4">
                  {weekDays.map((day) => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {calendarDays.map((dayObj: any, idx) => {
                    if (!dayObj) return <div key={`pad-${idx}`} />
                    const dayLabel = dayObj.date instanceof Date ? dayObj.date.getDate() : dayObj.date
                    if (dayObj.isPast) return (
                      <div key={`past-${idx}`} className="p-2 text-gray-300 cursor-not-allowed">
                        {dayLabel}
                      </div>
                    )
                    
                    const isSelected = selectedDate && selectedDate.dateString === dayObj.dateString
                    const isAvail = dayObj.dateString !== undefined
                    
                    return (
                      <button
                        key={`day-${idx}`}
                        onClick={() => isAvail && setSelectedDate(dayObj)}
                        disabled={!isAvail}
                        className={`p-2 rounded transition relative ${
                          isSelected
                            ? "bg-blue-600 text-white font-bold shadow-md"
                            : isAvail
                              ? "hover:bg-blue-50 text-blue-800 font-semibold border-2 border-blue-300"
                              : "text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {dayLabel}
                        {isAvail && <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 text-xs text-gray-600 text-center">
                  <p><span className="text-green-500">●</span> Green dot = Available day</p>
                </div>
              </div>
            </div>

            {/* Queue Availability Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Queue Availability</h4>
              
              {!selectedDate ? (
                <div className="flex items-center justify-center h-40 text-gray-500 italic border border-gray-200 rounded-lg">
                  Select a date to see queue status
                </div>
              ) : loadingSlots ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  {selectedDate.shifts.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 italic">
                      No shifts available for this date
                    </div>
                  ) : (() => {
                    const shift = selectedDate.shifts[0]
                    const shiftId = String(shift?._id || shift?.id || '')
                    const availability = shiftId ? shiftAvailability[shiftId] : null
                    const nextTime = availability?.nextAvailableTime || null
                    const patientsBefore = availability?.patientsBefore ?? 0

                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Patients Before You</p>
                          <p className="text-lg font-semibold text-gray-900">{patientsBefore}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Time Slot</p>
                          <p className="text-lg font-semibold text-blue-700">{nextTime || "Fully booked"}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedDate || !selectedTime || !selectedShiftId || loadingSlots}
          className="bg-blue-600 hover:bg-blue-700 px-8 disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
