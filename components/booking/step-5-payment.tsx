"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Loader2 } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { toast } from "sonner"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

// Initialize Stripe outside component to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const PAYMENT_METHODS = [
  { id: "card", name: "Credit Card", icon: "💳" },
  { id: "clinic", name: "Pay at Clinic", icon: "🏥" },
]

function CheckoutForm({ data, onNext, onBack }: { data: any; onNext: (data: any) => void; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate total: fee only
  const consultationFee = parseInt(data.doctor.fee?.replace(/[^0-9]/g, '') || '0')
  const totalAmount = consultationFee

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedMethod === "clinic") {
      // Pay at Clinic doesn't require Stripe
      onNext({ payment: { method: "clinic", status: "pending" } })
      return
    }

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setIsProcessing(true)

    try {
      // 1. Create Payment Intent on the backend
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_INTENT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ensure amount is minimum acceptable for Stripe or use the calculated totalAmount
        body: JSON.stringify({ amount: Math.max(totalAmount, 150) }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const { clientSecret } = await response.json()

      // 2. Confirm the payment on the frontend with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: data.basicInfo?.name || data.patientName || "Swiftcare Patient",
            email: data.basicInfo?.email || "patient@example.com",
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!")
        onNext({ payment: { method: "stripe", paymentIntentId: paymentIntent.id } })
      } else {
        throw new Error("Payment was not successful")
      }
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-12 gap-2 text-sm">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 3 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              {step}
            </div>
            {step < 3 && <div className={`w-6 h-0.5 ${step < 3 ? "bg-teal-500" : "bg-gray-300"}`}></div>}
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
                {data.doctor.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{data.doctor.name || "Doctor"}</h2>
              {data.doctor.averageRating > 0 && (
                <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-semibold text-center align-middle">
                  {data.doctor.averageRating.toFixed(1)} <Star size={10} className="inline ml-1 mb-[2px]" />
                </div>
              )}
            </div>
            <p className="text-blue-600 text-sm">{data.doctor.specialty || "Specialist"}</p>
            <p className="text-gray-600 text-sm mt-1">📍 {data.doctor.address || "Location TBD"}</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handlePayment}>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Payment Options</h3>

              {/* Payment Methods */}
              <div className="flex gap-4 mb-8">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex-1 p-4 border-2 rounded-lg transition text-center ${selectedMethod === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
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
                  <div className="p-4 border border-gray-300 rounded-lg bg-white">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                    🔒 Payments are securely processed by Stripe.
                  </p>
                </div>
              )}
              {selectedMethod === "clinic" && (
                <div className="p-8 text-center border border-gray-300 rounded-xl bg-blue-50">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Pay on Clinic</h4>
                  <p className="text-gray-600 text-sm">You can pay the consultation fee at the reception when you arrive for your appointment.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="p-6 h-full flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Info</h3>

              <div className="space-y-3 mb-6 text-sm flex-1">
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

              <hr className="my-4" />

              <h3 className="font-semibold text-gray-900 mb-4">Payment Info</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-blue-600">{data.doctor.fee || "RS. 0"}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span className="text-gray-400">Booking Fee</span>
                  <span className="font-medium line-through">RS. 10</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span className="text-gray-400">Tax</span>
                  <span className="font-medium line-through">RS. 5</span>
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-lg p-4 flex items-center justify-between">
                <span className="font-semibold text-sm">Amount to Pay</span>
                <span className="text-lg font-bold">RS. {totalAmount}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing} className="px-8 bg-transparent">
            Back
          </Button>
          <Button type="submit" disabled={isProcessing || (selectedMethod === 'card' && !stripe)} className="bg-blue-600 hover:bg-blue-700 px-8">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              selectedMethod === 'clinic' ? 'Confirm Booking' : `Pay RS. ${totalAmount}`
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function BookingStep5(props: any) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
