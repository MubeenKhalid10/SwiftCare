"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const PAYMENT_METHODS = [
  { id: "card", name: "Credit Card", icon: "💳" },
  { id: "paypal", name: "Paypal", icon: "🅿️" },
  { id: "stripe", name: "Stripe", icon: "💰" },
]

export default function BookingStep5({ data, onNext, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [cardData, setCardData] = useState({
    cardHolder: "",
    cardNumber: "",
    expireDate: "",
    cvv: "",
  })

  const handleCardChange = (e) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    onNext({ payment: { method: selectedMethod, cardData } })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 5 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 6 && <div className={`w-6 h-0.5 ${step < 5 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
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

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Payment Form */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Payment Gateway</h3>

            {/* Payment Methods */}
            <div className="flex gap-4 mb-8">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex-1 p-4 border-2 rounded-lg transition text-center ${
                    selectedMethod === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <p className="text-sm font-semibold text-gray-900">{method.name}</p>
                </button>
              ))}
            </div>

            {/* Card Form */}
            {selectedMethod === "card" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Card Holder Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">👤</span>
                    <input
                      type="text"
                      name="cardHolder"
                      value={cardData.cardHolder}
                      onChange={handleCardChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">💳</span>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Expire Date</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">📅</span>
                      <input
                        type="text"
                        name="expireDate"
                        value={cardData.expireDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">CVV</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">🔐</span>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        placeholder="***"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Booking Summary */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Info</h3>

            <div className="space-y-3 mb-6 text-sm">
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
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-semibold">{data.doctor.address || "TBD"}</p>
              </div>
            </div>

            <hr className="my-4" />

            <h3 className="font-semibold text-gray-900 mb-4">Payment Info</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="font-semibold">{data.doctor.fee || "$0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Fee</span>
                <span className="font-semibold">$10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">$5</span>
              </div>
            </div>

            <div className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">
                ${(parseInt(data.doctor.fee?.replace(/[^0-9]/g, '') || '0') + 15).toFixed(0)}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 bg-transparent">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
          Confirm & Pay
        </Button>
      </div>
    </div>
  )
}
