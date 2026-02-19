"use client"

import { Suspense, useState } from "react"
import { Search, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { PatientSidebar } from "@/components/patient/patient-sidebar"

const favoritesDoctors = [
  {
    id: 1,
    name: "Dr.Edilain Hendry",
    specialty: "Cardiology",
    location: "Newark, USA",
    rating: 5.0,
    reviews: 0,
    nextAvailable: "23 Mar 2024",
    lastBooked: "21 Jan 2023",
    image: "/doctor1.jpg",
  },
  {
    id: 2,
    name: "Dr.Shanta Nesmith",
    specialty: "Oncology",
    location: "Los Angeles, USA",
    rating: 4.0,
    reviews: 35,
    nextAvailable: "27 Mar 2024",
    lastBooked: "18 Jan 2023",
    image: "/doctor2.jpg",
  },
  {
    id: 3,
    name: "Dr.John Ewel",
    specialty: "Orthopedics",
    location: "Dallas, USA",
    rating: 5.0,
    reviews: 0,
    nextAvailable: "02 Apr 2024",
    lastBooked: "28 Jan 2023",
    image: "/doctor3.jpg",
  },
]

function FavouritesContent() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDoctors = favoritesDoctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <span className="text-blue-600">●</span>
          <Link href="/patient/dashboard" className="text-gray-600 hover:text-gray-900">
            Patient
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Favourites</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Favourites</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reusable Sidebar */}
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Favourites</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  className="pl-10 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="relative h-48">
                    <img
                      src={doctor.image || "/placeholder.svg"}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>
                  </div>

                  <CardContent className="p-4">
                    <Link href="#" className="text-blue-600 text-sm font-medium hover:underline">
                      {doctor.name}
                    </Link>
                    <p className="text-gray-600 text-sm">{doctor.specialty}</p>

                    <div className="flex items-center gap-1 mt-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(doctor.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium ml-1">
                        {doctor.rating}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <p>📅 Next Availability: {doctor.nextAvailable}</p>
                      <p>📍 Location: {doctor.location}</p>
                      <p className="text-gray-500">
                        Last booked on {doctor.lastBooked}
                      </p>
                    </div>

                    <Button className="w-full bg-blue-50 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
