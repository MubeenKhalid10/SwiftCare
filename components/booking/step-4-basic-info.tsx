"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function BookingStep4({ data, user, onNext, onBack }) {
  // Pre-fill with user data if available
  const nameParts = user?.name?.split(' ') || ['', '']
  const [formData, setFormData] = useState(
    data.basicInfo && Object.keys(data.basicInfo).length > 0 ? data.basicInfo : {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(' ') || "",
      phone: "",
      email: user?.email || "",
      patient: "Self",
      symptoms: "",
      attachment: null,
      reasonForVisit: "",
      name: user?.name || "",
    },
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    onNext({ basicInfo: formData })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 4 ? "bg-teal-500 text-white" : step === 4 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 6 && <div className={`w-6 h-0.5 ${step < 4 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
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
          </div>
        </div>
      </Card>

      {/* Booking Summary */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Booking Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Doctor</p>
            <p className="font-semibold">{data.doctor.name || "Doctor"}</p>
          </div>
          <div>
            <p className="text-gray-600">Specialty</p>
            <p className="font-semibold">{data.doctor.specialty || "General"}</p>
          </div>
          <div>
            <p className="text-gray-600">Date & Time</p>
            <p className="font-semibold">{data.dateTime ? `${data.dateTime.time} ${data.dateTime.period}, ${data.dateTime.fullDate}` : "Not selected"}</p>
          </div>
          <div>
            <p className="text-gray-600">Appointment Type</p>
            <p className="font-semibold">{data.appointmentType || "Clinic"}</p>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Select Patient</label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Select</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Symptoms</label>
              <input
                type="text"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Attachment</label>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-semibold text-gray-900">Choose File</span>
              <span className="text-sm text-gray-600">No file chosen</span>
              <input type="file" className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Reason for Visit</label>
            <textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
          Select Payment
        </Button>
      </div>
    </div>
  )
}
