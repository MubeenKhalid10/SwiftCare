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
  X,
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
import { getAppointmentsByPatientId, getDoctors, getPatientById, getQueueState, updateAppointmentStatus, nextQueuePatient } from "@/lib/api"
import { toast } from 'sonner';
import { Appointment, Patient, Doctor } from "@/lib/types"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import { socket } from "@/lib/socket"

export default function AppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queueStates, setQueueStates] = useState<Record<string, number>>({})
  const [trackedShifts, setTrackedShifts] = useState<Set<string>>(new Set())
  const [reviewPopup, setReviewPopup] = useState<{show: boolean, appointmentId: string | null}>({show: false, appointmentId: null})

  const normalizeStatus = (status?: string) => String(status || '').trim().toLowerCase()
  const isUpcomingStatus = (status?: string) => {
    const normalized = normalizeStatus(status)
    return normalized === 'pending' || normalized === 'confirmed' || normalized === 'in progress' || normalized === 'in-progress' || normalized === 'inprogress' || normalized === 'in_progress'
  }
  const formatStatus = (status?: string) => {
    const normalized = normalizeStatus(status)
    if (normalized === 'in progress' || normalized === 'in-progress' || normalized === 'inprogress' || normalized === 'in_progress') return 'In Progress'
    if (normalized === 'pending') return 'Pending'
    if (normalized === 'confirmed') return 'Pending'
    if (normalized === 'completed') return 'Completed'
    if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled'
    return status || 'Pending'
  }

  const getQueueMetrics = (shiftId?: string, queueNumber?: number) => {
    if (!shiftId || typeof queueNumber !== 'number') {
      return { positionsAhead: null as number | null, estimatedWaitMinutes: null as number | null }
    }

    const currentServing = queueStates[shiftId] || 0
    const positionsAhead = Math.max(0, queueNumber - currentServing - 1)

    return {
      positionsAhead,
      estimatedWaitMinutes: positionsAhead * 10,
    }
  }

  const fetchData = async () => {
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

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/auth/login")
      return
    }

    if (user?.id && isAuthenticated) {
      fetchData()
    }
  }, [user?.id, isAuthenticated, authLoading, router, user?.role])

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onQueueUpdated = (data: { shiftId: string, currentServing: number }) => {
      setQueueStates(prev => ({
        ...prev,
        [data.shiftId]: data.currentServing
      }));
    };

    socket.on('queueUpdated', onQueueUpdated);

    return () => {
      socket.off('queueUpdated', onQueueUpdated);
    };
  }, []);

  useEffect(() => {
    const upcoming = appointments.filter(a => isUpcomingStatus(a.status));
    upcoming.forEach(async (apt) => {
      if (apt.shiftId) {
        socket.emit('joinQueueRoom', apt.shiftId);
        
        if (queueStates[apt.shiftId] === undefined) {
          try {
            const shiftId = apt.shiftId as string;
            const state = await getQueueState(shiftId);
            setQueueStates(prev => ({
              ...prev,
              [shiftId]: state.currentServing
            }));
          } catch (err) {
            console.error("Failed to fetch initial queue state:", err);
          }
        }
      }
    });
  }, [appointments.length]);

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
    const status = normalizeStatus(apt.status)
    if (activeTab === "upcoming") return isUpcomingStatus(apt.status)
    if (activeTab === "cancelled") return status === "cancelled" || status === "canceled"
    if (activeTab === "completed") return status === "completed"
    return true
  })

  const counts = {
    upcoming: appointments.filter((a) => isUpcomingStatus(a.status)).length,
    cancelled: appointments.filter((a) => {
      const status = normalizeStatus(a.status)
      return status === 'cancelled' || status === 'canceled'
    }).length,
    completed: appointments.filter((a) => normalizeStatus(a.status) === "completed").length,
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
                        className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab
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
                                isUpcomingStatus(apt.status)
                                  ? "bg-green-100 text-green-700"
                                  : normalizeStatus(apt.status) === "completed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }
                            >
                              {formatStatus(apt.status)}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-600 flex gap-3 flex-wrap">
                            <span>{apt.date}</span>
                            <span>{apt.time}</span>
                            <span>{apt.doctorSpecialty}</span>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(
                                typeof apt.type === "object" && apt.type !== null
                                  ? (apt.type as any).type
                                  : apt.type
                              )}
                              {typeof apt.type === "object" && apt.type !== null
                                ? (apt.type as any).type
                                : apt.type}
                            </span>
                          </div>
                          {isUpcomingStatus(apt.status) && apt.shiftId && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              {/* Queue Tracking */}
                              {!trackedShifts.has(apt.shiftId) ? (
                                <Button 
                                  className="h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex gap-2 items-center"
                                  onClick={() => {
                                    if (apt.shiftId) {
                                      setTrackedShifts(prev => new Set(prev).add(apt.shiftId as string));
                                    }
                                  }}
                                >
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                  Track Queue
                                </Button>
                              ) : (
                                (() => {
                                  const queueMetrics = getQueueMetrics(apt.shiftId, apt.queueNumber)

                                  return (
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl flex gap-8 items-center w-fit shadow-sm animate-in zoom-in-95 duration-200">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Currently Serving</span>
                                    <span className="text-2xl font-black text-blue-700 leading-none">{queueStates[apt.shiftId] || 0}</span>
                                  </div>
                                  <div className="w-px h-8 bg-blue-200" />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Ahead of You</span>
                                    <span className="text-2xl font-black text-indigo-700 leading-none">
                                      {queueMetrics.positionsAhead === null ? 'N/A' : queueMetrics.positionsAhead}
                                    </span>
                                  </div>
                                  <div className="w-px h-8 bg-blue-200" />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Est. Wait</span>
                                    <span className="text-2xl font-black text-emerald-700 leading-none">
                                      {queueMetrics.estimatedWaitMinutes === null ? 'N/A' : `${queueMetrics.estimatedWaitMinutes}m`}
                                    </span>
                                  </div>
                                  <button 
                                    className="ml-4 p-1.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                                    onClick={() => {
                                      if (apt.shiftId) {
                                        setTrackedShifts(prev => {
                                          const next = new Set(prev);
                                          next.delete(apt.shiftId as string);
                                          return next;
                                        });
                                      }
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                  )
                                })()
                              )}

                              {/* Cancellation Button Logic */}
                              {(() => {
                                // Default hide if missing info
                                if (!apt.date) return null;
                                
                                let aptTimeMs = 0;
                                if (apt.fullDateIso) {
                                  // Parse strict ISO string directly
                                  aptTimeMs = new Date(apt.fullDateIso).getTime();
                                } else {
                                  // Fallback parsing "Mar 14, 2026" + "10:00 AM" if fullDateIso is missing
                                  const dateStr = `${apt.date} ${apt.time || ""}`.trim();
                                  aptTimeMs = new Date(dateStr).getTime();
                                }

                                const nowMs = Date.now();
                                const isMoreThan2HoursOffline = (aptTimeMs - nowMs) > (2 * 60 * 60 * 1000);
                                
                                if (isMoreThan2HoursOffline && normalizeStatus(apt.status) === "pending") {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="text-xs ml-auto"
                                      onClick={async () => {
                                        if (confirm("Are you sure you want to cancel this appointment?")) {
                                          try {
                                            await updateAppointmentStatus(String(apt._id || apt.id), 'Cancelled');
                                            
                                              // Auto-advance queue when appointment is cancelled
                                              if (apt.shiftId) {
                                                try {
                                                  await nextQueuePatient(String(apt.shiftId));
                                                } catch (err) {
                                                  console.error("Failed to advance queue:", err);
                                                }
                                              }
                                            
                                            toast.success("Appointment cancelled successfully");
                                            fetchData();
                                          } catch (e: any) {
                                            toast.error(e.message || "Failed to cancel appointment");
                                          }
                                        }
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  )
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-gray-600 cursor-pointer" />
                                {normalizeStatus(apt.status) === "completed" && (
                            <Button 
                              className="bg-green-600 text-white"
                              onClick={() => setReviewPopup({show: true, appointmentId: String(apt.id)})}
                            >
                              Leave Review
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

      {/* Review Popup Modal */}
      {reviewPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                <p className="text-gray-600">Your appointment is complete! Would you like to leave a review for your doctor?</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Your feedback helps:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                    <li>Other patients make informed decisions</li>
                    <li>Doctors improve their services</li>
                    <li>Build a better healthcare community</li>
                  </ul>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReviewPopup({show: false, appointmentId: null})}
                >
                  Maybe Later
                </Button>
                <Button
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    const apt = appointments.find(a => String(a.id) === reviewPopup.appointmentId);
                    if (apt) {
                      router.push(`/doctor-profile?id=${apt.doctorId}#reviews`);
                      setReviewPopup({show: false, appointmentId: null});
                    }
                  }}
                >
                  Leave a Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
