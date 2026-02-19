'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Star, MapPin, Phone, Mail, Award, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getDoctorById, getAppointmentsByDoctorId } from '@/lib/api'
import { getInitials } from '@/lib/avatar-utils'
import type { Doctor } from '@/lib/types'

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentCount, setAppointmentCount] = useState(0)

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const data = await getDoctorById(String(doctorId))
        if (data) {
          setDoctor(data)
          
          // Get appointment count
          const appointments = await getAppointmentsByDoctorId(String(doctorId))
          setAppointmentCount(appointments.length)
        } else {
          setError('Doctor not found')
        }
      } catch (err) {
        console.error('Failed to fetch doctor:', err)
        setError('Failed to load doctor profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (doctorId) {
      fetchDoctor()
    }
  }, [doctorId])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </>
    )
  }

  if (error || !doctor) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4 text-lg">{error || 'Doctor not found'}</p>
            <Button 
              onClick={() => router.push('/doctors')}
              className="bg-blue-600"
            >
              Browse Other Doctors
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card className="p-6 sticky top-6">
                {/* Profile Image */}
                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-blue-600 text-white rounded-none w-full h-full flex items-center justify-center">
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-lg font-semibold ml-2">({doctor.rating})</span>
                </div>

                {/* Booking Button */}
                <Button 
                  onClick={() => router.push(`/booking?doctorId=${doctor.id}`)}
                  className="w-full bg-blue-600 mb-3"
                >
                  Book Appointment
                </Button>

                {/* Call Button */}
                <Button 
                  variant="outline"
                  className="w-full mb-3 bg-transparent"
                >
                  Call Doctor
                </Button>

                {/* Contact Info */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{doctor.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium break-all">{doctor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium">{doctor.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                <p className="text-xl text-blue-600 font-semibold mb-2">{doctor.specialty}</p>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {doctor.experience || 'Experience not specified'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {appointmentCount} Appointments
                  </span>
                </div>
              </div>

              {/* Fee Card */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Consultation Fee</p>
                    <p className="text-3xl font-bold text-gray-900">{doctor.fee}</p>
                  </div>
                  <Clock className="w-12 h-12 text-blue-300" />
                </div>
              </Card>

              {/* About Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Dr. {doctor.name} is a highly experienced {doctor.specialty} specialist with a strong commitment to providing quality healthcare. 
                  With expertise in {doctor.specialty}, Dr. {doctor.name} has helped numerous patients achieve their health goals.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Specialty</p>
                    <p className="text-lg font-semibold text-gray-900">{doctor.specialty}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Experience</p>
                    <p className="text-lg font-semibold text-gray-900">{doctor.experience || 'Not specified'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <p className="text-lg font-semibold text-gray-900">{doctor.rating}/5</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      doctor.available 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {doctor.available ? '✓ Available' : 'Unavailable'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Services Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                    <span className="font-medium">Direct Visit</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                    <span className="font-medium">Video Call</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                    <span className="font-medium">Audio Call</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                    <span className="font-medium">Chat</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
