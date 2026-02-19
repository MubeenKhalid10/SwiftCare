"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Calendar,
  Heart,
  MessageCircle,
  Phone,
  Video,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getAppointmentsByPatientId, getDoctors, getPatientById } from "@/lib/api"
import { Appointment, Patient, Doctor } from "@/lib/types"
import { PatientSidebar } from "@/components/patient/patient-sidebar"

export default function AppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/auth/login")
      return
    }

    async function fetchData() {
      if (!user?.id) return

      try {
        setIsLoading(true)
        setError(null)
        
        const [patientAppointments, doctorsData, patientData] = await Promise.all([
          getAppointmentsByPatientId(String(user.id)),
          getDoctors(),
          getPatientById(String(user.id)),
        ])
        
        setAppointments(patientAppointments)
        setDoctors(doctorsData)
        if (patientData) setPatient(patientData)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        console.error("Error loading appointments:", errorMsg)
        setError(`Failed to load appointments: ${errorMsg}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id && isAuthenticated) {
      fetchData()
    }
  }, [user?.id, isAuthenticated, authLoading, router, user?.role])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video Call":
        return <Video className="w-4 h-4" />
      case "Audio Call":
        return <Phone className="w-4 h-4 rotate-90" />
      case "Chat":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "upcoming") return apt.status === "upcoming"
    if (activeTab === "cancelled") return apt.status === "cancelled"
    if (activeTab === "completed") return apt.status === "completed"
    return true
  })

  const counts = {
    upcoming: appointments.filter((a) => a.status === "upcoming").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <span className="text-blue-600">●</span>
          <Link href="/patient/dashboard" className="text-gray-600 hover:text-gray-900">
            Patient
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Appointments</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">{error}</p>
            <p className="text-sm text-red-600 mt-1">
              Please make sure you're logged in with a valid account. If the problem persists, try refreshing the page.
            </p>
          </div>
        </div>
      )}

      {/* Loading Display */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading your appointments...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input placeholder="Search" className="pl-10 w-48" />
                    </div>
                    <Link href="/doctors">
                      <Button className="bg-blue-600 text-white h-10">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book New
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Tabs */}
                <div className="flex gap-4 mb-6 pb-4 border-b">
                  {(["upcoming", "cancelled", "completed"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          activeTab === tab
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                        <span className="ml-2">{counts[tab]}</span>
                      </button>
                    )
                  )}
                </div>

                {error && (
                  <div className="text-center py-12 text-red-600">
                    {error}
                  </div>
                )}

                {!isLoading && !error && (
                  <div className="space-y-3">
                    {filteredAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 flex-wrap"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={apt.avatar || "/placeholder.svg"} />
                          <AvatarFallback>DR</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex gap-2 flex-wrap mb-1">
                            <span className="font-bold text-sm">#{apt.id}</span>
                            <span className="font-medium">{apt.doctorName}</span>
                            <Badge
                              className={
                                apt.status === "upcoming"
                                  ? "bg-green-100 text-green-700"
                                  : apt.status === "completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {apt.status}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-600 flex gap-3 flex-wrap">
                            <span>{apt.date}</span>
                            <span>{apt.time}</span>
                            <span>{apt.doctorSpecialty}</span>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(apt.type)}
                              {apt.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-gray-600 cursor-pointer" />
                          {apt.status === "upcoming" && (
                            <Button className="bg-blue-600 text-white">
                              Attend
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>}

      <Footer />
    </div>
  )
}
