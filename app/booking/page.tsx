"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BookingStep3 from "@/components/booking/step-3-date-time"
import BookingStep4 from "@/components/booking/step-4-basic-info"
import BookingStep5 from "@/components/booking/step-5-payment"
import BookingStep6 from "@/components/booking/step-6-confirmation"
import { getDoctorById, createAppointment, confirmPayment } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Doctor } from "@/lib/types"
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
  const isRegisteredDoctor = doctor?.accountStatus?.registered !== false

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
          // Extract schedule from nested structure or top-level fields
          const schedule = (data as any).schedule || {}
          const availableDays = schedule.availableDays || (data as any).availableDays || []
          const availableHours = schedule.availableHours || (data as any).availableHours || []
          
          console.log("[booking] Doctor data received:", { data, availableDays, availableHours })
          
          setBookingData(prev => ({
            ...prev,
            doctor: {
              id: data.id,
              name: data.name,
              specialty: data.specialty || "",
              rating: data.rating || 0,
              address: typeof (data.location) === "string"
                ? data.location
                : (data.location && (data.location.label || data.location.clinicName)) || "Location not specified",
              image: data.image || "",
              fee: data.fee || "$100",
              availableDays,
              availableHours,
              schedule: { availableDays, availableHours }, // Store full schedule object too
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
          bookingFor:
            bookingData.basicInfo?.patient === 'Self'
              ? (user?.name || 'Patient')
              : (bookingData.basicInfo?.patient || user?.name || 'Patient'),
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
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Doctor not found"}</p>
            <button
              onClick={() => router.push("/doctors")}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Browse Doctors
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isRegisteredDoctor) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-4">
              Not Registered
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Information only</h1>
            <p className="text-gray-600 mb-6">
              This doctor profile is available for information only and cannot be booked online.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push(`/doctor-profile?id=${doctor.id}`)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              >
                View Profile
              </button>
              <button
                onClick={() => router.push('/doctors')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Browse Doctors
              </button>
            </div>
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
        <main className="min-h-screen bg-white">{renderStep()}</main>
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
