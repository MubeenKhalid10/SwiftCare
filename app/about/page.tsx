"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Reviews from "@/components/reviews"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage} from "@/components/ui/avatar"
import { ChevronDown, Phone, Users, Clock, Microscope, HandshakeIcon } from "lucide-react"
import { getDoctors } from "@/lib/api"
import type { Doctor } from "@/lib/types"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function AboutPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
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

  // Why Choose Us - static content
  const whyChooseUs = [
    {
      icon: Users,
      title: "Verified Doctors",
      description:
        "Choose from verified profiles with clear specialties, fees, and availability.",
    },
    {
      icon: Clock,
      title: "Smart Queue Booking",
      description: "See patients before you and get the next available time automatically.",
    },
    {
      icon: Microscope,
      title: "Live Queue Tracking",
      description:
        "Track your queue position in real time and get notified as your turn approaches.",
    },
    {
      icon: HandshakeIcon,
      title: "Secure & Simple",
      description: "Secure data handling with a simple, fast booking flow.",
    },
  ]

  const faqs = [
    { q: "How do I book an appointment?", a: "Pick a doctor, choose a date, and we show patients before you with the next available time." },
    { q: "How does queue booking work?", a: "Appointments are first-come, first-serve. Your time is assigned based on queue order." },
    { q: "Can I track my queue position?", a: "Yes. Use the Track Queue feature to see current serving and estimated wait time." },
    { q: "Is my data secure?", a: "We follow secure data practices to keep your personal information safe." },
  ]

  return (
    <main className="w-full bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-icon-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2">About Us</p>
            <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left images grid */}
           <div className="grid grid-cols-2 gap-4">
  <img
    src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop"
    alt="Doctor with patient"
    className="rounded-lg h-40 w-full object-cover"
  />

  <div className="flex flex-col gap-4">
    <div className="bg-primary text-white p-6 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm">Over 25+ Years</p>
        <p className="text-xl font-bold">Experience</p>
      </div>
    </div>

    <img
      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop"
      alt="Doctor smiling"
      className="rounded-lg h-40 w-full object-cover"
    />
  </div>

  <img
    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop"
    alt="Doctor examination"
    className="rounded-lg h-40 w-full object-cover"
  />

  <img
    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1200&auto=format&fit=crop"
    alt="Doctor with patient"
    className="rounded-lg h-40 w-full object-cover"
  />
</div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">We Ensure Best Medical Treatment For Your Health</h2>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to simplify finding and booking appointments with highly qualified medical professionals.
              </p>
              <p className="text-gray-600 leading-relaxed">We connect you with the right medical expert when you need it.</p>
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
                <div key={idx} className="text-center p-6 border-2 border-primary/30 rounded-xl">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
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
              <LogoLoader size={32} className="h-8 w-8" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-gray-500">No doctors available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-card-image">
                    <div className="w-full h-full">
                      <img
                        src={doctor.image || FALLBACK_AVATAR}
                        alt={doctor.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_AVATAR
                        }}
                      />
                    </div>
                  </div>
                  <div className="doctor-card-content">
                    <h3 className="doctor-card-name">{doctor.name}</h3>
                    <p className="doctor-card-specialty">{doctor.specialty}</p>
                    <p className="doctor-card-location mb-4">
                      {typeof doctor.location === 'string' ? doctor.location : doctor.location?.clinicName ?? doctor.location?.label ?? ''}
                    </p>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary-600 text-white">
                      <a href={`/doctor-profile?id=${doctor.id}`}>Book Now</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials - Reviews Component */}
      <Reviews />

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