"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { LogoLoader } from "@/components/ui/logo-loader"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { getFacilities } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import type { Facility } from "@/lib/types"

function FacilitiesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const itemsPerPage = 12

  useEffect(() => {
    async function fetchFacilities() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getFacilities(currentPage, itemsPerPage)
        setFacilities(data.items)
        setTotalCount(data.totalCount)
        setTotalPages(Math.max(1, Math.ceil(data.totalCount / itemsPerPage)))
      } catch (err) {
        setError("Failed to load facilities")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFacilities()
  }, [currentPage])

  const filteredFacilities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return facilities

    return facilities.filter((facility) => {
      const name = String(facility.name || '').toLowerCase()
      const locationLabel = String(facility.location?.label || '').toLowerCase()
      return name.includes(term) || locationLabel.includes(term)
    })
  }, [facilities, searchTerm])

  const displayedTotalCount = searchTerm ? filteredFacilities.length : totalCount
  const displayedTotalPages = searchTerm ? 1 : totalPages

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Hospitals</h1>
            <p className="text-xl text-blue-100">Find and explore healthcare facilities near you</p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`grid grid-cols-1 ${user?.role === 'patient' ? 'lg:grid-cols-4' : ''} gap-8`}>
            {user?.role === 'patient' && (
              <div className="lg:col-span-1 border rounded-xl overflow-hidden shadow-sm bg-white">
                <PatientSidebar />
              </div>
            )}

            <div className={`flex flex-col gap-8 ${user?.role === 'patient' ? 'lg:col-span-3' : ''}`}>
              {/* Search Section */}
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search by facility name or specialty..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LogoLoader size={32} className="h-8 w-8" />
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    {searchTerm ? "No facilities match your search" : "No facilities found"}
                  </p>
                </div>
              ) : (
                <>
              {/* Facilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredFacilities.map((facility) => (
                  <Link key={facility.id || facility._id} href={`/hospitals/${facility.id || facility._id}`}>
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer h-full">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center overflow-hidden">
                        {facility.image ? (
                          <img 
                            src={facility.image} 
                            alt={facility.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <MapPin className="w-12 h-12 text-white" />
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                          {facility.name}
                        </h3>

                        {facility.about && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {facility.about}
                          </p>
                        )}

                        {facility.location?.label && (
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {facility.location.label}
                            </p>
                          </div>
                        )}

                        {facility.doctorList && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                              Affiliated Doctors:{" "}
                              <span className="text-blue-600">
                                {Array.isArray(facility.doctorList) ? facility.doctorList.length : 0}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {displayedTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: displayedTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(displayedTotalPages, currentPage + 1))}
                    disabled={currentPage === displayedTotalPages}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Results Count */}
              <div className="text-center text-gray-600 text-sm">
                Showing {displayedTotalCount === 0 ? 0 : 1} to{" "}
                {searchTerm ? filteredFacilities.length : Math.min(currentPage * itemsPerPage, totalCount)} of {displayedTotalCount} facilities
              </div>
            </>
          )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function FacilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Image
            src="/assets/logo.png"
            alt="SwiftCare"
            width={64}
            height={64}
            className="h-16 w-16 animate-pulse rounded-xl object-contain"
            priority
          />
        </div>
      }
    >
      <FacilitiesContent />
    </Suspense>
  )
}
