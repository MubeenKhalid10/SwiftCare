"use client"

import { Suspense, useState, useEffect } from "react"
import { Search, Plus, Download, FileText, Share2, Trash2, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import { RecordDetailModal } from "@/components/patient/record-detail-modal"
import { useAuth } from "@/lib/auth-context"
import { Doctor } from "@/lib/types"
import { getAppointmentsByPatientId, getDoctors } from "@/lib/api"

function MedicalRecordsContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("medical")
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({})
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return
      try {
        setIsLoading(true)
        const [appointmentsData, doctorsData] = await Promise.all([
          getAppointmentsByPatientId(user.id.toString()),
          getDoctors(),
        ])
        setAppointments(appointmentsData)

        // Create doctor lookup map
        const doctorMap: Record<string, Doctor> = {}
        doctorsData.forEach(doc => {
          doctorMap[doc.id || ''] = doc
        })
        setDoctors(doctorMap)
      } catch (err) {
        console.error("Failed to load data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const handleRefresh = async () => {
    if (!user?.id) return
    try {
      setIsRefreshing(true)
      const [appointmentsData, doctorsData] = await Promise.all([
        getAppointmentsByPatientId(user.id.toString()),
        getDoctors(),
      ])
      setAppointments(appointmentsData)
      const doctorMap: Record<string, Doctor> = {}
      doctorsData.forEach(doc => {
        doctorMap[doc.id || ''] = doc
      })
      setDoctors(doctorMap)
    } catch (err) {
      console.error("Failed to refresh data:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const normalizeStatus = (status?: string) => String(status || '').trim().toLowerCase()

  const isRecordStatus = (status?: string) => {
    const normalized = normalizeStatus(status)
    return normalized === 'completed' || normalized === 'cancelled'
  }

  const formatStatus = (status?: string) => {
    const normalized = normalizeStatus(status)
    if (normalized === 'completed') return 'Completed'
    if (normalized === 'cancelled') return 'Cancelled'
    return status || 'Unknown'
  }

  // Combine database records with past appointments
  const pastAppointments = appointments
    .filter((apt) => isRecordStatus(apt.status))
    .map((apt) => {
      const doctor = doctors[apt.doctorId]
      // Check for consultation notes - handle different field names
      const notes = apt.consultationNotes || apt.consultationNote || apt.notes || ""
      const comments = notes && notes.trim()
        ? notes
        : (normalizeStatus(apt.status) === "cancelled" ? "This appointment was cancelled." : "No consultation notes provided.")

      return {
        id: `#APT${apt.id?.substring(0, 8) || apt._id?.substring(0, 8)}`,
        name: normalizeStatus(apt.status) === "completed" ? "Consultation Notes" : `Appointment (${formatStatus(apt.status)})`,
        date: apt.date || new Date().toLocaleDateString(),
        time: apt.time || "N/A",
        recordFor: user?.name || 'Patient',
        comments,
        doctor: doctor?.name || apt.doctorName || "Unknown Doctor",
        avatar: doctor?.image || "/default-doctor.jpg",
        appointmentId: apt.id || apt._id,
        problem: apt.reasonForVisit || apt.problem || "Checkup",
        status: formatStatus(apt.status),
      }
    })

  const allRecords = [...pastAppointments]

  const filteredRecords = allRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  return (
      <div className="min-h-screen bg-white">
      <Header />

      {/* Page Title */}
        <div className="bg-gradient-to-r from-icon-bg to-icon-bg/50 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Medical Records</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reusable Sidebar */}
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid">
                    <TabsTrigger value="medical">Medical Records</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {/* Search and Refresh */}
                <div className="flex gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Record For</TableHead>
                          <TableHead>Notes / Comments</TableHead>
                          <TableHead>Doctor</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No medical records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRecords.map((record) => (
                            <TableRow key={record.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleViewDetails(record)}>
                              <TableCell className="text-blue-600 font-medium">
                                {record.id}
                              </TableCell>
                              <TableCell>{record.name}</TableCell>
                              <TableCell>{record.date}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={record.avatar} />
                                    <AvatarFallback>DR</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{record.recordFor}</p>
                                    {record.problem && <p className="text-xs text-gray-500">{record.problem}</p>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600 max-w-xs truncate">
                                {record.comments}
                              </TableCell>
                              <TableCell className="text-sm">{record.doctor}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>

                    <RecordDetailModal 
                      isOpen={isModalOpen} 
                      onClose={() => setIsModalOpen(false)} 
                      record={selectedRecord} 
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function MedicalRecordsPage() {
  return (
    <Suspense fallback={null}>
      <MedicalRecordsContent />
    </Suspense>
  )
}
