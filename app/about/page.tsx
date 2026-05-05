"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Phone, Users, Clock, Microscope, HandshakeIcon, Loader2 } from "lucide-react"
import { getDoctors, getReviews, getDashboardStats } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import type { Doctor, Review, DashboardStats } from "@/lib/types"

export default function AboutPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const FALLBACK_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"
  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors()
        setDoctors(data.slice(0, 4))
      } catch (err) {
        console.error("Error fetching doctors:", err)
      } finally {
        setIsLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  // Fetch reviews for testimonials
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews()
        setReviews(data.slice(0, 3)) // take first 3 for About page
      } catch (err) {
        console.error("Error fetching reviews:", err)
      } finally {
        setIsLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [])

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoadingStats(false)
      }
    }
    fetchStats()
  }, [])

  // Why Choose Us - static content
  const whyChooseUs = [
    {
      icon: Users,
      title: "Qualified Staff of Doctors",
      description:
        "We have a team of highly qualified doctors with years of experience delivering top-notch healthcare.",
    },
    {
      icon: Clock,
      title: "24 Hours Service",
      description: "Experience healthcare advantage whether day or night. Find & book appointments easily.",
    },
    {
      icon: Microscope,
      title: "Quality Lab Services",
      description:
        "High standards of excellence in lab services & medical operations for highest expertise.",
    },
    {
      icon: HandshakeIcon,
      title: "Free Consultations",
      description: "Accessible care begins with a free initial consultation.",
    },
  ]

  const faqs = [
    { q: "How do I book an appointment with a doctor?", a: "Simply search, log in, select a doctor & confirm your booking." },
    { q: "Can I make an appointment online?", a: "Book appointments through our platform by selecting your preferred time slot." },
    { q: "Is my personal information secure?", a: "All personal information is encrypted and stored securely." },
    { q: "Can I cancel or reschedule my appointment?", a: "Yes, up to 24 hours before the scheduled time." },
  ]

  return (
    <main className="w-full bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">About Us</p>
            <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left images grid */}
            <div className="grid grid-cols-2 gap-4">
              <img src="/doctor-woman-patient.jpg" alt="Doctor with patient" className="rounded-lg h-40 w-full object-cover" />
              <div className="flex flex-col gap-4">
                <div className="bg-blue-600 text-white p-6 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm">Over 25+ Years</p>
                    <p className="text-xl font-bold">Experience</p>
                  </div>
                </div>
                <img src="/doctor-woman-smiling.jpg" alt="Doctor smiling" className="rounded-lg h-40 w-full object-cover" />
              </div>
              <img src="/doctor-woman-patient-examination.jpg" alt="Doctor examination" className="rounded-lg h-40 w-full object-cover" />
              <img src="/doctor-man-patient.jpg" alt="Doctor with patient" className="rounded-lg h-40 w-full object-cover" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">We Ensure Best Medical Treatment For Your Health</h2>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to simplify finding and booking appointments with highly qualified medical professionals.
              </p>
              <p className="text-gray-600 leading-relaxed">We connect you with the right medical expert when you need it.</p>
              <div className="flex items-center space-x-4 pt-4">
                <Phone className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Need Emergency?</p>
                  <p className="text-2xl font-bold text-gray-900">+1 315 369 5943</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Best Doctors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Best Doctors</h2>
          {isLoadingDoctors ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-gray-500">No doctors available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="relative">
                    <Avatar className="w-full h-64">
                      <AvatarImage src={doctor.image || FALLBACK_AVATAR} alt={doctor.name} className="object-cover w-full h-full" />
                    </Avatar>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">{doctor.name}</h3>
                    <p className="text-blue-600 font-bold mb-3">{doctor.specialty}</p>
                    <p className="text-sm text-gray-600 mb-4">{typeof doctor.location === 'string' ? doctor.location : doctor.location?.clinicName ?? doctor.location?.label ?? ''}</p>
                    <Button size="sm" className="w-full bg-gray-900 text-white hover:bg-gray-800">
                      <a href={`/doctor-profile?id=${doctor.id}`}>Book Now</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">What Our Clients Say</h2>
          {isLoadingReviews ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500">No testimonials available.</div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {reviews.map((t) => (
                <div key={t.id} className="flex-1 flex flex-col items-center text-center">
                  <img src={t.avatar || "/placeholder.svg"} alt={t.patientName} className="w-48 h-48 rounded-full object-cover mb-6" />
                  <p className="text-gray-600 text-lg mb-4 leading-relaxed">{t.comment}</p>
                  <p className="font-bold text-gray-900">{t.patientName}</p>
                  <p className="text-gray-600 text-sm">Patient</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-left text-gray-900 text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform flex-shrink-0 ${openIndex === idx ? "rotate-180" : ""}`} />
                </button>
                {openIndex === idx && <div className="px-6 pb-6 text-gray-600 border-t border-gray-100">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}