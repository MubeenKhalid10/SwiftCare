'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Phone, Video, MapPin, Star, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getDoctorById, getReviewsByDoctorId, createReview } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getFavouriteDoctorIds, toggleFavouriteDoctor } from '@/lib/utils';
import type { Doctor, Review } from '@/lib/types';
import Loading from './loading'; // Import the Loading component
import { ClinicLocationMap } from '@/components/doctor/clinic-location-map';
import { LogoLoader } from '@/components/ui/logo-loader';

function DoctorProfileContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('id');
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const isRegisteredDoctor = doctor?.accountStatus?.registered !== false;
  const doctorLocationLabel = typeof doctor?.location === 'string'
    ? doctor.location
    : doctor?.location?.label || 'Location not specified';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'locations', label: 'Locations' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'hours', label: 'Business Hours' },
  ];

  useEffect(() => {
    async function fetchDoctor() {
      if (!doctorId) {
        setError('No doctor ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const [doctorData, reviewsData] = await Promise.all([
          getDoctorById(doctorId || ''),
          getReviewsByDoctorId(doctorId || '')
        ]);
        
        if (doctorData) {
          setDoctor(doctorData);
          setReviews(reviewsData);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        setError('Failed to load doctor information');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!doctor?.id) return;
    const favouriteIds = getFavouriteDoctorIds(user?.id);
    setIsFavourite(favouriteIds.includes(String(doctor.id)));
  }, [doctor?.id, user?.id]);

  const handleToggleFavourite = () => {
    if (!doctor?.id) return;
    const next = toggleFavouriteDoctor(doctor.id, user?.id);
    setIsFavourite(next);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Please login to submit a review.');
      return;
    }
    if (newRating === 0) {
      setReviewError('Please select a rating.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);
      await createReview({
        doctorId: String(doctorId),
        patientId: user.id,
        rating: newRating,
        comment: newComment,
      });

      const [updatedReviews, updatedDoctor] = await Promise.all([
        getReviewsByDoctorId(String(doctorId)),
        getDoctorById(String(doctorId)),
      ]);

      setReviews(updatedReviews);
      if (updatedDoctor) setDoctor(updatedDoctor);
      setNewRating(0);
      setNewComment('');
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return null; // Return null to be handled by Suspense
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col justify-center items-center py-24">
          <p className="text-red-600 mb-4">{error || 'Doctor not found'}</p>
          <Link href="/doctors">
            <Button className="bg-blue-600 text-white">Browse Doctors</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse services from doctor data or use defaults
  const services = doctor.services || ['General Consultation', 'Follow-up Visit', 'Health Checkup', 'Prescription Renewal', 'Lab Review', 'Specialist Referral'];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-foreground/70">
          <span className="text-primary">●</span>
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>›</span>
          <Link href="/doctors" className="hover:text-primary">Doctors</Link>
          <span>›</span>
          <span>{doctor.name}</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Doctor Profile</h1>

        {/* Doctor Header Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <img 
                  src={doctor.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"} 
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"
                  }}
                />
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-3xl font-bold">{doctor.name}</h2>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                      {doctor.rating} <Star className="w-3 h-3" />
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${isRegisteredDoctor ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isRegisteredDoctor ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{doctor.experience} Experience</p>
                  <p className="text-primary font-bold mb-3">{doctor.specialty}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {doctor.age ? `${doctor.age} years` : 'Age not specified'} • {doctor.gender || 'Gender not specified'}
                  </p>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">{doctor.rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{doctorLocationLabel}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">{doctor.specialty}</span>
                    {doctor.available && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Available</span>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart
                      className={`w-5 h-5 cursor-pointer ${isFavourite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      onClick={handleToggleFavourite}
                    />
                    <span className="text-sm">Save</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">{reviews.length} Feedback</div>
                  <div className="text-lg font-semibold mb-4 text-blue-600">{doctor.fee || 'Contact'} per session</div>
                  {isRegisteredDoctor ? (
                    <Link href={`/booking?doctorId=${doctor.id}`}>
                      <Button className="bg-primary hover:bg-primary-600 text-white rounded-full px-8">
                        Book Appointment
                      </Button>
                    </Link>
                  ) : (
                    <Button className="bg-gray-200 text-gray-700 rounded-full px-8 cursor-not-allowed hover:bg-gray-200">
                      Information Only
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-semibold whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* About Me */}
            <div>
              <h3 className="text-xl font-bold mb-4">About Me</h3>
              <p className="text-gray-600 leading-relaxed">
                {doctor.about || `${doctor.name} is a highly qualified ${doctor.specialty} specialist with ${doctor.experience} of experience. 
                Committed to providing exceptional patient care and staying current with the latest medical advancements in ${doctor.specialty}. 
                Known for a compassionate approach and thorough consultations that put patients at ease.`}
              </p>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-xl font-bold mb-4">Education</h3>
              <div className="space-y-4">
                {(doctor.education || ['Medical Degree', 'Specialization in ' + doctor.specialty]).map((edu, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{edu}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work & Experience */}
            <div>
              <h3 className="text-xl font-bold mb-4">Work & Experience</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{doctor.specialty} Specialist</p>
                    <p className="text-gray-600">{doctor.experience}</p>
                  </div>
                </div>
                {doctor.location && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Current Location</p>
                      <p className="text-gray-600">{doctorLocationLabel}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-4">Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="text-blue-600">✓</span> {service}
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="text-xl font-bold mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full">{doctor.specialty}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Practice Location</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{doctor.locationLabel || doctorLocationLabel}</span>
              </div>
              <p className="text-gray-600">Contact the clinic for detailed address and directions.</p>
            </div>
            <ClinicLocationMap
              label={doctor.locationLabel || (typeof doctor.location === 'string' ? doctor.location : doctor.location?.label) || 'Clinic location'}
              coordinates={doctor.locationCoordinates || (typeof doctor.location === 'object' ? doctor.location?.coordinates || doctor.location?.geo?.coordinates : undefined) || null}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Patient Reviews ({reviews.length})</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">{doctor.averageRating || doctor.rating || '0.0'}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= (doctor.averageRating || doctor.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {review.patientName ? review.patientName.split(' ').map(n => n[0]).join('') : 'P'}
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 italic">No reviews yet. Be the first to leave one!</p>
              </div>
            )}

            {/* Review Submission Form */}
            {user?.role === 'patient' && (
              <form onSubmit={handleSubmitReview} className="p-5 bg-gray-50 rounded-xl border border-gray-100 mt-8">
                <h4 className="font-bold text-gray-900 mb-3">Leave a Review</h4>
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmittingReview}>
                  {isSubmittingReview ? <LogoLoader size={16} className="h-4 w-4 mr-2" /> : null}
                  Submit Review
                </Button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Business Hours</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              {doctor.schedule?.availableDays && doctor.schedule.availableDays.length > 0 ? (
                <div className="space-y-2">
                  {doctor.schedule.availableDays.map((day, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-0 border-gray-200">
                      <span className="font-semibold text-gray-700">{day}</span>
                      <span className="text-blue-600 font-medium">
                        {doctor.schedule?.availableHours && doctor.schedule.availableHours[index] 
                          ? doctor.schedule.availableHours[index] 
                          : 'Consultation Hours'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Business hours not specified. Please contact the clinic for availability.</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                * Hours may vary. Please contact the clinic to confirm availability.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function DoctorProfile() {
  return (
    <Suspense fallback={<Loading />}> {/* Use the Loading component as fallback */}
      <DoctorProfileContent />
    </Suspense>
  );
}
