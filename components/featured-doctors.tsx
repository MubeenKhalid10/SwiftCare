"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Star, Loader2 } from "lucide-react"
import { getDoctors } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import type { Doctor } from "@/lib/types"

const DOCTOR_FALLBACK_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"

export default function FeaturedDoctors() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await getDoctors()

        const topDoctors = data
          .map((doctor) => ({
            ...doctor,
            rating: Number(doctor.rating) || 0,
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4)

        setDoctors(topDoctors)
      } catch (err) {
        setError("Failed to load doctors")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  if (isLoading) {
    return (
      <section className="border-section-top border-section-bottom py-16 bg-gradient-to-b from-primary-50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="border-section-top border-section-bottom py-16 bg-gradient-to-b from-primary-50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-section-top border-section-bottom py-16 bg-gradient-to-b from-primary-50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Featured
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-16">
          Our <span className="text-blue-600">Top Rated Doctors</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/doctor-profile?id=${doctor.id}`}
              className="doctor-card"
            >
              <div className="doctor-card-image">
                <img
                  src={doctor.image || DOCTOR_FALLBACK_IMAGE}
                  alt={doctor.name}
                  onError={(event) => {
                    event.currentTarget.src = DOCTOR_FALLBACK_IMAGE
                  }}
                />
              </div>

              <div className="doctor-card-content">
                <h3 className="doctor-card-name">{doctor.name}</h3>
                <p className="doctor-card-specialty">{doctor.specialty || 'General Practitioner'}</p>
                <p className="doctor-card-location">
                  📍 {typeof doctor.location === 'string' ? doctor.location : "Location not specified"}
                </p>

                <div className="doctor-card-footer">
                  <div className="doctor-card-rating">
                    <span className="text-foreground">{doctor.rating}</span>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`${doctor.id}-star-${i}`}
                        className={`w-4 h-4 ${i < Math.floor(doctor.rating || 0)
                            ? "fill-current text-yellow-400"
                            : "fill-none text-border"
                          }`}
                      />
                    ))}
                    <span className="text-muted-foreground text-xs ml-1">
                      ({doctor.reviewCount || 0})
                    </span>
                  </div>

                  <span className="doctor-card-fee">
                    {doctor.fee}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/doctors"
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-600 transition"
          >
            View All Doctors
          </Link>
        </div>
      </div>
    </section>
  )
}
