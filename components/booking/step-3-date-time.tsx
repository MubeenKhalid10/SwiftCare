"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const TIME_SLOTS = {
  morning: ["09:45", "10:45"],
  afternoon: ["09:45", "10:45"],
  evening: ["09:45", "10:45"],
}

export default function BookingStep3({ data, onNext, onBack }) {
  const [selectedDate, setSelectedDate] = useState(14)
  const [selectedTime, setSelectedTime] = useState("09:45")
  const [selectedPeriod, setSelectedPeriod] = useState("morning")

  const handleNext = () => {
    // Create a proper date string
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const fullDate = `${months[currentMonth]} ${selectedDate}, ${currentYear}`
    
    onNext({
      dateTime: {
        date: selectedDate,
        time: selectedTime,
        period: selectedPeriod,
        fullDate: fullDate,
      },
    })
  }

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getDaysArray = () => {
    const days = []
    const daysInMonth = getDaysInMonth(2026, 0)
    for (let i = 28; i <= 31; i++) days.push(i)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    for (let i = 1; i <= 7; i++) days.push(i)
    return days
  }

  const days = getDaysArray()
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 3 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 6 && <div className={`w-6 h-0.5 ${step < 3 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
          </div>
        ))}
      </div>

      {/* Booking Summary */}
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

      {/* Date & Time Selection */}
      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                <option>2026</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                <option>Jan</option>
              </select>
              <button className="px-3 py-2 border border-blue-500 rounded text-blue-600 text-sm font-semibold">
                Month
              </button>
              <button className="text-gray-400">Year</button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-600 mb-4">
                {weekDays.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 rounded transition ${
                      day === selectedDate ? "bg-blue-600 text-white" : day < 10 ? "text-gray-400" : "hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            {["morning", "afternoon", "evening"].map((period) => (
              <div key={period} className="space-y-2">
                <h4 className="font-semibold text-gray-900 capitalize">{period}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS[period].map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time)
                        setSelectedPeriod(period)
                      }}
                      className={`p-2 rounded transition text-sm font-semibold ${
                        selectedTime === time && selectedPeriod === period
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
          Add Basic Information
        </Button>
      </div>
    </div>
  )
}
