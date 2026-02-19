"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const APPOINTMENT_TYPES = [
  { id: "clinic", label: "Clinic", icon: "🏢" },
  { id: "video", label: "Video Call", icon: "📹" },
  { id: "audio", label: "Audio Call", icon: "☎️" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "home", label: "Home Visit", icon: "🏠" },
]

const CLINICS = [
  {
    id: 1,
    name: "AllCare Family Medicine",
    address: "3343 Private Lane, Valdosta",
    distance: "500 Meters",
  },
  {
    id: 2,
    name: "Vitalplus Clinic",
    address: "4223 Pleasant Hill Road, Miami, FL 33169",
    distance: "12 KM",
  },
  {
    id: 3,
    name: "Wellness Path Chiropractic",
    address: "418 Patton Lane, Garner, NC 27529, FL 33169",
    distance: "16 KM",
  },
]

export default function BookingStep2({ data, onNext, onBack }) {
  const [selectedType, setSelectedType] = useState(data.appointmentType || "clinic")
  const [selectedClinic, setSelectedClinic] = useState(data.clinic?.id || 1)

  const handleNext = () => {
    onNext({
      appointmentType: selectedType,
      clinic: CLINICS.find((c) => c.id === selectedClinic),
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 2 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 6 && <div className={`w-6 h-0.5 ${step < 2 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
          </div>
        ))}
      </div>

      {/* Doctor Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {data.doctor.image ? (
              <img src={data.doctor.image || "/placeholder.svg"} alt={data.doctor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-700 font-bold">
                {data.doctor.name?.split(' ').map(n => n[0]).join('') || 'DR'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{data.doctor.name || "Doctor"}</h2>
              {data.doctor.rating > 0 && (
                <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                  <Star size={10} className="inline mr-1" /> {data.doctor.rating}
                </div>
              )}
            </div>
            <p className="text-blue-600 text-sm">{data.doctor.specialty || "Specialist"}</p>
            <p className="text-gray-600 text-sm mt-1">📍 {data.doctor.address || "Location TBD"}</p>
            {data.doctor.fee && <p className="text-green-600 text-sm font-semibold">Fee: {data.doctor.fee}</p>}
          </div>
        </div>
      </Card>

      {/* Appointment Type Selection */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Appointment Type</h3>
        <div className="grid grid-cols-5 gap-3">
          {APPOINTMENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border-2 text-center transition ${
                selectedType === type.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <p className="text-sm font-semibold text-gray-900">{type.label}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Clinic Selection */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Clinics</h3>
        <div className="space-y-3">
          {CLINICS.map((clinic) => (
            <label
              key={clinic.id}
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:border-gray-300"
            >
              <input
                type="radio"
                name="clinic"
                value={clinic.id}
                checked={selectedClinic === clinic.id}
                onChange={(e) => setSelectedClinic(Number(e.target.value))}
                className="mr-4 w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{clinic.name}</p>
                <p className="text-sm text-gray-600">
                  {clinic.address} • {clinic.distance}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
          Select Date & Time
        </Button>
      </div>
    </div>
  )
}
