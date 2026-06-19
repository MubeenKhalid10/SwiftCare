"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { getDoctorUniquePatients } from "@/lib/api"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { toast } from "sonner"
import { LogoLoader } from "@/components/ui/logo-loader"
import { resolvePatientImage, onPatientImageError } from "@/lib/image-utils"

export default function DoctorMyPatients() {
  const { user, isLoading: authLoading } = useRequireAuth({ role: 'doctor' })
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader size={32} />
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span>Doctor</span>
                  <span>&gt;</span>
                  <span>Patients</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
              </div>

              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold">Patient Directory</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md border border-border/50">
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
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <Users className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-lg font-medium">No {filter} patients found.</p>
                      <p className="text-sm">Patients who have booked with you will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPatients.map((patient) => (
                        <div key={patient.id} className="border border-border/50 rounded-xl p-5 hover:shadow-lg hover:border-primary/20 transition duration-300 bg-card group">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
  <img
    src={resolvePatientImage(patient?.avatar, patient?.gender)}
    alt={patient?.name}
    className="w-full h-full object-cover rounded-full"
    onError={(e) => onPatientImageError(e, patient?.gender)}
  />
</div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-primary mb-0.5">ID: {patient.id.substring(0, 8)}</p>
                              <h3 className="font-bold text-foreground text-lg">{patient.name}</h3>
                            </div>
                          </div>

                          <div className="bg-muted rounded-lg p-3 text-sm text-foreground/80 mb-4 grid grid-cols-2 text-center divide-x border border-border/50">
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Age</span>
                              <span className="font-semibold">{patient.age}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Gender</span>
                              <span className="font-semibold">{patient.gender}</span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-foreground">First Visit</p>
                                <p className="text-xs">{patient.time || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-foreground">Location</p>
                                <p className="text-xs">{patient.location}</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Visits</p>
                              <p className="font-bold text-primary">{patient.totalVisits}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Last Booking</p>
                              <p className="font-semibold text-foreground text-sm">{patient.lastBooking}</p>
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
    </>
  )
}
