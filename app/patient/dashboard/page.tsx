"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Thermometer, Droplets, Activity, ChevronDown, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import { useAuth } from "@/lib/auth-context"
import { getAppointmentsByPatientId, getDoctors } from "@/lib/api"
import type { Appointment, Doctor } from "@/lib/types"

const chartData = [
  { day: "Mon", heartRate: 72, bloodPressure: 120 },
  { day: "Tue", heartRate: 68, bloodPressure: 118 },
  { day: "Wed", heartRate: 75, bloodPressure: 122 },
  { day: "Thu", heartRate: 80, bloodPressure: 125 },
  { day: "Fri", heartRate: 70, bloodPressure: 119 },
  { day: "Sat", heartRate: 65, bloodPressure: 116 },
  { day: "Sun", heartRate: 73, bloodPressure: 121 },
]

const appointmentsData = [
  {
    id: 1,
    doctor: "Dr. Edilain Hendry",
    specialty: "Dentist",
    date: "21 Mar 2024",
    time: "10:30 PM",
    avatar: "/doctor1.jpg",
  },
  {
    id: 2,
    doctor: "Dr. Juliet Gabriel",
    specialty: "Cardiologist",
    date: "22 Mar 2024",
    time: "10:30 PM",
    avatar: "/doctor2.jpg",
  },
]

const pastAppointmentsData = [
  {
    id: 1,
    doctor: "Dr. Edilain Hendry",
    specialty: "Dental Specialist",
    duration: "30 Min",
    date: "Thursday, Mar 2024",
    time: "Time - 04:00 PM - 04:30 PM (30 Min)",
    location: "Newyork, United States",
  },
]

const favoritesData = [
  { id: 1, name: "Dr. Edilain", specialty: "Endodontists", avatar: "/doctor3.jpg" },
  { id: 2, name: "Dr. Maloney", specialty: "Cardiologist", avatar: "/doctor4.jpg" },
  { id: 3, name: "Dr. Wayne", specialty: "Dental Specialist", avatar: "/doctor5.jpg" },
  { id: 4, name: "Dr. Maria", specialty: "Endodontists", avatar: "/doctor6.jpg" },
]

const dependentsData = [
  { id: 1, name: "Laura", relation: "Mother", age: "58 years 20 days", avatar: "/dependent1.jpg" },
  { id: 2, name: "Matthew", relation: "Father", age: "59 years 15 days", avatar: "/dependent2.jpg" },
]

const reportsData = [
  { id: "#AP1236", doctor: "Dr. Robert Womack", date: "21 Mar 2024, 10:30 AM", type: "Video call", status: "Upcoming" },
  {
    id: "#AP3456",
    doctor: "Dr. Patricia Cassidy",
    date: "28 Mar 2024, 11:40 AM",
    type: "Clinic Visit",
    status: "Completed",
  },
  { id: "#AP1246", doctor: "Dr. Kevin Evans", date: "02 Apr 2024, 09:20 AM", type: "Audio Call", status: "Completed" },
  {
    id: "#AP6789",
    doctor: "Dr. Lisa Heating",
    date: "15 Apr 2024, 04:10 PM",
    type: "Clinic Visit",
    status: "Executed",
  },
  { id: "#AP5699", doctor: "Dr. John Hammer", date: "10 May 2024, 06:00 AM", type: "Video Call", status: "Upcoming" },
]

const notificationsData = [
  { id: 1, icon: "📅", title: "Booking Confirmed on 21 Mar", description: "Just Now" },
  { id: 2, icon: "⭐", title: "There's a New Review for you", description: "6 Days ago" },
  { id: 3, icon: "📌", title: "You have Appointment with Ahh", description: "12:55 PM" },
  { id: 4, icon: "💳", title: "Sent an amount of $200 for an", description: "2 Days ago" },
  { id: 5, icon: "⭐", title: "You have a New Review for you", description: "6 Days ago" },
]

const menuItems = [
  { icon: "🏠", label: "Dashboard", active: true },
  { icon: "📅", label: "My Appointments", active: false },
  { icon: "⭐", label: "Favourites", active: false },
  { icon: "👥", label: "Dependants", active: false },
  { icon: "📋", label: "Medical Records", active: false },
  { icon: "💳", label: "Wallet", active: false },
  { icon: "📄", label: "Invoices", active: false },
  { icon: "💬", label: "Message", active: false, badge: "🟡" },
  { icon: "💓", label: "Vitals", active: false },
  { icon: "⚙️", label: "Settings", active: false },
  { icon: "🚪", label: "Logout", active: false },
]

