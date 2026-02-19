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
import { getDoctorById, createAppointment } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Doctor } from "@/lib/types"
import { Loader2 } from "lucide-react"
import Loading from "./loading"

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const doctorId = searchParams.get("doctorId")
  
  const [currentStep, setCurrentStep] = useState(1)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState({
    doctor: {
      id: 0,
      name: "",
      specialty: "",
      rating: 0,
      address: "",
      image: "",
      fee: "$0",
    },
    selectedServices: [] as string[],
    appointmentType: "Clinic",
    clinic: null as string | null,
    dateTime: null as { date: number; time: string; period: string; fullDate: string } | null,
    basicInfo: {} as Record<string, string>,
    payment: null as { method: string; cardData: Record<string, string> } | null,
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
              specialty: data.specialty,
              rating: data.rating,
              address: data.location || "Location not specified",
              image: data.image || "",
              fee: data.fee || "$100",
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

  const handleStepChange = async (step: number, data: Partial<typeof bookingData> | null = null) => {
    if (data) {
      setBookingData((prev) => ({ ...prev, ...data }))
    }
    
    // If moving to confirmation step, create the appointment
    if (step === 6 && user && doctor) {
      try {
        const bookingNumber = `DCRA${Math.floor(10000 + Math.random() * 90000)}`
        const appointmentDate = bookingData.dateTime?.fullDate || new Date().toISOString().split('T')[0]
        
        // Map appointment type to correct format
        const typeMap: Record<string, "Video Call" | "Audio Call" | "Chat" | "Direct Visit"> = {
          'clinic': 'Direct Visit',
          'video': 'Video Call', 
          'audio': 'Audio Call',
          'chat': 'Chat',
          'home': 'Direct Visit',
        }
        
        await createAppointment({
          doctorId: bookingData.doctor.id,
          patientId: user.id,
          patientName: user.name,
          doctorName: bookingData.doctor.name,
          doctorSpecialty: bookingData.doctor.specialty,
          date: appointmentDate,
          time: `${bookingData.dateTime?.time || "10:00"} ${bookingData.dateTime?.period || "AM"}`,
          status: "upcoming",
          type: typeMap[bookingData.appointmentType.toLowerCase()] || "Direct Visit",
          email: bookingData.basicInfo?.email || user.email,
          phone: bookingData.basicInfo?.phone || "",
        })
        
        setBookingData(prev => ({ ...prev, bookingNumber }))
      } catch (err) {
        console.error("Failed to create appointment:", err)
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
        return <BookingStep1 data={bookingData} onNext={(data) => handleStepChange(2, data)} />
      case 2:
        return <BookingStep2 data={bookingData} onNext={(data) => handleStepChange(3, data)} onBack={handleBack} />
      case 3:
        return <BookingStep3 data={bookingData} onNext={(data) => handleStepChange(4, data)} onBack={handleBack} />
      case 4:
        return <BookingStep4 data={bookingData} user={user} onNext={(data) => handleStepChange(5, data)} onBack={handleBack} />
      case 5:
        return <BookingStep5 data={bookingData} onNext={(data) => handleStepChange(6, data)} onBack={handleBack} />
      case 6:
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
