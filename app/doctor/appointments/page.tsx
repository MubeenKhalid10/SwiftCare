"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { useAuth } from "@/lib/auth-context"
import { getAppointmentsByDoctorId, updateAppointmentStatus, getPatientById } from "@/lib/api"
import type { Appointment } from "@/lib/types"
import { Loader2, Calendar, Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

export default function DoctorAppointments() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const apts = await getAppointmentsByDoctorId(user!.id)
      setAppointments(apts)

      // Fetch patient details for each appointment
      const patientIds = Array.from(new Set(apts.map(a => a.patientId)))
      const patientData: Record<string, any> = {}

      await Promise.all(
        patientIds.map(async (id) => {
          const p = await getPatientById(id)
          if (p) patientData[id] = p
        })
      )
      setPatients(patientData)
    } catch (err) {
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: Appointment["status"]) => {
    if (!newStatus) return;
    
    try {
      setActionLoading(id)
      await updateAppointmentStatus(id, newStatus)
      setAppointments(prev => prev.map(apt =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      ))
      toast.success(`Appointment marked as ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update appointment status")
    } finally {
      setActionLoading(null)
    }
  }

  // Group appointments by status based on the selected filter tab
  const filteredAppointments = appointments.filter(apt => {
    const patientName = patients[apt.patientId]?.name || apt.patientName || ""
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filter === "upcoming") {
      return apt.status === "Pending"      // Hasn't started yet
    } else if (filter === "active") {
      return apt.status === "In Progress"  // Currently happening
    } else if (filter === "completed") {
      return apt.status === "Completed"    // Finished
    } else if (filter === "cancelled") {
      return apt.status === "Cancelled"    // Cancelled
    }
    return true
  })

  // Count metrics for badges
  const upcomingCount = appointments.filter(a => a.status === "Pending").length
  const activeCount = appointments.filter(a => a.status === "In Progress").length
  const completedCount = appointments.filter(a => a.status === "Completed").length
  const cancelledCount = appointments.filter(a => a.status === "Cancelled").length

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DoctorSidebar />
          <div className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Doctor</span>
                  <span>&gt;</span>
                  <span>Appointments</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              </div>

              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold">Manage Bookings</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                      <Search className="w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search patient..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none w-32 focus:w-48 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <Button variant={filter === "upcoming" ? "default" : "outline"} onClick={() => setFilter("upcoming")} className="flex items-center gap-2">
                      Upcoming <Badge variant={filter === "upcoming" ? "secondary" : "default"} className="ml-1">{upcomingCount}</Badge>
                    </Button>
                    <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")} className="flex items-center gap-2">
                      Active <Badge variant={filter === "active" ? "secondary" : "default"} className="ml-1 bg-green-500 text-white hover:bg-green-600">{activeCount}</Badge>
                    </Button>
                    <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")} className="flex items-center gap-2">
                      Completed <Badge variant={filter === "completed" ? "secondary" : "default"} className="ml-1">{completedCount}</Badge>
                    </Button>
                    <Button variant={filter === "cancelled" ? "default" : "outline"} onClick={() => setFilter("cancelled")} className="flex items-center gap-2">
                      Cancelled <Badge variant={filter === "cancelled" ? "secondary" : "default"} className="ml-1 bg-red-500 text-white hover:bg-red-600">{cancelledCount}</Badge>
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No {filter} appointments found.</p>
                      <p className="text-sm">When patients book, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map((apt) => {
                        const patient = patients[apt.patientId]
                        const patientName = patient?.name || apt.patientName || "Unknown Patient"
                        const isActionLoading = actionLoading === apt.id

                        return (
                          <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                            <div className="flex items-start md:items-center gap-4 mb-4 md:mb-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xl shrink-0">
                                🧑
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 text-lg">{patientName}</p>
                                  <span className="text-xs text-gray-400">ID: {apt.id?.substring(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center gap-1 font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{apt.date} • {apt.time}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                  <span>Type: <b>{apt.bookingFor || 'General Visit'}</b></span>
                                  <span>•</span>
                                  <span>Problem: <b>{apt.problem || 'None specified'}</b></span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons based on Status */}
                            <div className="flex items-center gap-2 self-start md:self-center">
                              {apt.status === "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleUpdateStatus(apt.id!, "Cancelled")}
                                    disabled={isActionLoading}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleUpdateStatus(apt.id!, "In Progress")}
                                    disabled={isActionLoading}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Check-in
                                  </Button>
                                </>
                              )}

                              {apt.status === "In Progress" && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                                  onClick={() => handleUpdateStatus(apt.id!, "Completed")}
                                  disabled={actionLoading === apt.id}
                                >
                                  {actionLoading === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Consultation (Check-out)"}
                                </Button>
                              )}

                              {apt.status === "Completed" && (
                                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 pointer-events-none px-3 py-1">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                </Badge>
                              )}

                              {apt.status === "Cancelled" && (
                                <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100 pointer-events-none px-3 py-1">
                                  <XCircle className="w-3 h-3 mr-1" /> Cancelled
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

