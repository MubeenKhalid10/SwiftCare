"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Calendar, Clock, MapPin, User } from "lucide-react"
import Link from "next/link"

export default function BookingStep6({ data, onBack }) {
  // Format the date and time for display
  const formatDateTime = () => {
    if (data.dateTime) {
      return `${data.dateTime.time} ${data.dateTime.period}, ${data.dateTime.fullDate}`
    }
    return "Date not selected"
  }

  // Get selected services names
  const getServicesDisplay = () => {
    if (data.selectedServices && data.selectedServices.length > 0) {
      return data.selectedServices.join(", ")
    }
    return "General Consultation"
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 6 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 6 && <div className={`w-6 h-0.5 bg-teal-500`}></div>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Confirmation Card */}
        <div className="md:col-span-2">
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed</h2>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {data.doctor.image ? (
                  <img src={data.doctor.image || "/placeholder.svg"} alt={data.doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-700 font-semibold text-sm">
                    {data.doctor.name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </span>
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-gray-700">
                  Your Booking has been Confirmed with <strong>{data.doctor.name || "Doctor"}</strong>. Please be on time, 
                  arriving <strong>15 minutes before</strong> your appointment.
                </p>
              </div>
            </div>

            {/* Doctor Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Doctor Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex items-center justify-center overflow-hidden">
                  {data.doctor.image ? (
                    <img src={data.doctor.image || "/placeholder.svg"} alt={data.doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-700 font-bold text-lg">
                      {data.doctor.name?.split(' ').map(n => n[0]).join('') || 'DR'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{data.doctor.name || "Doctor"}</p>
                  <p className="text-blue-600 text-sm">{data.doctor.specialty || "Specialist"}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {data.doctor.address || "Location not specified"}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4">Booking Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-white border rounded-lg p-3">
                <p className="text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" /> Specialty
                </p>
                <p className="font-semibold">{data.doctor.specialty || "General"}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-gray-600">Services</p>
                <p className="font-semibold">{getServicesDisplay()}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date & Time
                </p>
                <p className="font-semibold">{formatDateTime()}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-gray-600">Appointment Type</p>
                <p className="font-semibold">{data.appointmentType || "Clinic Visit"}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-gray-600">Consultation Fee</p>
                <p className="font-semibold text-blue-600">{data.doctor.fee || "$0"}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </p>
                <p className="font-semibold">{data.doctor.address || "To be confirmed"}</p>
              </div>
            </div>

            {/* Patient Info if available */}
            {data.basicInfo && Object.keys(data.basicInfo).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {data.basicInfo.name && (
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-semibold">{data.basicInfo.name}</p>
                      </div>
                    )}
                    {data.basicInfo.email && (
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold">{data.basicInfo.email}</p>
                      </div>
                    )}
                    {data.basicInfo.phone && (
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-semibold">{data.basicInfo.phone}</p>
                      </div>
                    )}
                    {data.basicInfo.reasonForVisit && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Reason for Visit</p>
                        <p className="font-semibold">{data.basicInfo.reasonForVisit}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Card className="p-4 bg-gray-50 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Need Our Assistance?</h4>
              <p className="text-sm text-gray-600 mb-3">Call us in case you face any issue with Booking or Cancellation</p>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <span>📞</span> Call Us
              </Button>
            </Card>
          </Card>

          <div className="flex justify-between">
            <Link href="/patient/appointments">
              <Button variant="outline" className="px-8 bg-transparent">
                ← Back to Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* QR Code & Actions */}
        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Number</h3>
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 text-center mb-4">
              <p className="text-green-600 font-mono text-lg font-bold">{data.bookingNumber || "DCRA" + Math.floor(10000 + Math.random() * 90000)}</p>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Appointment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{data.doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{data.dateTime?.fullDate || "TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{data.dateTime?.time} {data.dateTime?.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium text-blue-600">{data.doctor.fee}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 text-center mb-6">
              Please save your booking number for reference
            </p>

            <div className="space-y-3">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Add To Calendar</Button>
              <Link href="/doctors" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start New Booking</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
