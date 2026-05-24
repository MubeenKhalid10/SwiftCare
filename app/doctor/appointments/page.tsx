"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { useAuth } from "@/lib/auth-context"
import { getAppointmentsByDoctorId, getPatients, updateAppointmentStatus, nextQueuePatient, getQueueState } from "@/lib/api"
import type { Appointment } from "@/lib/types"
import { Loader2, Calendar, Search, CheckCircle, XCircle, Clock, Zap } from "lucide-react"
import { toast } from "sonner"
import { socket, connectSocket } from "@/lib/socket"
import { getAppointmentDisplayName, applyAppointmentStatusSync, upsertAppointmentStatusSync } from "@/lib/utils"

export default function DoctorAppointments() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [consultationNotes, setConsultationNotes] = useState<Record<string, string>>({})
  const [queueStates, setQueueStates] = useState<Record<string, number>>({})

  const getAppointmentKey = (apt: Appointment | any): string => String(apt?.id || apt?._id || '')
const FALLBACK_AVATAR = 'data:image/jpeg;base64,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';

  // Helper to normalize backend status values
  const normalizeStatus = (s?: string) => {
    const raw = String(s || '').trim().toLowerCase()
    if (raw === 'in progress' || raw === 'in-progress' || raw === 'inprogress' || raw === 'in_progress') return 'in_progress'
    return raw
  }

  const getAppointmentTimeValue = (apt: Appointment): number => {
    const fromDateTime = new Date(`${apt.date || ''} ${apt.time || ''}`).getTime()
    if (!Number.isNaN(fromDateTime)) return fromDateTime
    if (apt.fullDateIso) {
      const fromIso = new Date(apt.fullDateIso).getTime()
      if (!Number.isNaN(fromIso)) return fromIso
    }
    return Number.MAX_SAFE_INTEGER
  }

  // Set up socket listener for real-time queue updates
  useEffect(() => {
    if (!socket.connected) connectSocket()
    
    const onQueueUpdated = (data: { shiftId: string, currentServing: number }) => {
      setQueueStates(prev => ({ ...prev, [data.shiftId]: data.currentServing }))
    }
    
    socket.on('queueUpdated', onQueueUpdated)
    return () => { socket.off('queueUpdated', onQueueUpdated) }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [apts, patients] = await Promise.all([
        getAppointmentsByDoctorId(user!.id),
        getPatients(),
      ])

      const patientNameById = new Map(
        patients.map((p: any) => [String(p.id || p._id), p.name || "Unknown Patient"])
      )

      const enriched = apts.map((apt: any) => ({
        ...apt,
        // Prefer canonical patient name from patients list; otherwise normalize using helper
        patientName:
          patientNameById.get(String(apt.patientId)) ||
          getAppointmentDisplayName(apt) ||
          "Unknown Patient",
      }))

      setAppointments(applyAppointmentStatusSync(enriched))
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
      const normalizedNewStatus = normalizeStatus(newStatus)

      if (normalizedNewStatus === 'in_progress') {
        setAppointments(prev => prev.map(apt =>
          getAppointmentKey(apt) === String(id)
            ? { ...apt, status: 'In Progress' as Appointment['status'] }
            : apt
        ))

        const checkedInAppointment = appointments.find(apt => getAppointmentKey(apt) === String(id))
        if (checkedInAppointment?.shiftId && typeof checkedInAppointment.queueNumber === 'number') {
          setQueueStates(prev => ({
            ...prev,
            [String(checkedInAppointment.shiftId)]: checkedInAppointment.queueNumber as number,
          }))
        }

        upsertAppointmentStatusSync(String(id), {
          status: 'In Progress',
          shiftId: checkedInAppointment?.shiftId ? String(checkedInAppointment.shiftId) : undefined,
          queueNumber: typeof checkedInAppointment?.queueNumber === 'number' ? checkedInAppointment.queueNumber : undefined,
        })

        setFilter("active")
        toast.success("Appointment checked in")
        return
      }

      const notes = normalizedNewStatus === "completed" ? (consultationNotes[id] || "") : undefined
      const updated = await updateAppointmentStatus(id, normalizedNewStatus, notes)
      const updatedId = String((updated as any)._id || updated.id || id)
      setAppointments(prev => prev.map(apt =>
        getAppointmentKey(apt) === updatedId
          ? { ...apt, ...updated, status: (updated as any).status || normalizedNewStatus, consultationNotes: notes }
          : apt
      ))

      upsertAppointmentStatusSync(updatedId, {
        status: ((updated as any).status || normalizedNewStatus) as string,
        shiftId: updated.shiftId ? String(updated.shiftId) : undefined,
        queueNumber: typeof updated.queueNumber === 'number' ? updated.queueNumber : undefined,
      })

      if (normalizedNewStatus === 'in_progress' && updated.shiftId && typeof updated.queueNumber === 'number') {
        setQueueStates(prev => ({
          ...prev,
          [String(updated.shiftId)]: updated.queueNumber as number,
        }))
      }

      if (normalizedNewStatus === "completed") {
        setConsultationNotes(prev => {
          const updated = { ...prev }
          delete updated[id]
          return updated
        })
      }
      // Auto-switch to Active tab when checking in
      if (normalizedNewStatus === 'in_progress') {
        setFilter("active")
      }
      // Auto-switch to Completed tab when completing
      if (normalizedNewStatus === "completed") {
        setFilter("completed")
      }
      toast.success(`Appointment marked as ${newStatus}`)
      
        // Auto-advance queue when appointment is completed or cancelled
        if ((normalizedNewStatus === "completed" || normalizedNewStatus === "cancelled")) {
          const appointment = appointments.find(apt => getAppointmentKey(apt) === String(id))
          if (appointment && appointment.shiftId) {
            try {
              await nextQueuePatient(String(appointment.shiftId))
              // Queue state will be updated via socket event queueUpdated
            } catch (err: any) {
              const errMsg = err?.message || String(err)
              // Only log "Shift is not active" error silently - it's expected if shift ended
              if (!errMsg.includes("Shift is not active")) {
                console.error("Failed to advance queue:", err)
              }
              // Don't show error to user for expected cases
            }
          }
        }
    } catch (error) {
      toast.error("Failed to update appointment status")
    } finally {
      setActionLoading(null)
    }
  }

  // Group appointments by status based on the selected filter tab
  const filteredAppointments = appointments.filter(apt => {
    const patientName = getAppointmentDisplayName(apt)
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    const s = normalizeStatus(apt.status)

    if (filter === "upcoming") {
      return s === "pending"
    }

    if (filter === "active") {
      return s === "in_progress"
    }

    if (filter === "completed") {
      return s === "completed"
    }

    if (filter === "cancelled") {
      return s === "cancelled"
    }

    // "all" (or any fallback) shows all statuses.
    return true
  })

  const currentServingPositionByShift = useMemo(() => {
    const serving: Record<string, number> = {}

    appointments.forEach((apt) => {
      if (!apt.shiftId) return
      const status = normalizeStatus(apt.status)
      if (status !== 'in_progress') return

      const queueNum = typeof apt.queueNumber === 'number' ? apt.queueNumber : 0
      if (queueNum > 0) {
        serving[String(apt.shiftId)] = queueNum
      }
    })

    return serving
  }, [appointments])

    // Group filtered appointments by date
    const appointmentsByDate = filteredAppointments.reduce((groups, apt) => {
      const dateKey = apt.date || 'No Date'
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(apt)
      return groups
    }, {} as Record<string, Appointment[]>)

    // Sort dates and appointments within each date
    const sortedDateKeys = Object.keys(appointmentsByDate).sort((a, b) => {
      if (a === 'No Date') return 1
      if (b === 'No Date') return -1
      return new Date(a).getTime() - new Date(b).getTime()
    })

    const sortedAppointments = sortedDateKeys.flatMap(dateKey => {
      const aptsForDate = appointmentsByDate[dateKey]
      return aptsForDate.sort((a, b) => {
      const aQueue = typeof a.queueNumber === 'number' ? a.queueNumber : Number.MAX_SAFE_INTEGER
      const bQueue = typeof b.queueNumber === 'number' ? b.queueNumber : Number.MAX_SAFE_INTEGER

    if (aQueue !== bQueue) return aQueue - bQueue

    return getAppointmentDisplayName(a).localeCompare(getAppointmentDisplayName(b))
      })
    })

  // Count metrics for all appointments
  const upcomingCount = appointments.filter(a => normalizeStatus(a.status) === "pending").length
  const activeCount = appointments.filter(a => {
    const s = normalizeStatus(a.status)
    return s === 'in_progress'
  }).length
  const completedCount = appointments.filter(a => normalizeStatus(a.status) === "completed").length
  const cancelledCount = appointments.filter(a => normalizeStatus(a.status) === "cancelled").length
  const totalCount = appointments.length

  // Check if an appointment is currently being served
  const isCurrentlyServing = (apt: Appointment): boolean => {
    if (!apt.shiftId) return false
    const servingQueueNum = queueStates[String(apt.shiftId)] ?? currentServingPositionByShift[String(apt.shiftId)] ?? 0
    const aptQueueNum = typeof apt.queueNumber === 'number' ? apt.queueNumber : 0
    const s = normalizeStatus(apt.status)
    const isInProgress = s === 'in_progress'
    return servingQueueNum === aptQueueNum && isInProgress && aptQueueNum > 0
  }

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
                    <Button variant="default" onClick={() => setFilter("all")} className="flex items-center gap-2">
                      All <Badge variant="secondary" className="ml-1">{totalCount}</Badge>
                    </Button>
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
                  ) : sortedAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No appointments found.</p>
                      <p className="text-sm">When patients book, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sortedDateKeys.map((dateKey) => {
                        const aptsForDate = appointmentsByDate[dateKey]
                        const dateLabel = dateKey === 'No Date' ? 'No Date' : new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
                        
                        return (
                          <div key={dateKey}>
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-200">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <h3 className="text-lg font-bold text-gray-900">{dateLabel}</h3>
                              <Badge variant="outline" className="ml-auto">{aptsForDate.length} appointment{aptsForDate.length !== 1 ? 's' : ''}</Badge>
                            </div>
                            <div className="space-y-4 ml-8">
                              {aptsForDate.map((apt) => {
                        const appointmentKey = getAppointmentKey(apt)
                        const patientName = apt.patientName || "Unknown Patient"
                        const isActionLoading = actionLoading === appointmentKey

                        return (
                          <div key={appointmentKey} className="flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-xl hover:shadow-md transition-shadow bg-white" style={{ borderColor: isCurrentlyServing(apt) ? '#22c55e' : '#e5e7eb', backgroundColor: isCurrentlyServing(apt) ? '#f0fdf4' : 'white' }}>
                            <div className="flex items-start md:items-center gap-4 mb-4 md:mb-0 flex-1">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
  <img
    src={apt?.avatar || FALLBACK_AVATAR}
    alt={apt?.patientName}
    className="w-full h-full object-cover rounded-full"
    onError={(e) => {
      e.currentTarget.src = FALLBACK_AVATAR;
    }}
  />
</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-gray-900 text-lg">{patientName}</p>
                                  <span className="text-xs text-gray-400">ID: {appointmentKey.substring(0, 8)}</span>
                                  {isCurrentlyServing(apt) && (
                                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      Currently Serving
                                    </Badge>
                                  )}
                                  {(typeof apt.queueNumber === 'number' && apt.queueNumber > 0) && (
                                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                      Queue #{apt.queueNumber}
                                    </Badge>
                                  )}
                                          <Badge className={normalizeStatus(apt.status) === 'pending' ? 'bg-yellow-100 text-yellow-800' : normalizeStatus(apt.status) === 'in_progress' ? 'bg-green-100 text-green-800' : normalizeStatus(apt.status) === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                                            {normalizeStatus(apt.status) === 'pending' ? 'Pending' : normalizeStatus(apt.status) === 'in_progress' ? 'In Progress' : normalizeStatus(apt.status) === 'completed' ? 'Completed' : 'Cancelled'}
                                          </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center gap-1 font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                                    <Calendar className="w-3.5 h-3.5" />
                                            <span>{apt.time}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                  <span>Patient: <b>{patientName}</b></span>
                                  <span>•</span>
                                  <span>Problem: <b>{apt.problem || 'None specified'}</b></span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons based on Status */}
                            <div className="flex items-center gap-2 self-start md:self-center">
                              {normalizeStatus(apt.status) === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleUpdateStatus(appointmentKey, "Cancelled")}
                                    disabled={isActionLoading}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleUpdateStatus(appointmentKey, "In Progress")}
                                    disabled={isActionLoading}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Check-in
                                  </Button>
                                </>
                              )}

                              {normalizeStatus(apt.status) === 'in_progress' && (
                                <div className="w-full flex flex-col gap-3">
                                  <div className="w-full">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Consultation Notes</label>
                                    <textarea
                                      placeholder="Enter consultation notes for this appointment..."
                                      maxLength={500}
                                      value={consultationNotes[appointmentKey] || (apt as any).consultationNotes || ""}
                                      onChange={(e) => setConsultationNotes(prev => ({ ...prev, [appointmentKey]: e.target.value }))}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                      rows={3}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{(consultationNotes[appointmentKey] || '').length}/500 characters</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                                    onClick={() => handleUpdateStatus(appointmentKey, "Completed")}
                                    disabled={actionLoading === appointmentKey}
                                  >
                                    {actionLoading === appointmentKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Consultation (Check-out)"}
                                  </Button>
                                </div>
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
                                      {normalizeStatus(apt.status) === "completed" && (
                                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 pointer-events-none px-3 py-1">
                                          <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                        </Badge>
                                      )}

                                      {normalizeStatus(apt.status) === "cancelled" && (
                                        <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100 pointer-events-none px-3 py-1">
                                          <XCircle className="w-3 h-3 mr-1" /> Cancelled
                                        </Badge>
                                      )}
                            </div>
                          </div>
                              )
                            })}
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

