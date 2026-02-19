"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Star, Loader2 } from "lucide-react"
import { getDoctors } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Doctor } from "@/lib/types"

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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
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
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition block"
            >
              <div className="h-48 flex items-center justify-center overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="object-cover" />
                  <AvatarFallback className="text-2xl font-semibold bg-blue-600 text-white rounded-none">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{doctor.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{doctor.specialty}</p>
                <p className="text-gray-500 text-xs mb-4">{doctor.location}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`${doctor.id}-star-${i}`} // ✅ unique key per doctor & star
                        className={`w-4 h-4 ${
                          i < Math.floor(doctor.rating)
                            ? "fill-current"
                            : "fill-none"
                        }`}
                      />
                    ))}
                    <span className="text-gray-600 text-sm ml-2">
                      ({doctor.rating})
                    </span>
                  </div>

                  <span className="text-blue-600 font-semibold text-sm">
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
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            View All Doctors
          </Link>
        </div>
      </div>
    </section>
  )
}
