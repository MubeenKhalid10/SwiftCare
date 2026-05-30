"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Search, MapPin, Heart, Grid3x3, List, Star, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { getDoctors } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { getFavouriteDoctorIds, migrateGuestFavouritesToPatient, toggleFavouriteDoctor } from "@/lib/utils"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import type { Doctor } from "@/lib/types"
import { resolveCurrentLocation } from "@/lib/location"
import { API_BASE_URL } from "@/lib/api-config"

function DoctorsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favouriteDoctorIds, setFavouriteDoctorIds] = useState<string[]>([])
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ label: string; coordinates: [number, number] } | null>(null)

  // Live filter state (user input)
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [selectedGender, setSelectedGender] = useState<string>("")
  const [selectedExperience, setSelectedExperience] = useState<string>("")
  const [selectedRating, setSelectedRating] = useState<string>("")

  // Applied filter state (used for filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    location: "",
    priceRange: [0, 10000] as number[],
    selectedSpecialty: "",
    selectedGender: "",
    selectedExperience: "",
    selectedRating: "",
    sortBy: "Rating (High to Low)",
  })

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setIsLoading(true)
        const ratingValue = selectedRating ? parseInt(selectedRating.charAt(0)) : undefined
        const sortBy = appliedFilters.sortBy === 'Rating (High to Low)' ? 'rating' : undefined
        
        const data = await getDoctors(ratingValue, sortBy, true)
        setDoctors(data)
      } catch (err) {
        setError("Failed to load doctors")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [appliedFilters.selectedRating, appliedFilters.sortBy])

  useEffect(() => {
    migrateGuestFavouritesToPatient(user?.id)
    setFavouriteDoctorIds(getFavouriteDoctorIds(user?.id))
  }, [user?.id])

  useEffect(() => {
    let active = true

    resolveCurrentLocation()
      .then((location) => {
        if (active) {
          setCurrentLocation(location)
        }
      })
      .catch(() => {
        if (active) {
          setCurrentLocation(null)
        }
      })

    return () => {
      active = false
    }
  }, [])

  // Initialize filters from query parameters
  useEffect(() => {
    const specialization = searchParams.get('specialization')
    const search = searchParams.get('search')
    
    const newFilters = { ...appliedFilters }
    
    if (specialization) {
      setSelectedSpecialty(decodeURIComponent(specialization))
      newFilters.selectedSpecialty = decodeURIComponent(specialization)
    }
    
    if (search) {
      setSearchTerm(decodeURIComponent(search))
      newFilters.searchTerm = decodeURIComponent(search)
    }
    
    if (specialization || search) {
      setAppliedFilters(newFilters)
    }
  }, [searchParams])

  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      location,
      priceRange,
      selectedSpecialty,
      selectedGender,
      selectedExperience,
      selectedRating,
      sortBy: appliedFilters.sortBy // keep current sort or add state for it
    })
  }



  // Filtering uses applied filters only
  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.name?.toLowerCase() || ""
    const specialty = doc.specialty?.toLowerCase() || ""
    const docLocation = typeof doc.location === "string" ? doc.location.toLowerCase() : ""

    const matchesSearch =
      appliedFilters.searchTerm === "" ||
      name.includes(appliedFilters.searchTerm.toLowerCase()) ||
      specialty.includes(appliedFilters.searchTerm.toLowerCase())

    const matchesLocation =
      appliedFilters.location === "" ||
      docLocation.includes(appliedFilters.location.toLowerCase())

    const fee = parseInt(doc.fee?.replace(/[^0-9]/g, "") || "0")

    const matchesPrice =
      fee >= appliedFilters.priceRange[0] &&
      fee <= appliedFilters.priceRange[1]

    const matchesSpecialty =
      appliedFilters.selectedSpecialty === "" ||
      (doc.specialty && doc.specialty === appliedFilters.selectedSpecialty)

    const normalizedGender = String(doc.gender || '').trim().toLowerCase()
    const selectedGenderValue = appliedFilters.selectedGender
    const matchesGender =
      selectedGenderValue === "" ||
      normalizedGender === selectedGenderValue.toLowerCase();

    const docExp = parseInt(doc.experience || "0");
    const matchesExperience =
      appliedFilters.selectedExperience === "" ||
      (appliedFilters.selectedExperience === "0 - 5 Years" ? docExp <= 5 : docExp > 5);

    const docRating = doc.averageRating || 0;
    const matchesRating =
      appliedFilters.selectedRating === "" ||
      docRating >= parseInt(appliedFilters.selectedRating.charAt(0));

    return (
      matchesSearch &&
      matchesLocation &&
      matchesPrice &&
      matchesSpecialty &&
      matchesGender &&
      matchesExperience &&
      matchesRating
    )
  })

  const specialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean)

  const handleToggleFavourite = (doctorId: string | number) => {
    toggleFavouriteDoctor(doctorId, user?.id)
    setFavouriteDoctorIds(getFavouriteDoctorIds(user?.id))
  }

  const genders = ["Male", "Female"]
  const experiences = ["0 - 5 Years", "5+ Years"]
  const ratings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]

  const isDoctorRegistered = (doctor: Doctor) => doctor.accountStatus?.registered !== false


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Title */}
      <div className="bg-gradient-to-r from-icon-bg to-icon-bg/50 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Doctors</h1>

          {/* Search Bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Input
                placeholder="Search for Doctors, Specialties"
                className="w-full border-gray-300 pl-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-white px-4 rounded-lg border border-gray-300">
              <MapPin className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Location (for nearby search)"
                className="border-0 pl-0 w-32"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={async () => {
                  // Geocode location for nearby doctors search
                  if (location && location.trim()) {
                    try {
                      const { geocodeAddress } = await import('@/lib/geocode');
                      const coords = await geocodeAddress(location);
                      if (coords) {
                        console.log(`📍 Location "${location}" geocoded to:`, coords);
                        // Coordinates can be used for nearby doctor filtering
                      }
                    } catch (err) {
                      console.warn('Location geocoding unavailable', err);
                    }
                  }
                }}
              />
              <Button
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/5 gap-2"
                    onClick={() => setIsMapOpen(true)}
                  >
                    <Map className="w-4 h-4" />
                    Nearby Doctors' Map
                  </Button>
            </div>
            <Button onClick={applyFilters} className="bg-primary text-white hover:bg-primary-600 gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 ${user?.role === 'patient' ? 'lg:grid-cols-4' : ''} gap-8`}>
          {user?.role === 'patient' && (
            <div className="lg:col-span-1 border rounded-xl overflow-hidden shadow-sm">
              <PatientSidebar />
            </div>
          )}

          <div className={`flex flex-col gap-8 ${user?.role === 'patient' ? 'lg:col-span-3' : ''}`}>
            {/* Horizontal Filters Panel */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">Filters</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">Refine results</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-4 text-sm"
                    onClick={() => {
                      setSelectedSpecialty("")
                      setSelectedGender("")
                      setSelectedExperience("")
                      setSelectedRating("")
                      setPriceRange([0, 10000])
                      setSearchTerm("")
                      setLocation("")
                      setAppliedFilters({
                        searchTerm: "",
                        location: "",
                        priceRange: [0, 10000],
                        selectedSpecialty: "",
                        selectedGender: "",
                        selectedExperience: "",
                        selectedRating: "",
                        sortBy: "Rating (High to Low)",
                      })
                    }}
                  >
                    Clear All
                  </Button>
                  <Button onClick={applyFilters} className="bg-primary text-white hover:bg-primary-600 px-5 h-9 text-sm font-semibold shadow-sm">
                    Apply Filters
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Specialities */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center justify-between">
                    Specialities
                    {selectedSpecialty && (
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 rounded">
                        1
                      </span>
                    )}
                  </h4>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                    {specialties.slice(0, 8).map((specialty) => (
                      <label key={specialty ?? ""} className="flex items-start gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedSpecialty === specialty}
                          onCheckedChange={() => setSelectedSpecialty(selectedSpecialty === specialty ? "" : specialty ?? "")}
                          className="mt-0.5 w-4 h-4 rounded-full"
                        />
                        <span className="text-xs text-gray-600 leading-tight group-hover:text-blue-600 transition-colors">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Gender</h4>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                    {genders.map((gender) => (
                      <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedGender === gender}
                          onCheckedChange={() => setSelectedGender(selectedGender === gender ? "" : gender)}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>


                {/* Pricing */}
                <div className="pr-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Consultation Fee</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 font-medium bg-gray-50 p-1.5 rounded-md">
                      <span>RS. {priceRange[0]}</span>
                      <span className="text-gray-400">-</span>
                      <span>RS. {priceRange[1]}</span>
                    </div>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={setPriceRange}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Experience</h4>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                    {experiences.map((exp) => (
                      <label key={exp} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedExperience === exp}
                          onCheckedChange={() => setSelectedExperience(selectedExperience === exp ? "" : exp)}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Ratings</h4>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                    {ratings.map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedRating === rating}
                          onCheckedChange={() => setSelectedRating(selectedRating === rating ? "" : rating)}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">{rating}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> Doctors
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-12">
                  <Image
                    src="/assets/logo.png"
                    alt="SwiftCare"
                    width={64}
                    height={64}
                    className="h-16 w-16 animate-pulse rounded-xl object-contain"
                    priority
                  />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-blue-600 text-white"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Doctors Grid */}
              {!isLoading && !error && (
                <div className={`grid gap-6 mb-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {filteredDoctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className="doctor-card cursor-pointer"
                      onClick={() => router.push(`/doctor-profile?id=${doctor.id}`)}
                    >
                      <div className={`relative ${viewMode === "list" ? "flex" : ""}`}>
                        <div className={`doctor-card-image ${viewMode === "list" ? "w-48" : ""}`}>
                          <img
                            src={doctor.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"}
                            alt={doctor.name}
                            onError={(event) => {
                              event.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"
                            }}
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <div className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
                              {(doctor.averageRating || 0).toFixed(1)}
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 
                              <span className="text-[10px] text-gray-500 font-normal">({doctor.reviewCount || 0})</span>
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm w-fit ${isDoctorRegistered(doctor) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isDoctorRegistered(doctor) ? 'Registered' : 'Not Registered'}
                            </div>
                          </div>
                          <button
                            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavourite(doctor.id)
                            }}
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors ${favouriteDoctorIds.includes(String(doctor.id))
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400"
                                }`}
                            />
                          </button>
                        </div>
                        <CardContent className={`doctor-card-content ${viewMode === "list" ? "flex-1" : ""}`}>
                          <h3 className="doctor-card-name">{doctor.name}</h3>
                          <p className="doctor-card-specialty">{doctor.specialty}</p>
                          <p className="doctor-card-location">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{typeof doctor.location === 'string' ? doctor.location : doctor.location?.label || doctor.location?.clinicName || 'Location not provided'} • {doctor.experience}</span>
                          </p>
                          
                          {/* Schedule / Business Hours */}
                          {doctor.schedule?.availableDays && doctor.schedule.availableDays.length > 0 && (
                            <div className="mb-4">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Availability</p>
                              <div className="flex flex-wrap gap-1">
                                {doctor.schedule.availableDays.map(day => (
                                  <span key={day} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-border font-medium">
                                    {day.substring(0, 3)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Consultation</p>
                              <p className="text-lg font-bold text-gray-900">{doctor.fee || 'Contact'}</p>
                            </div>
                            <Link href={`/doctor-profile?id=${doctor.id}`}>
                              <Button size="sm" className="bg-primary text-white hover:bg-primary-600 h-9">
                                {isDoctorRegistered(doctor) ? 'Details' : 'Information Only'}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && !error && filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] p-0 overflow-hidden sm:max-w-[95vw]">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-200">
            <DialogTitle className="text-xl">Doctors on Map</DialogTitle>
            <DialogDescription>
              Browse all doctors and highlight the ones near your current location when it is available.
            </DialogDescription>
          </DialogHeader>
          <iframe
            src={
              currentLocation
                ? `${API_BASE_URL}/api/mapbox/doctors-map?lat=${encodeURIComponent(String(currentLocation.coordinates[1]))}&lng=${encodeURIComponent(String(currentLocation.coordinates[0]))}&label=${encodeURIComponent(currentLocation.label)}`
                : `${API_BASE_URL}/api/mapbox/doctors-map`
            }
            title="Doctors map"
            className="h-[78vh] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsContent />
    </Suspense>
  )
}
