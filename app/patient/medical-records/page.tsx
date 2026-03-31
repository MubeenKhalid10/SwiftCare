"use client"

import { Suspense, useState, useEffect } from "react"
import { Search, Plus, Download, FileText, Share2, Trash2, Loader2 } from "lucide-react"
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


  // Combine database records with past appointments
  const pastAppointments = appointments
    .filter(apt => apt.status === "Completed" || apt.status === "Cancelled" || apt.status === "Absent")
    .map((apt) => {
      const doctor = doctors[apt.doctorId]
      return {
        id: `#APT${apt.id?.substring(0, 8) || apt._id?.substring(0, 8)}`,
        name: apt.status === "Completed" ? "Consultation Notes" : `Appointment (${apt.status})`,
        date: apt.date || new Date().toLocaleDateString(),
        time: apt.time || "N/A",
        recordFor: apt.bookingFor || "Self",
        comments: apt.consultationNotes || (apt.status === "Cancelled" ? "This appointment was cancelled." : "No specific notes provided."),
        doctor: doctor?.name || apt.doctorName || "Unknown Doctor",
        avatar: doctor?.image || "/default-doctor.jpg",
        appointmentId: apt.id || apt._id,
        problem: apt.reasonForVisit || apt.problem || "Checkup",
        status: apt.status,
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
          <span className="text-gray-900 font-medium">Medical Records</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
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
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="medical">Medical Records</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                          <TableHead>Action</TableHead>
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
                              <TableCell>
                                <div className="flex gap-2">
                                  <Download className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600" aria-label="Download" />
                                  <Share2 className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600" aria-label="Share" />
                                  <FileText className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600" aria-label="View Details" onClick={(e) => { e.stopPropagation(); handleViewDetails(record); }} />
                                  <Trash2 className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600" aria-label="Delete" onClick={(e) => e.stopPropagation()} />
                                </div>
                              </TableCell>
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
