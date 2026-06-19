"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { MapPin, Search } from "lucide-react"
import { LogoLoader } from "@/components/ui/logo-loader"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import Link from "next/link"
import { getFacilities } from "@/lib/api"
import { resolveFacilityImage, onFacilityImageError } from "@/lib/image-utils"
import type { Facility } from "@/lib/types"

function FacilitiesContent() {
  const searchParams = useSearchParams()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const itemsPerPage = 12

  useEffect(() => {
    const q = searchParams.get("search")
    if (q) setSearchTerm(decodeURIComponent(q))
  }, [searchParams])

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
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-600"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <section className="bg-gradient-to-b from-icon-bg to-background border-b border-border/40 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="section-intro mx-auto mb-4">Healthcare Facilities</div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Hospitals & <span className="text-gradient-primary">Clinics</span></h1>
            <p className="text-muted-foreground">Find and explore healthcare facilities near you</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card p-5 rounded-xl border border-border/60 shadow-sm sticky top-24">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                  <h3 className="font-bold text-foreground text-base">Filters</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">Refine results</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Search Facilities</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="Name or location..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Search by facility name or location to narrow down results.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LogoLoader size={32} className="h-8 w-8" />
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? "No facilities match your search" : "No facilities found"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {filteredFacilities.map((facility) => (
                      <Link key={facility.id || facility._id} href={`/hospitals/${facility.id || facility._id}`}>
                        <div className="bg-card rounded-xl border border-border/60 shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full">
                          <div className="bg-gradient-to-br from-primary to-primary-600 h-32 flex items-center justify-center overflow-hidden">
                            <img
                              src={resolveFacilityImage(facility.image)}
                              alt={facility.name}
                              className="w-full h-full object-cover"
                              onError={onFacilityImageError}
                            />
                          </div>

                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                              {facility.name}
                            </h3>

                            {facility.about && (
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {facility.about}
                              </p>
                            )}

                            {facility.location?.label && (
                              <div className="flex items-start gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {facility.location.label}
                                </p>
                              </div>
                            )}

                            {facility.doctorList && (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-sm font-medium text-foreground/70">
                                  Affiliated Doctors:{" "}
                                  <span className="text-primary font-bold">
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

                  {displayedTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mb-8">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-sm font-medium"
                      >
                        Previous
                      </button>

                      {Array.from({ length: displayedTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                              : "border border-border hover:bg-muted text-foreground"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(Math.min(displayedTotalPages, currentPage + 1))}
                        disabled={currentPage === displayedTotalPages}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-sm font-medium"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <div className="text-center text-muted-foreground text-sm">
                    Showing {displayedTotalCount === 0 ? 0 : 1} to{" "}
                    {searchTerm ? filteredFacilities.length : Math.min(currentPage * itemsPerPage, totalCount)} of {displayedTotalCount} facilities
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FacilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LogoLoader size={32} className="h-8 w-8" />
        </div>
      }
    >
      <FacilitiesContent />
    </Suspense>
  )
}