export default function PatientDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'patient') {
        router.push('/auth/login')
        return
      }

      async function fetchData() {
        try {
          const [aptsData, docsData] = await Promise.all([
            getAppointmentsByPatientId(String(user?.id)),
            getDoctors(),
          ])
          setAppointments(aptsData)
          setDoctors(docsData)
        } catch (err) {
          console.error('Error fetching data:', err)
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [isAuthenticated, user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1">
        <Header />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm">
            <span className="text-blue-600">●</span>
            <span className="text-gray-600">Patient</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Dashboard</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900">Patient Dashboard</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Dashboard Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">●</span>
                <span className="text-sm text-gray-600">Hendrita</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Health Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium">Heart Rate</span>
                      </div>
                      <span className="font-bold">140 bpm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">Body Temperature</span>
                      </div>
                      <span className="font-bold">37.5 °C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Glucose Level</span>
                      </div>
                      <span className="font-bold">
                        70 - 90 <span className="text-xs text-gray-500">AS</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Blood Pressure</span>
                      </div>
                      <span className="font-bold">100 mg/dl</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">SpO2</span>
                      </div>
                      <span className="font-bold">96%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Report generated on last visit - 28 Mar 2024</p>
                </CardContent>
              </Card>

              {/* Overall Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Report</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray="169.65 226.2"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">95%</span>
                      <span className="text-xs text-gray-500">Your health is</span>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-700">Last visit 25 Mar 2024</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointments & Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Appointment Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Next appointment</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {"<"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {">"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {[19, 20, 21, 22, 23].map((day) => (
                      <div
                        key={day}
                        className={`p-2 text-center rounded cursor-pointer text-sm font-medium ${
                          day === 21 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {["Mon", "Tue", "Wed", "Thu", "Fri"][day - 19]}
                        </div>
                        {day}
                      </div>
                    ))}
                  </div>

                  {appointments.length > 0 ? (
                    appointments.slice(0, 3).map((apt) => {
                      const doctor = doctors.find(d => String(d.id) === String(apt.doctorId))
                      return (
                        <div key={apt.id} className="border-t pt-3">
                          <div className="flex gap-3 items-start mb-2">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={doctor?.image || "/placeholder.svg"} />
                              <AvatarFallback>{doctor?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{doctor?.name || 'Dr. Unknown'}</p>
                              <p className="text-xs text-gray-500">{doctor?.specialty || 'Specialty'}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                ● {new Date(apt.date).toLocaleDateString()} · {apt.time || 'TBD'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 h-8 bg-transparent">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                            <Button className="flex-1 h-8 bg-blue-600 text-white">Attend</Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No upcoming appointments</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analytics Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Analytics</CardTitle>
                    <span className="text-sm text-gray-600">Mar 14 - Mar 21 ▼</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="heart" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="heart">Heart Rate</TabsTrigger>
                      <TabsTrigger value="blood">Blood Pressure</TabsTrigger>
                    </TabsList>
                    <TabsContent value="heart">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="heartRate" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="blood">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="bloodPressure" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Past Appointments & Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Past Appointments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Past Appointments</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {"<"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {">"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pastAppointmentsData.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-sm">{apt.doctor}</p>
                          <p className="text-xs text-gray-500">{apt.specialty}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700">● 30 Min</Badge>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600 mb-3 border-t pt-3">
                        <p>
                          <strong>{apt.date}</strong>
                        </p>
                        <p>🕐 {apt.time}</p>
                        <p>📍 {apt.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8 bg-transparent">
                          Reschedule
                        </Button>
                        <Button className="flex-1 h-8 bg-blue-600 text-white">View Details</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 text-sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notificationsData.map((notif) => (
                    <div key={notif.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{notif.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-500">{notif.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Favourites & Dependents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Favourites */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Favourites</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 text-sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {favoritesData.map((doc) => (
                      <div key={doc.id} className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-2">
                          <AvatarImage src={doc.avatar || "/placeholder.svg"} />
                          <AvatarFallback>DR</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.specialty}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dependents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Dependant</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      + Add New
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dependentsData.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar>
                        <AvatarImage src={dep.avatar || "/placeholder.svg"} />
                        <AvatarFallback>DP</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{dep.name}</p>
                        <p className="text-xs text-gray-500">
                          {dep.relation} - {dep.age}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          💾
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          ⊘
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Reports */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg mb-4">Reports</CardTitle>
                <Tabs defaultValue="appointments" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="appointments" className="text-xs">
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="text-xs">
                      Medical Records
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions" className="text-xs">
                      Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="text-xs">
                      Invoices
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-blue-600 font-medium">{report.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>DR</AvatarFallback>
                              </Avatar>
                              {report.doctor}
                            </div>
                          </td>
                          <td className="py-3 px-4">{report.date}</td>
                          <td className="py-3 px-4">{report.type}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                report.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : report.status === "Executed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                              }
                            >
                              ● {report.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
