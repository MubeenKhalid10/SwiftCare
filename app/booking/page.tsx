"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BookingStep1 from "@/components/booking/step-1-specialty"
import BookingStep2 from "@/components/booking/step-2-appointment-type"
import BookingStep3 from "@/components/booking/step-3-date-time"
import BookingStep4 from "@/components/booking/step-4-basic-info"
import BookingStep5 from "@/components/booking/step-5-payment"
import BookingStep6 from "@/components/booking/step-6-confirmation"
import { getDoctorById, createAppointment, confirmPayment } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Doctor } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Loading from "./loading"

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const doctorId = searchParams.get("doctorId")
  
  const [currentStep, setCurrentStep] = useState(1) // Start from Step 1 (Date & Time)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState({
    doctor: {
      id: "" as string | number,
      name: "",
      specialty: "",
      rating: 0,
      address: "",
      image: "",
      fee: "$0",
      availableDays: [] as string[],
      availableHours: [] as string[],
    },
    selectedServices: [] as string[],
    appointmentType: "Clinic",
    clinic: null as string | null,
    dateTime: null as { date: number; time: string; period: string; fullDate: string; dayName?: string; shiftId?: string; dateString?: string } | null,
    basicInfo: {} as Record<string, string>,
    payment: null as { method: string; cardData?: Record<string, string>; paymentIntentId?: string } | null,
    bookingNumber: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/booking?doctorId=${doctorId}`)
      return
    }

    async function fetchDoctor() {
      if (!doctorId) {
        setError("No doctor selected")
        setIsLoading(false)
        return
      }

      try {
        const data = await getDoctorById(doctorId)
        if (data) {
          setDoctor(data)
          setBookingData(prev => ({
            ...prev,
            doctor: {
              id: data.id,
              name: data.name,
              specialty: data.specialty || "",
              rating: data.rating || 0,
              address: data.location || "Location not specified",
              image: data.image || "",
              fee: data.fee || "$100",
              availableDays: (data as any).availableDays || [],
              availableHours: (data as any).availableHours || [],
            },
          }))
        } else {
          setError("Doctor not found")
        }
      } catch (err) {
        setError("Failed to load doctor information")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId, isAuthenticated, router])

// Use actual shift ID passed from Step3

  const handleStepChange = async (step: number, data: Partial<typeof bookingData> | null = null) => {
    if (data) {
      setBookingData((prev) => ({ ...prev, ...data }))
    }
    
    // If moving to confirmation step, create the appointment
    if (step === 4 && user && doctor) {
      try {
        const bookingNumber = `DCRA${Math.floor(10000 + Math.random() * 90000)}`
        const appointmentDate = bookingData.dateTime?.dateString || bookingData.dateTime?.fullDate || new Date().toISOString().split('T')[0]
        
        // Parse the fee as a number for the amount field
        const feeAmount = parseInt(bookingData.doctor.fee?.replace(/[^0-9]/g, '') || '0')

        // Get the day name from the date
        const dateObj = new Date(appointmentDate)
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
        
        const apt = await createAppointment({
          patientId: String(user.id),
          doctorId: String(bookingData.doctor.id),
          doctorName: bookingData.doctor.name,
          shiftId: bookingData.dateTime?.shiftId || "",
          day: dayName,
          date: appointmentDate,
          time: bookingData.dateTime?.time || "10:00 AM",
          bookingFor: bookingData.basicInfo?.patient || "Self",
          problem: bookingData.basicInfo?.symptoms || bookingData.basicInfo?.reasonForVisit || "",
          amount: feeAmount,
          fullDateIso: dateObj.toISOString(),
          timestamp: new Date().toISOString(),
        })
        
        // Confirm payment in the backend to link paymentIntent to appointment
        if (bookingData.payment?.method === "stripe" && bookingData.payment?.paymentIntentId) {
          try {
            await confirmPayment({
              appointmentId: String(apt.id || apt._id),
              amount: feeAmount,
              paymentIntentId: bookingData.payment.paymentIntentId,
            })
          } catch (payErr) {
            console.error("Failed to confirm payment on backend:", payErr)
          }
        }
        
        setBookingData(prev => ({ ...prev, bookingNumber }))
      } catch (err: any) {
        console.error("Failed to create appointment:", err)
        toast.error(err.message || "Failed to book appointment")
        return // Stop progression on error
      }
    }
    
    setCurrentStep(step)
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  if (isLoading) {
    return null
  }

  if (error || !doctor) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Doctor not found"}</p>
            <button
              onClick={() => router.push("/doctors")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Doctors
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookingStep3 data={bookingData} onNext={(data: any) => handleStepChange(2, data)} onBack={() => router.push(`/doctor-profile?id=${doctorId}`)} />
      case 2:
        return <BookingStep4 data={bookingData} user={user} onNext={(data: any) => handleStepChange(3, data)} onBack={handleBack} />
      case 3:
        return <BookingStep5 data={bookingData} onNext={(data: any) => handleStepChange(4, data)} onBack={handleBack} />
      case 4:
        return <BookingStep6 data={bookingData} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">{renderStep()}</main>
      <Footer />
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingContent />
    </Suspense>
  )
}
