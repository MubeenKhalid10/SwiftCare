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
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { toast } from "sonner"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function DoctorMyPatients() {
  const { user } = useAuth()
  const [filter, setFilter] = useState("active")
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const FALLBACK_AVATAR = 'data:image/jpeg;base64,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';


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
                      <LogoLoader size={32} className="h-8 w-8" />
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
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
  <img
    src={patient?.avatar || FALLBACK_AVATAR}
    alt={patient?.name}
    className="w-full h-full object-cover rounded-full"
    onError={(e) => {
      e.currentTarget.src = FALLBACK_AVATAR;
    }}
  />
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
