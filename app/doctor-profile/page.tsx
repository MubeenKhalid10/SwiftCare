'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Phone, Video, MapPin, Star, Clock, Circle, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/header';
import { getDoctorById, getReviewsByDoctorId, createReview } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getFavouriteDoctorIds, migrateGuestFavouritesToPatient, syncFavouritesFromBackend, toggleFavouriteDoctorWithSync } from '@/lib/utils';
import type { Doctor, Review } from '@/lib/types';
import Loading from './loading'; // Import the Loading component
import { ClinicLocationMap } from '@/components/doctor/clinic-location-map';
import { LogoLoader } from '@/components/ui/logo-loader';
import { resolveDoctorImage, onDoctorImageError } from '@/lib/image-utils';

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

    const doctorId = doctor.id;

    async function syncFavouriteState() {
      if (user?.id) {
        await syncFavouritesFromBackend(user.id)
      }
      const favouriteIds = getFavouriteDoctorIds(user?.id);
      setIsFavourite(favouriteIds.includes(String(doctorId)));
    }

    syncFavouriteState()
  }, [doctor?.id, user?.id]);

  const handleToggleFavourite = async () => {
    if (!doctor?.id) return;
    try {
      const next = await toggleFavouriteDoctorWithSync(doctor.id, user?.id);
      setIsFavourite(next);
    } catch {
      toast.error('Failed to update favourites');
    }
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col justify-center items-center py-24">
          <p className="text-destructive mb-4">{error || 'Doctor not found'}</p>
          <Link href="/doctors">
            <Button className="bg-primary text-white hover:bg-primary-600">Browse Doctors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-foreground/70">
          <Circle className="w-2 h-2 fill-primary text-primary" />
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>›</span>
          <Link href="/doctors" className="hover:text-primary">Doctors</Link>
          <span>›</span>
          <span>{doctor.name}</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Doctor Profile</h1>

        {/* Doctor Header Card */}
        <div className="bg-card border border-border/60 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <img 
                  src={resolveDoctorImage(doctor.image)} 
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={onDoctorImageError}
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
                  <p className="text-muted-foreground mb-2">{doctor.experience} Years Experience</p>
                  <p className="text-primary font-bold mb-3">{doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {doctor.age ? `${doctor.age} years` : 'Age not specified'} • {doctor.gender || 'Gender not specified'}
                  </p>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-foreground">{doctor.rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
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
                      className={`w-5 h-5 cursor-pointer ${isFavourite ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                      onClick={handleToggleFavourite}
                    />
                    <span className="text-sm">Mark doctor favorite</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">{reviews.length} Feedback</div>
                  <div className="text-lg font-semibold mb-4 text-primary">{doctor.fee || 'Contact'} per session</div>
                  {isRegisteredDoctor ? (
                    <Link href={`/booking?doctorId=${doctor.id}`}>
                      <Button className="bg-primary hover:bg-primary-600 text-white rounded-full px-8">
                        Book Appointment
                      </Button>
                    </Link>
                  ) : (
                    <Button className="bg-muted text-muted-foreground rounded-full px-8 cursor-not-allowed hover:bg-muted">
                      Information Only
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
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
              <h3 className="text-xl font-bold mb-4">About</h3>
              <p className="text-muted-foreground leading-relaxed">
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
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{edu}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-xl font-bold mb-4">Experience</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{doctor.specialty} Specialist</p>
                    <p className="text-muted-foreground">{doctor.experience} Years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="text-xl font-bold mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-icon-bg text-primary px-4 py-2 rounded-full font-medium">{doctor.specialty}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Location</h3>
            <div className="bg-muted/40 p-6 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{doctor.locationLabel || doctorLocationLabel}</span>
              </div>
              <p className="text-muted-foreground text-sm">Contact the clinic for detailed address and directions.</p>
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
                <span className="text-lg font-bold text-primary">{doctor.averageRating || doctor.rating || '0.0'}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= (doctor.averageRating || doctor.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border/50 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-icon-bg text-primary font-semibold">
                            {review.patientName ? review.patientName.split(' ').map(n => n[0]).join('') : 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{review.patientName || 'Anonymous Patient'}</p>
                          <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground italic">No reviews yet. Be the first to leave one!</p>
              </div>
            )}

            {/* Review Submission Form */}
            {user?.role === 'patient' && (
              <form onSubmit={handleSubmitReview} className="p-5 bg-muted/30 rounded-xl border border-border/50 mt-8">
                <h4 className="font-bold text-foreground mb-3">Leave a Review</h4>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${s <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your experience with this doctor..."
                  className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-sm mb-3 min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                {reviewError && <p className="text-destructive text-xs mb-3">{reviewError}</p>}
                <Button type="submit" className="bg-primary hover:bg-primary-600 text-white" disabled={isSubmittingReview}>
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
            <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
              {doctor.schedule?.availableDays && doctor.schedule.availableDays.length > 0 ? (
                <div className="space-y-2">
                  {doctor.schedule.availableDays.map((day, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-0 border-border/50">
                      <span className="font-semibold text-foreground">{day}</span>
                      <span className="text-primary font-medium">
                        {doctor.schedule?.availableHours && doctor.schedule.availableHours[index] 
                          ? doctor.schedule.availableHours[index] 
                          : 'Consultation Hours'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Business hours not specified. Please contact the clinic for availability.</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border/50">
                * Hours may vary. Please contact the clinic to confirm availability.
              </p>
            </div>
          </div>
        )}
      </main>

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
