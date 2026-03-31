"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { useAuth } from "@/lib/auth-context"
import { getDoctorUniquePatients } from "@/lib/api"
import { Loader2, Search, MapPin, Calendar, Users } from "lucide-react"
import { toast } from "sonner"

export default function DoctorMyPatients() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("active")
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user?.id) {
      fetchPatients()
    }
  }, [user?.id])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await getDoctorUniquePatients(user!.id)
      setPatients(data)
    } catch (err) {
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())

    // For 'active' we could say >0 visits. For 'inactive', maybe 0 visits (though our backend only returns those with >0).
    // To keep it simple based on the static UI:
    const matchesFilter = filter === "active" ? p.totalVisits > 0 : p.totalVisits === 0

    return matchesSearch && matchesFilter
  })

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
                  <span>My Patients</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
              </div>

              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold">Patient Directory</h2>
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

                  <div className="flex items-center gap-4 mb-6">
                    <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
                      Active <Badge className="ml-2" variant={filter === "active" ? "secondary" : "default"}>{patients.filter(p => p.totalVisits > 0).length}</Badge>
                    </Button>
                    <Button variant={filter === "inactive" ? "default" : "outline"} onClick={() => setFilter("inactive")}>
                      Inactive <Badge className="ml-2" variant={filter === "inactive" ? "secondary" : "default"}>0</Badge>
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No {filter} patients found.</p>
                      <p className="text-sm">Patients who have booked with you will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPatients.map((patient) => (
                        <div key={patient.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-100 transition duration-300 bg-white group">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                              🧑
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-blue-600 mb-0.5">ID: {patient.id.substring(0, 8)}</p>
                              <h3 className="font-bold text-gray-900 text-lg">{patient.name}</h3>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4 grid grid-cols-3 text-center divide-x border border-gray-100">
                            <div>
                              <span className="block text-xs text-gray-400 mb-1">Age</span>
                              <span className="font-semibold">{patient.age}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-400 mb-1">Gender</span>
                              <span className="font-semibold">{patient.gender}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-400 mb-1">Blood</span>
                              <span className="font-semibold">{patient.blood}</span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">First Visit</p>
                                <p className="text-xs">{patient.time || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">Location</p>
                                <p className="text-xs">{patient.location}</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Total Visits</p>
                              <p className="font-bold text-blue-600">{patient.totalVisits}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Last Booking</p>
                              <p className="font-semibold text-gray-900 text-sm">{patient.lastBooking}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
