"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Phone, Users, Clock, Microscope, HandshakeIcon, Loader2 } from "lucide-react"
import { getDoctors } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import type { Doctor } from "@/lib/types"

const aboutStats = [
  { label: "Happy Patients", value: "95k+" },
  { label: "Years of Experience", value: "17+" },
  { label: "Specialist Doctors", value: "29K" },
  { label: "Hospital Partnerships", value: "95+" },
  { label: "Success Rate", value: "94%" },
]

const whyChooseUs = [
  {
    icon: Users,
    title: "Qualified Staff of Doctors",
    description:
      "We have a team of highly qualified doctors with years of experience in delivering top-notch healthcare.",
  },
  {
    icon: Clock,
    title: "24 Hours Service",
    description: "Experience the healthcare advantage whether it's day or night, you can find & book appointments.",
  },
  {
    icon: Microscope,
    title: "Quality Lab Services",
    description:
      "Following high standards of excellence in lab services & other medical operations for highest expertise.",
  },
  {
    icon: HandshakeIcon,
    title: "Free Consultations",
    description: "We are providing accessible care begins with a free initial consultation.",
  },
]

const testimonials = [
  {
    name: "John Doe",
    text: "Doccure exceeded my expectations in healthcare. The seamless booking process, coupled with the expertise of the doctors, made my experience exceptional. Their commitment to quality care and patient-centric approach highly recommended Doccure for anyone seeking reliable and accessible healthcare services.",
    image: "/man-smiling-professional.jpg",
  },
]

const faqs = [
  {
    q: "How do I book an appointment with a doctor?",
    a: "Yes, simply search and log in or create an account, Search for a doctor based on specialization, location, or availability & confirm your booking.",
  },
  {
    q: "Can I make an Appointment Online with White Plains Hospital Kman?",
    a: "You can easily book appointments through our platform by searching for doctors and selecting your preferred time slot.",
  },
  {
    q: "Is my personal information secure?",
    a: "We take privacy and security very seriously. Your information is encrypted and stored securely.",
  },
  {
    q: "Can I cancel or reschedule my appointment?",
    a: "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time.",
  },
  {
    q: "How do I find a specific doctor or specialist?",
    a: "Use our search filters to find doctors by specialization, location, experience, and patient ratings.",
  },
]

export default function AboutPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors()
        setDoctors(data.slice(0, 4))
      } catch (err) {
        console.error('Error fetching doctors:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctors = await getDoctors()
      setDoctorsList(doctors)
    }

    fetchDoctors()
  }, [])

  return (
    <main className="w-full bg-white">
      <Header />

      {/* About Us Hero Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">About Us</p>
            <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side images grid */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/doctor-woman-patient.jpg"
                alt="Doctor with patient"
                className="rounded-lg h-40 w-full object-cover"
              />
              <div className="flex flex-col gap-4">
                <div className="bg-blue-600 text-white p-6 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm">Over 25+ Years</p>
                    <p className="text-xl font-bold">Experience</p>
                  </div>
                </div>
                <img
                  src="/doctor-woman-smiling.jpg"
                  alt="Doctor smiling"
                  className="rounded-lg h-40 w-full object-cover"
                />
              </div>
              <img
                src="/doctor-woman-patient-examination.jpg"
                alt="Doctor examination"
                className="rounded-lg h-40 w-full object-cover"
              />
              <img
                src="/doctor-man-patient.jpg"
                alt="Doctor with patient"
                className="rounded-lg h-40 w-full object-cover"
              />
            </div>

            {/* Right side content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                We Are Always Ensure Best Medical Treatment For Your Health
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At Doccure, we understand the importance of accessible and convenient healthcare. Our mission is to
                simplify the process of finding and booking appointments with highly qualified medical professionals.
                Whether you're seeking routine check-ups, specialized consultations, or emergency care, we strive to
                connect you with the right medical expert when you need it.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We envision a world where healthcare is easily accessible to everyone. Whether you're seeking routine
                check-ups, specialized consultations, or emergency care, we strive to connect you with the right medical
                expert.
              </p>
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

      {/* Why Choose Us Section */}
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

      {/* CTA Section with Doctor Image */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-12 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-white">
              <h2 className="text-4xl font-bold mb-4">Be on Your Way to Feeling Better with the Doccure</h2>
              <p className="text-blue-100 mb-8">
                Be on your way to feeling better as we prioritize your health and wellness.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">Contact With Us</Button>
            </div>
            <div className="flex-1">
              <img src="/female-doctor-pointing-glasses.jpg" alt="Doctor" className="w-full h-96 object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Best Doctors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Best Doctors</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-gray-500">No doctors available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative">
                    <Avatar className="w-full h-64">
                      <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="object-cover w-full h-full" />
                      <AvatarFallback className="w-full h-full text-2xl font-bold bg-blue-600 text-white flex items-center justify-center">
                        {getInitials(doctor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">{doctor.name}</h3>
                    <p className="text-blue-600 font-bold mb-3">{doctor.specialty}</p>
                    <p className="text-sm text-gray-600 mb-4">{doctor.location}</p>
                    <button className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">What Our Client Says</h2>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <img
              src={testimonials[0].image || "/placeholder.svg"}
              alt={testimonials[0].name}
              className="w-48 h-48 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">{testimonials[0].text}</p>
              <p className="font-bold text-gray-900">{testimonials[0].name}</p>
              <p className="text-gray-600 text-sm">Patient</p>
            </div>
          </div>
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
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 transition-transform flex-shrink-0 ${
                      openIndex === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === idx && <div className="px-6 pb-6 text-gray-600 border-t border-gray-100">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {aboutStats.map((stat, idx) => (
              <div key={idx}>
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Get the Latest Health Tips</h2>
          <p className="text-gray-600 mb-8">
            Stay updated with our latest health articles and tips delivered to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
