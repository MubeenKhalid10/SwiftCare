"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Heart, Grid3x3, List, Star, Map, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Header from "@/components/header"
import Link from "next/link"
import { getDoctors } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { getFavouriteDoctorIds, migrateGuestFavouritesToPatient, syncFavouritesFromBackend, toggleFavouriteDoctorWithSync } from "@/lib/utils"
import { toast } from "sonner"
import type { Doctor } from "@/lib/types"
import { resolveCurrentLocation } from "@/lib/location"
import { resolveDoctorImage, onDoctorImageError } from "@/lib/image-utils"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api-config"

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

  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [selectedExperience, setSelectedExperience] = useState<string>("")
  const [selectedRating, setSelectedRating] = useState<string>("")

  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    location: "",
    priceRange: [0, 10000] as number[],
    selectedSpecialty: "",
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
    if (!user?.id) {
      setFavouriteDoctorIds(getFavouriteDoctorIds(undefined))
      return
    }

    async function syncFavourites() {
      const patientId = user!.id
      migrateGuestFavouritesToPatient(patientId)
      await syncFavouritesFromBackend(patientId)
      setFavouriteDoctorIds(getFavouriteDoctorIds(patientId))
    }

    syncFavourites()
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
      selectedExperience,
      selectedRating,
      sortBy: appliedFilters.sortBy,
    })
  }

  const clearFilters = () => {
    setSelectedSpecialty("")
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
      selectedExperience: "",
      selectedRating: "",
      sortBy: "Rating (High to Low)",
    })
  }

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

    const docExp = parseInt(String(doc.experience || "0"));
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
      matchesExperience &&
      matchesRating
    )
  })

  const specialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean)

  const handleToggleFavourite = async (doctorId: string | number) => {
    try {
      await toggleFavouriteDoctorWithSync(doctorId, user?.id)
      setFavouriteDoctorIds(getFavouriteDoctorIds(user?.id))
    } catch {
      toast.error('Failed to update favourites')
    }
  }

  const experiences = ["0 - 5 Years", "5+ Years"]
  const ratings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]

  const isDoctorRegistered = (doctor: Doctor) => doctor.accountStatus?.registered !== false

  const filtersPanel = (
    <div className="bg-card p-5 rounded-xl border border-border/60 shadow-sm sticky top-24">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground text-base">Filters</h3>
          <span className="text-xs text-primary font-medium bg-icon-bg px-1.5 rounded"> </span>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-600 w-25" onClick={clearFilters}>
          Clear Filters
        </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center justify-between">
            Specialities
            {selectedSpecialty && (
              <span className="text-xs text-primary font-medium bg-icon-bg px-1.5 rounded">1</span>
            )}
          </h4>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
            {specialties.slice(0, 10).map((specialty) => (
              <label key={specialty ?? ""} className="flex items-start gap-2 cursor-pointer group">
                <Checkbox
                  checked={selectedSpecialty === specialty}
                  onCheckedChange={() => setSelectedSpecialty(selectedSpecialty === specialty ? "" : specialty ?? "")}
                  className="mt-0.5 w-4 h-4 rounded-full"
                />
                <span className="text-xs text-muted-foreground leading-tight group-hover:text-primary transition-colors">{specialty}</span>
              </label>
            ))}
          </div>
        </div>


        <div>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Consultation Fee</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium bg-muted/50 p-1.5 rounded-md">
              <span>RS. {priceRange[0]}</span>
              <span>-</span>
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

        <div>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Experience</h4>
          <div className="space-y-1.5">
            {experiences.map((exp) => (
              <label key={exp} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={selectedExperience === exp}
                  onCheckedChange={() => setSelectedExperience(selectedExperience === exp ? "" : exp)}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{exp}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Ratings</h4>
          <div className="space-y-1.5">
            {ratings.map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={selectedRating === rating}
                  onCheckedChange={() => setSelectedRating(selectedRating === rating ? "" : rating)}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{rating}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-border/50">
        <Button onClick={applyFilters} className="bg-primary text-primary-foreground hover:bg-primary-600 w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-gradient-to-r from-icon-bg to-icon-bg/50 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Find Doctors</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search for Doctors, Specialties"
                className="w-full pl-10 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Location (for nearby search)"
                className="w-full pl-10 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={async () => {
                  if (location && location.trim()) {
                    try {
                      const { geocodeAddress } = await import('@/lib/geocode');
                      await geocodeAddress(location);
                    } catch (err) {
                      console.warn('Location geocoding unavailable', err);
                    }
                  }
                }}
              />
            </div>
            <Button onClick={applyFilters} className="bg-primary text-primary-foreground hover:bg-primary-600 gap-2 h-11 px-6">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 gap-2 h-11"
              onClick={() => setIsMapOpen(true)}
            >
              <Map className="w-4 h-4" />
              Nearby Doctors&apos; Map
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            {filtersPanel}
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> Doctors
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary-600"
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !error && (
              <div className={`grid gap-6 mb-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="doctor-card cursor-pointer"
                    onClick={() => router.push(`/doctor-profile?id=${doctor.id}`)}
                  >
                    <div className={`relative ${viewMode === "list" ? "flex" : ""}`}>
                      <div className={`doctor-card-image ${viewMode === "list" ? "w-48" : ""}`}>
                        <img
                          src={resolveDoctorImage(doctor.image)}
                          alt={doctor.name}
                          onError={onDoctorImageError}
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <div className="bg-card/95 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
                            {(doctor.averageRating || 0).toFixed(1)}
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 
                            <span className="text-[10px] text-muted-foreground font-normal">({doctor.reviewCount || 0})</span>
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm w-fit ${isDoctorRegistered(doctor) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isDoctorRegistered(doctor) ? 'Registered' : 'Not Registered'}
                          </div>
                        </div>
                        <button
                          className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavourite(doctor.id)
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${favouriteDoctorIds.includes(String(doctor.id))
                              ? "text-red-500 fill-red-500"
                              : "text-muted-foreground"
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
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Consultation</p>
                            <p className="text-lg font-bold text-foreground">{doctor.fee || 'Contact'}</p>
                          </div>
                          <Link href={`/doctor-profile?id=${doctor.id}`}>
                            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-600 h-9">
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

            {!isLoading && !error && filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No doctors found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] p-0 overflow-hidden sm:max-w-[95vw]">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
            <DialogTitle className="text-xl">Doctors on Map</DialogTitle>
            <DialogDescription>
              Browse all doctors and highlight the ones near your current location when it is available.
            </DialogDescription>
          </DialogHeader>
          <iframe
            src={
              currentLocation
                ? buildApiUrl(`${API_ENDPOINTS.MAPBOX.DOCTORS_MAP}?lat=${encodeURIComponent(String(currentLocation.coordinates[1]))}&lng=${encodeURIComponent(String(currentLocation.coordinates[0]))}&label=${encodeURIComponent(currentLocation.label)}`)
                : buildApiUrl(API_ENDPOINTS.MAPBOX.DOCTORS_MAP)
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
