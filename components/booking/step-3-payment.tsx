"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Loader2, CreditCard, Building2, Lock, MapPin } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { toast } from "sonner"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api-config"
import { resolveDoctorImage, onDoctorImageError } from "@/lib/image-utils"

// Initialize Stripe outside component to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const PAYMENT_METHODS = [
  { id: "card", name: "Credit Card", icon: CreditCard },
  { id: "clinic", name: "Pay at Clinic", icon: Building2 },
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
      setIsProcessing(true)
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
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PAYMENT_INTENT), {
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
            name: data.basicInfo?.patientName || data.patientName || "Swiftcare Patient",
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
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${step <= 3 ? "bg-primary text-white" : "bg-muted text-white"}`}
            >
              {step}
            </div>
            {step < 4 && <div className={`w-6 h-0.5 ${step < 3 ? "bg-primary" : "bg-muted"}`}></div>}
          </div>
        ))}
      </div>

      {/* Doctor Card */}
      <Card className="p-6 mb-6 border border-sky-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-icon-bg flex-shrink-0 flex items-center justify-center overflow-hidden">
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
              {data.doctor.averageRating > 0 && (
                <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-semibold text-center align-middle">
                  {data.doctor.averageRating.toFixed(1)} <Star size={10} className="inline ml-1 mb-[2px]" />
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

      <form onSubmit={handlePayment}>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card className="p-6 border border-sky-200">
              <h3 className="font-semibold text-foreground mb-6">Payment Options</h3>

              {/* Payment Methods */}
              <div className="flex gap-4 mb-8">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex-1 p-4 border-2 rounded-lg transition text-center ${selectedMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                    >
                      <div className="flex justify-center mb-2">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{method.name}</p>
                    </button>
                  )
                })}
              </div>

              {/* Card Form */}
              {selectedMethod === "card" && (
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg bg-card">
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
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    Payments are securely processed by Stripe.
                  </p>
                </div>
              )}
              {selectedMethod === "clinic" && (
                <div className="p-8 text-center border border-border rounded-xl bg-primary/5">
                  <div className="w-12 h-12 bg-icon-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Pay on Clinic</h4>
                  <p className="text-muted-foreground text-sm">You can pay the consultation fee at the reception when you arrive for your appointment.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="p-6 h-full flex flex-col border border-sky-200">
              <h3 className="font-semibold text-foreground mb-4">Booking Info</h3>

              <div className="space-y-3 mb-6 text-sm flex-1">
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
                  <p className="font-semibold">{data.dateTime ? `${data.dateTime.time} , ${data.dateTime.fullDate}` : "Not selected"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Appointment Type</p>
                  <p className="font-semibold">{data.appointmentType || "Clinic"}</p>
                </div>
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold text-foreground mb-4">Payment Info</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="font-semibold text-primary">{data.doctor.fee || "RS. 0"}</span>
                </div>
              </div>

              <div className="bg-primary text-white rounded-lg p-4 flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Amount to Pay</span>
                <span className="text-lg font-bold text-white">RS. {totalAmount}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing} className="px-8 bg-transparent">
            Back
          </Button>
          <Button type="submit" disabled={isProcessing || (selectedMethod === 'card' && !stripe)} className="bg-primary hover:bg-primary/90 px-8">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {selectedMethod === 'clinic' ? 'Confirming Booking...' : 'Processing...'}
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
