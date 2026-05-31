"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { Search, Heart, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LogoLoader } from "@/components/ui/logo-loader"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import { getDoctors } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { getFavouriteDoctorIds, migrateGuestFavouritesToPatient, toggleFavouriteDoctor } from "@/lib/utils"
import type { Doctor } from "@/lib/types"

function FavouritesContent() {
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [favouriteDoctorIds, setFavouriteDoctorIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDoctors() {
      try {
        const data = await getDoctors()
        setDoctors(data)
      } catch (err) {
        setError("Failed to load favourite doctors")
        console.error("Failed to load favourites:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctors()
  }, [])

  useEffect(() => {
    migrateGuestFavouritesToPatient(user?.id)
    setFavouriteDoctorIds(getFavouriteDoctorIds(user?.id))
  }, [user?.id])

  const favouriteDoctors = useMemo(() => {
    return doctors.filter((doc) => favouriteDoctorIds.includes(String(doc.id)))
  }, [doctors, favouriteDoctorIds])

  const filteredDoctors = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return favouriteDoctors.filter((doc) => {
      const name = doc.name?.toLowerCase?.() || ""
      const specialty = doc.specialty?.toLowerCase?.() || ""
      const location = typeof doc.location === 'string'
        ? doc.location.toLowerCase()
        : doc.location?.label?.toLowerCase?.() || ""

      return (
        name.includes(term) ||
        specialty.includes(term) ||
        location.includes(term)
      )
    })
  }, [favouriteDoctors, searchTerm])

  const removeFromFavourites = (doctorId: string | number) => {
    toggleFavouriteDoctor(doctorId, user?.id)
    setFavouriteDoctorIds(getFavouriteDoctorIds(user?.id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Favourites</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Favourites</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search favourites"
                  className="pl-10 w-56"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <LogoLoader size={32} className="h-8 w-8" />
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center py-12 text-red-600">{error}</div>
            )}

            {!isLoading && !error && filteredDoctors.length === 0 && (
              <div className="text-center py-12 bg-white border rounded-lg">
                <p className="text-gray-700 font-medium mb-2">No favourite doctors yet</p>
                <p className="text-sm text-gray-500 mb-4">Like a doctor from the doctors list and it will appear here.</p>
                <Link href="/doctors">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">Browse Doctors</Button>
                </Link>
              </div>
            )}

            {!isLoading && !error && filteredDoctors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition">
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={doctor.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"
                        }}
                      />
                      <button
                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow"
                        onClick={() => removeFromFavourites(doctor.id)}
                        aria-label="Remove from favourites"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <Link href={`/doctor-profile?id=${doctor.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                        {doctor.name}
                      </Link>
                      <p className="text-gray-600 text-sm">{doctor.specialty}</p>

                      <div className="flex items-center gap-1 mt-2 mb-3">
                        <span className="text-sm font-bold text-gray-900">{doctor.rating}</span>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(doctor.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({doctor.reviewCount || 0} reviews)</span>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 mb-3">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {typeof doctor.location === 'string' ? doctor.location : doctor.location?.label || 'Location not specified'}
                        </p>
                        <p>Fee: {doctor.fee}</p>
                      </div>

                      <Link href={`/booking?doctorId=${doctor.id}`}>
                        <Button className="w-full bg-blue-50 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white">
                          Book Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function FavouritesPage() {
  return (
    <Suspense fallback={null}>
      <FavouritesContent />
    </Suspense>
  )
}
