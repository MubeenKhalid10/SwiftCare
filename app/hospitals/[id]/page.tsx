"use client"

import { Suspense, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Mail, Users, Star } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogoLoader } from "@/components/ui/logo-loader"
import { getFacilityById, getDoctors } from "@/lib/api"
import { resolveDoctorImage, onDoctorImageError, resolveFacilityImage, onFacilityImageError } from "@/lib/image-utils"
import type { Facility, Doctor } from "@/lib/types"

function FacilityDetailContent() {
  const params = useParams()
  const router = useRouter()
  const facilityId = params.id as string
  const isDoctorRegistered = (doctor: Doctor) => doctor.accountStatus?.registered !== false
  const [facility, setFacility] = useState<Facility | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [facilityData, allDoctors] = await Promise.all([
          getFacilityById(facilityId),
          getDoctors(undefined, undefined, true)
        ])

        if (!facilityData) {
          setError("Facility not found")
          return
        }

        setFacility(facilityData)

        const allDoctorsById = new Map(
          allDoctors.map((doctor) => [String(doctor.id), doctor])
        )

        const mergeAffiliatedDoctor = (doctor: Doctor): Doctor => {
          const normalizedId = String((doctor as any).id || (doctor as any)._id || '')
          const enriched = allDoctorsById.get(normalizedId)

          const averageRating =
            doctor.averageRating && doctor.averageRating > 0
              ? doctor.averageRating
              : enriched?.averageRating
          const reviewCount =
            doctor.reviewCount && doctor.reviewCount > 0
              ? doctor.reviewCount
              : enriched?.reviewCount
          const fee = doctor.fee || enriched?.fee
          const specialty = doctor.specialty || enriched?.specialty
          const locationLabel = facilityData?.location?.label

          return {
            ...enriched,
            ...doctor,
            id: normalizedId,
            averageRating,
            reviewCount,
            fee,
            specialty,
            location: locationLabel || doctor.location || enriched?.location,
            locationLabel: locationLabel || doctor.locationLabel || enriched?.locationLabel,
            clinicName: locationLabel || doctor.clinicName || enriched?.clinicName,
          }
        }

        // Filter doctors that are affiliated with this facility
        if (facilityData.doctorList && facilityData.doctorList.length > 0) {
          const populatedDoctors = facilityData.doctorList
            .filter((doctor): doctor is Doctor => typeof doctor === "object" && doctor !== null)
            .map(mergeAffiliatedDoctor)

          if (populatedDoctors.length > 0) {
            setDoctors(populatedDoctors)
          } else {
            const affiliatedDoctorIds = facilityData.doctorList.map(d =>
              typeof d === "string" ? d : String(d.id || (d as any)._id || '')
            )
            const affiliatedDoctors = allDoctors.filter(doc =>
              affiliatedDoctorIds.includes(String(doc.id))
            )
            setDoctors(affiliatedDoctors.map(mergeAffiliatedDoctor))
          }
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load facility details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [facilityId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <LogoLoader size={32} className="h-8 w-8" />
        </main>
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Link href="/hospitals" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Facilities
          </Link>
          <div className="text-center">
            <p className="text-red-500 text-lg">{error || "Facility not found"}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Link href="/hospitals" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back to Facilities
          </Link>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 relative">
          <img
            src={resolveFacilityImage(facility.image)}
            alt={facility.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={onFacilityImageError}
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl font-bold">{facility.name}</h1>
          </div>
        </section>

        {/* Facility Details */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Location Information */}
              {facility.location && (
                <div className="bg-card rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Location Information</h2>

                  {facility.location.label && (
                    <div className="flex items-start gap-4 mb-4">
                      <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Address</p>
                        <p className="text-foreground">{facility.location.label}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* About Section */}
              {facility.about && (
                <div className="bg-card rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">About</h2>
                  <p className="text-foreground/80 leading-relaxed">{facility.about}</p>
                </div>
              )}

              {/* Affiliated Doctors */}
              {doctors.length > 0 && (
                <div className="bg-card rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Affiliated Doctors</h2>

                  <div className="grid gap-6 grid-cols-1">
                    {doctors.map((doctor) => (
                      <Card
                        key={doctor.id}
                        className="doctor-card cursor-pointer hover:border-primary/40 transition-all"
                        onClick={() => router.push(`/doctor-profile?id=${doctor.id}`)}
                      >
                        <div className="relative flex flex-col sm:flex-row">
                          <div className="doctor-card-image w-full sm:w-48 h-48 sm:h-auto shrink-0 relative">
                            <img
                              src={resolveDoctorImage(doctor.image)}
                              alt={doctor.name}
                              onError={onDoctorImageError}
                              className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none absolute inset-0"
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                              <div className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
                                {(doctor.averageRating || 0).toFixed(1)}
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 
                                <span className="text-[10px] text-muted-foreground font-normal">({doctor.reviewCount || 0})</span>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm w-fit ${isDoctorRegistered(doctor) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {isDoctorRegistered(doctor) ? 'Registered' : 'Not Registered'}
                              </div>
                            </div>
                          </div>
                          <CardContent className="doctor-card-content flex-1 p-4 flex flex-col">
                            <h3 className="doctor-card-name text-lg font-bold text-foreground mb-1">Dr. {doctor.name}</h3>
                            <p className="doctor-card-specialty text-sm text-muted-foreground mb-2">{doctor.specialty}</p>
                            <p className="doctor-card-location text-sm text-muted-foreground flex items-center gap-1 mb-3">
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
                              <Link href={`/doctor-profile?id=${doctor.id}`} onClick={(e) => e.stopPropagation()}>
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
                </div>
              )}

              {doctors.length === 0 && facility.doctorList && facility.doctorList.length === 0 && (
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No affiliated doctors information available</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Quick Info Card */}
              <div className="bg-card rounded-lg shadow-md p-6 sticky top-20">
                <h3 className="text-xl font-semibold text-foreground mb-6">Quick Info</h3>

                <div className="space-y-4">
                  {facility.doctorList && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Affiliated Doctors</p>
                        <p className="text-lg font-semibold text-foreground">
                          {Array.isArray(facility.doctorList) ? facility.doctorList.length : 0}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const address = facility.location?.label || facility.name;
                      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
                      window.open(mapsUrl, '_blank');
                    }}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}

export default function FacilityDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LogoLoader size={32} className="h-8 w-8" />
        </div>
      }
    >
      <FacilityDetailContent />
    </Suspense>
  )
}
