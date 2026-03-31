"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getBookableShifts, getAvailableSlots } from "@/lib/api"
import type { Shift } from "@/lib/types"
import { Loader2 } from "lucide-react"

function timeToMinutes(timeStr: string) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 0
  let hours = parseInt(match[1])
  const mins = parseInt(match[2])
  const period = match[3].toUpperCase()
  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0
  return hours * 60 + mins
}

export default function BookingStep3({ data, onNext, onBack }: any) {
  const doctorId = data.doctor.id
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoadingShifts, setIsLoadingShifts] = useState(true)

  const [selectedDayObj, setSelectedDayObj] = useState<any>(null)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("")
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    if (!doctorId) return
    setIsLoadingShifts(true)
    getBookableShifts(String(doctorId))
      .then((res) => {
        setShifts(res)
      })
      .catch(console.error)
      .finally(() => setIsLoadingShifts(false))
  }, [doctorId])

  // Map shifts to days
  const upcomingDays = useMemo(() => {
    const daysList = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check next 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      const dateString = d.toISOString().split('T')[0]
      
      const dayShifts = shifts.filter(s => s.date.split('T')[0] === dateString || s.date === dateString)
      const isAvailable = dayShifts.length > 0

      daysList.push({
        dateObj: d,
        date: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        dayName,
        isAvailable,
        dateString,
        shifts: dayShifts
      })
    }
    return daysList
  }, [shifts])

  // Default selection
  useEffect(() => {
    if (!selectedDayObj && upcomingDays.length > 0) {
      const firstAvailable = upcomingDays.find(d => d.isAvailable)
      if (firstAvailable) {
        setSelectedDayObj(firstAvailable)
      } else {
        setSelectedDayObj(upcomingDays[0])
      }
    }
  }, [upcomingDays, selectedDayObj])

  // Fetch available slots when day/shift changes
  useEffect(() => {
    if (selectedDayObj && selectedDayObj.isAvailable && selectedDayObj.shifts.length > 0) {
      const shiftToUse = selectedDayObj.shifts[0]
      setSelectedShift(shiftToUse)
      
      setIsLoadingSlots(true)
      getAvailableSlots(String(doctorId), selectedDayObj.dateString, shiftToUse._id || shiftToUse.id)
        .then((slots) => {
          setAvailableSlots(slots || [])
          if (slots && slots.length > 0) {
            setSelectedTime(slots[0])
            const mins = timeToMinutes(slots[0])
            if (mins < 12 * 60) setSelectedPeriod("morning")
            else if (mins < 17 * 60) setSelectedPeriod("afternoon")
            else setSelectedPeriod("evening")
          } else {
            setSelectedTime("")
            setSelectedPeriod("")
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSlots(false))
    } else {
      setAvailableSlots([])
      setSelectedTime("")
      setSelectedPeriod("")
    }
  }, [selectedDayObj, doctorId])

  const currentSlots = useMemo(() => {
    const grouped: { morning: string[], afternoon: string[], evening: string[] } = {
      morning: [],
      afternoon: [],
      evening: []
    }
    
    availableSlots.forEach((t: string) => {
      const mins = timeToMinutes(t)
      if (mins < 12 * 60) grouped.morning.push(t)
      else if (mins < 17 * 60) grouped.afternoon.push(t)
      else grouped.evening.push(t)
    })
    return grouped
  }, [availableSlots])

  const handleNext = () => {
    if (!selectedDayObj || !selectedTime || !selectedShift) return
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const fullDate = `${months[selectedDayObj.month]} ${selectedDayObj.date}, ${selectedDayObj.year}`
    
    onNext({
      dateTime: {
        date: selectedDayObj.date,
        time: selectedTime,
        period: selectedPeriod,
        fullDate: fullDate,
        dayName: selectedDayObj.dayName,
        shiftId: selectedShift._id || selectedShift.id,
        dateString: selectedDayObj.dateString,
      },
    })
  }

  // Generate calendar grid for current view month
  const viewMonth = selectedDayObj ? selectedDayObj.month : new Date().getMonth()
  const viewYear = selectedDayObj ? selectedDayObj.year : new Date().getFullYear()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  
  const calendarGrid = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarGrid.push(null)
  for (let i = 1; i <= daysInMonth; i++) {
    const match = upcomingDays.find(d => d.date === i && d.month === viewMonth && d.year === viewYear)
    calendarGrid.push(match || { date: i, isPast: true, isAvailable: false })
  }

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-gray-800">
                {monthNames[viewMonth]} {viewYear}
              </div>
            </div>

            {isLoadingShifts ? (
               <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
            ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-600 mb-4">
                  {weekDays.map((day) => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {calendarGrid.map((dayObj: any, idx) => {
                    if (!dayObj) return <div key={`pad-${idx}`} /> // empty padding
                    if (dayObj.isPast) return (
                      <div key={`past-${idx}`} className="p-2 text-gray-300 cursor-not-allowed">
                        {dayObj.date}
                      </div>
                    )
                    
                    const isSelected = selectedDayObj && selectedDayObj.date === dayObj.date && selectedDayObj.month === dayObj.month
                    
                    return (
                      <button
                        key={`day-${idx}`}
                        onClick={() => {
                          if (dayObj.isAvailable) setSelectedDayObj(dayObj)
                        }}
                        disabled={!dayObj.isAvailable}
                        className={`p-2 rounded transition ${
                          isSelected 
                            ? "bg-blue-600 text-white font-bold shadow-md" 
                            : dayObj.isAvailable 
                              ? "hover:bg-blue-50 text-blue-800 font-semibold" 
                              : "text-gray-300 cursor-not-allowed decoration-red-300"
                        }`}
                      >
                        {dayObj.date}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isLoadingSlots ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
            ) : !selectedDayObj?.isAvailable ? (
              <div className="flex items-center justify-center h-full text-gray-500 italic">
                No shifts available on this date.
              </div>
            ) : availableSlots.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  All slots are fully booked.
                </div>
            ) : (
              <>
                {(["morning", "afternoon", "evening"] as const).map((period) => {
                  const slots = currentSlots[period]
                  if (slots.length === 0) return null
                  
                  return (
                    <div key={period} className="space-y-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{period}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((time) => (
                          <button
                            key={time}
                            onClick={() => {
                              setSelectedTime(time)
                              setSelectedPeriod(period)
                            }}
                            className={`p-2 rounded transition text-sm font-semibold ${
                              selectedTime === time && selectedPeriod === period
                                ? "bg-teal-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedTime || !selectedShift}
          className="bg-blue-600 hover:bg-blue-700 px-8 disabled:opacity-50"
        >
          Add Basic Information
        </Button>
      </div>
    </div>
  )
}
