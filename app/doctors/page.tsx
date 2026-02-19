"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Heart, Grid3x3, List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { getDoctors } from "@/lib/api"
import type { Doctor } from "@/lib/types"

function DoctorsContent() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Live filter state (user input)
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  // Applied filter state (used for filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    location: "",
    priceRange: [0, 5000] as number[],
    selectedSpecialties: [] as string[],
  })

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await getDoctors()
        setDoctors(data)
      } catch (err) {
        setError("Failed to load doctors")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // APPLY FILTER when Search button clicked
  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      location,
      priceRange,
      selectedSpecialties,
    })
  }

  // Override existing Search button without changing JSX
  useEffect(() => {
    const button = document.querySelector("button.bg-blue-600") as HTMLButtonElement
    if (button) {
      button.onclick = applyFilters
    }
  }, [searchTerm, location, priceRange, selectedSpecialties])

  // Filtering uses applied filters only
  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.name?.toLowerCase() || ""
    const specialty = doc.specialty?.toLowerCase() || ""
    const docLocation = doc.location?.toLowerCase() || ""

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
      appliedFilters.selectedSpecialties.length === 0 ||
      appliedFilters.selectedSpecialties.includes(doc.specialty)

    return (
      matchesSearch &&
      matchesLocation &&
      matchesPrice &&
      matchesSpecialty
    )
  })

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const specialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean)

  const genders = ["Male", "Female"]
  const availability = ["Available Today", "Available Tomorrow"]
  const experiences = ["0 - 5 Years", "5+ Years"]
  const ratings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
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
                placeholder="Location"
                className="border-0 pl-0 w-32"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Filter</h3>
              <button 
                onClick={() => {
                  setSelectedSpecialties([])
                  setPriceRange([0, 5000])
                  setSearchTerm("")
                  setLocation("")
                }}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Specialities */}
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-900 mb-4">Specialities</h4>
              <div className="space-y-3">
                {specialties.slice(0, 6).map((specialty) => (
                  <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={selectedSpecialties.includes(specialty)}
                      onCheckedChange={() => toggleSpecialty(specialty)}
                    />
                    <span className="text-sm text-gray-600">{specialty}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {doctors.filter(d => d.specialty === specialty).length}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-900 mb-4">Gender</h4>
              <div className="space-y-3">
                {genders.map((gender) => (
                  <label key={gender} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox />
                    <span className="text-sm text-gray-600">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-900 mb-4">Availability</h4>
              <div className="space-y-3">
                {availability.map((item, idx) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox defaultChecked={idx === 0} />
                    <span className="text-sm text-gray-600">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-900 mb-4">Pricing</h4>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Range: ${priceRange[0]} - ${priceRange[1]}
                </div>
                <Slider 
                  defaultValue={priceRange} 
                  min={0} 
                  max={5000} 
                  step={100} 
                  onValueChange={setPriceRange} 
                />
              </div>
            </div>

            {/* Experience */}
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-900 mb-4">Experience</h4>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <label key={exp} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox />
                    <span className="text-sm text-gray-600">{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Ratings</h4>
              <div className="space-y-3">
                {ratings.map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox />
                    <span className="text-sm text-gray-600">{rating}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> Doctors
              </div>
              <div className="flex items-center gap-4">
                <select className="text-sm border border-gray-300 rounded px-3 py-2">
                  <option>Sort By: Rating (High to Low)</option>
                  <option>Sort By: Price (Low to High)</option>
                  <option>Sort By: Price (High to Low)</option>
                </select>
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
              <div className={`grid gap-6 mb-8 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredDoctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => router.push(`/doctor-profile/${doctor.id}`)}
                  >
                    <div className={`relative ${viewMode === "list" ? "flex" : ""}`}>
                      <div className={`relative ${viewMode === "list" ? "w-48 h-48" : "h-48"} bg-gray-200`}>
                        {doctor.image ? (
                          <img
                            src={doctor.image || "/placeholder.svg"}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-200 flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-2xl">
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        {!doctor.available && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">Unavailable</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <span>★</span> {doctor.rating}
                        </div>
                        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:shadow-lg">
                          <Heart className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-blue-600 mb-2">{doctor.specialty}</p>
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {doctor.location} • {doctor.experience}
                        </p>
                        <p className="text-lg font-bold text-orange-500 mb-1">Consultation Fees</p>
                        <p className="text-2xl font-bold text-gray-900 mb-4">{doctor.fee}</p>
                        <Link href={`/booking?doctorId=${doctor.id}`}>
                          <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
                            Book Now
                          </Button>
                        </Link>
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
  )
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsContent />
    </Suspense>
  )
}
