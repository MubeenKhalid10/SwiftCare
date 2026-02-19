"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const SERVICES = [
  { id: "echo", name: "Echocardiograms", price: "$310" },
  { id: "stress", name: "Stress tests", price: "$754" },
  { id: "heart", name: "Heart Catheterization", price: "$150" },
  { id: "echo2", name: "Echocardiograms", price: "$200" },
]

export default function BookingStep1({ data, onNext }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedServices, setSelectedServices] = useState(data.selectedServices || [])

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const handleNext = () => {
    onNext({ selectedSpecialty, selectedServices })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-4">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === 1 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 6 && <div className={`w-8 h-0.5 ${step === 1 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
          </div>
        ))}
      </div>

      {/* Doctor Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {data.doctor.image ? (
              <img src={data.doctor.image || "/placeholder.svg"} alt={data.doctor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-700 font-bold text-lg">
                {data.doctor.name?.split(' ').map(n => n[0]).join('') || 'DR'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{data.doctor.name || "Select a Doctor"}</h2>
              {data.doctor.rating > 0 && (
                <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <Star size={12} /> {data.doctor.rating}
                </div>
              )}
            </div>
            <p className="text-blue-600 text-sm">{data.doctor.specialty || "Specialty"}</p>
            <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
              <span>📍</span> {data.doctor.address || "Location not specified"}
            </p>
            {data.doctor.fee && (
              <p className="text-green-600 text-sm mt-1 font-semibold">Fee: {data.doctor.fee}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Specialty Selection */}
      <Card className="p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">Select Specialty</label>
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Specialty</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Psychiatry">Psychiatry</option>
        </select>
      </Card>

      {/* Services Selection */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-6">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedServices.includes(service.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  <p className="text-red-600 text-sm">{service.price}</p>
                </div>
                {selectedServices.includes(service.id) && (
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" className="px-8 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
          Select Appointment Type
        </Button>
      </div>
    </div>
  )
}
