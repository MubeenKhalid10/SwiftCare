'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Star, MapPin, Phone, Mail, Award, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getDoctorById, getAppointmentsByDoctorId, getReviewsByDoctorId, createReview } from '@/lib/api'
import { getInitials } from '@/lib/avatar-utils'
import { useAuth } from '@/lib/auth-context'
import type { Doctor, Review } from '@/lib/types'
import { ClinicLocationMap } from '@/components/doctor/clinic-location-map';

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id

  const { user, isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentCount, setAppointmentCount] = useState(0)

  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const isRegisteredDoctor = doctor?.accountStatus?.registered !== false

  useEffect(() => {
    async function fetchData() {
      try {
        const [docData, appts, reviewsData] = await Promise.all([
          getDoctorById(String(doctorId)),
          getAppointmentsByDoctorId(String(doctorId)),
          getReviewsByDoctorId(String(doctorId))
        ])

        if (docData) {
          setDoctor(docData)
          setAppointmentCount(appts.length)
          setReviews(reviewsData)
        } else {
          setError('Doctor not found')
        }
      } catch (err) {
        console.error('Failed to fetch doctor data:', err)
        setError('Failed to load doctor profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (doctorId) {
      fetchData()
    }
  }, [doctorId])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      setReviewError("Please login to submit a review.")
      return
    }
    if (newRating === 0) {
      setReviewError("Please select a rating.")
      return
    }

    try {
      setIsSubmittingReview(true)
      setReviewError(null)
      await createReview({
        doctorId: String(doctorId),
        patientId: user.id,
        rating: newRating,
        comment: newComment
      })

      // Refresh reviews and doctor stats
      const [updatedReviews, updatedDoctor] = await Promise.all([
        getReviewsByDoctorId(String(doctorId)),
        getDoctorById(String(doctorId))
      ])

      setReviews(updatedReviews)
      if (updatedDoctor) setDoctor(updatedDoctor)

      // Reset form
      setNewRating(0)
      setNewComment('')
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

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
                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden flex items-center justify-center bg-gray-100">
                  <img
                    src={doctor.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"
                    }}
                  />
                </div>

                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(doctor.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className={`mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isRegisteredDoctor ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isRegisteredDoctor ? 'Registered' : 'Not Registered'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{(doctor.averageRating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({doctor.reviewCount || 0} reviews)</span>
                  </div>
                </div>

                {/* Booking Button */}
                  {isRegisteredDoctor ? (
                    <Button
                      onClick={() => router.push(`/booking?doctorId=${doctor.id}`)}
                      className="w-full bg-blue-600 mb-3"
                    >
                      Book Appointment
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gray-200 text-gray-700 mb-3 cursor-not-allowed hover:bg-gray-200"
                      disabled
                    >
                      Information Only
                    </Button>
                  )}

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
                      <p className="text-sm font-medium">{doctor.locationLabel || (typeof doctor.location === 'string' ? doctor.location : doctor.location?.label || doctor.location?.clinicName || 'Not provided')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <ClinicLocationMap
                    label={doctor.locationLabel || (typeof doctor.location === 'string' ? doctor.location : doctor.location?.label) || 'Clinic location'}
                    coordinates={doctor.locationCoordinates || (typeof doctor.location === 'object' ? doctor.location?.coordinates || doctor.location?.geo?.coordinates : undefined) || null}
                  />
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
                    <p className="text-lg font-semibold text-gray-900">{(doctor.averageRating || 0).toFixed(1)}/5</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor.available
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

              {/* Reviews Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Patient Reviews</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">{(doctor.averageRating || 0).toFixed(1)}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= (doctor.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Review Form */}
                {isAuthenticated && user?.role === 'patient' && (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3">Leave a Review</h3>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`w-6 h-6 ${s <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your experience with this doctor..."
                      className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm mb-3 min-h-[100px]"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    {reviewError && <p className="text-red-500 text-xs mb-3">{reviewError}</p>}
                    <Button
                      type="submit"
                      className="bg-blue-600"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Review
                    </Button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-200">
                                {review.patientName ? getInitials(review.patientName) : 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{review.patientName || 'Anonymous Patient'}</p>
                              <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 italic">No reviews yet. Be the first to leave one!</p>
                    </div>
                  )}
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
