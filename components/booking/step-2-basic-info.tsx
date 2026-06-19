"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, MapPin } from "lucide-react"
import { resolveDoctorImage, onDoctorImageError } from "@/lib/image-utils"

import { User } from "@/lib/types"

interface BookingStep4Props {
  data: any
  user: User | null
  onNext: (data: any) => void
  onBack: () => void
}

export default function BookingStep4({ data, user, onNext, onBack }: BookingStep4Props) {
  // Pre-fill with user data if available
  const [formData, setFormData] = useState(
    data.basicInfo && Object.keys(data.basicInfo).length > 0 ? data.basicInfo : {
      patientName: user?.name || "",
      phone: (user as any)?.phone || "",
      email: user?.email || "",
      patient: "Self",
      reasonForVisit: "",
    },
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    onNext({ basicInfo: formData })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 2 ? "bg-primary text-white" : "bg-muted text-white"}`}
            >
              {step}
            </div>
            {step < 4 && <div className={`w-6 h-0.5 ${step < 2 ? "bg-primary" : "bg-muted"}`}></div>}
          </div>
        ))}
      </div>

      {/* Doctor Card */}
      <Card className="p-6 mb-6 border border-sky-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={resolveDoctorImage(data.doctor.image)}
              alt={data.doctor.name}
              className="w-full h-full object-cover"
              onError={onDoctorImageError}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{data.doctor.name || "Doctor"}</h2>
              {data.doctor.rating > 0 && (
                <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                  {data.doctor.rating} <Star size={10} className="inline ml-1 mb-[2px]" />
                </div>
              )}
            </div>
            <p className="text-primary text-sm">{data.doctor.specialty || "Specialist"}</p>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {data.doctor.address || "Location TBD"}
            </p>
          </div>
        </div>
      </Card>

      {/* Booking Summary */}
      <Card className="p-6 mb-6 border border-sky-200">
        <h3 className="font-semibold text-foreground mb-3">Booking Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
            <p className="text-muted-foreground">Doctor</p>
            <p className="font-semibold">{data.doctor.name || "Doctor"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Specialty</p>
            <p className="font-semibold">{data.doctor.specialty || "General"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Time & Date</p>
            <p className="font-semibold">
              {data.dateTime ? `${data.dateTime.time} ${data.dateTime.fullDate}` : "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Appointment Type</p>
            <p className="font-semibold">{data.appointmentType || "Clinic"} </p>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6 mb-6 border border-sky-200">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-2 border border-border/50 bg-muted rounded-lg text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground/60 mt-1">Email cannot be changed during booking</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Booking for</label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="Self">Self</option>
                <option value="Someone else">Someone else</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Reason for Visit (Optional)</label>
            <textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-32"
              placeholder="Briefly describe your reason for visit..."
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 px-8">
          Select Payment
        </Button>
      </div>
    </div>
  )
}
