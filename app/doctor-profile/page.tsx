'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Phone, Video, MapPin, Star, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getDoctorById, getReviewsByDoctorId } from '@/lib/api';
import type { Doctor, Review } from '@/lib/types';
import Loading from './loading'; // Import the Loading component

function DoctorProfileContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <span className="text-blue-600">●</span>
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>›</span>
          <Link href="/doctors" className="hover:text-blue-600">Doctors</Link>
          <span>›</span>
          <span>{doctor.name}</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Doctor Profile</h1>

        {/* Doctor Header Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-300 to-blue-200 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {doctor.image ? (
                  <img 
                    src={doctor.image || "/placeholder.svg"} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-700 font-bold text-4xl">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-3xl font-bold">{doctor.name}</h2>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" /> {doctor.rating}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{doctor.experience} Experience</p>
                  <p className="text-blue-600 mb-4">⊙ {doctor.specialty}</p>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{doctor.rating} ({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{doctor.location || 'Location not specified'}</span>
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
                    <Heart className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-500" />
                    <span className="text-sm">Save</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">{reviews.length} Feedback</div>
                  <div className="text-lg font-semibold mb-4 text-blue-600">{doctor.fee} per session</div>
                  <Link href={`/booking?doctorId=${doctor.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                      Book Appointment
                    </Button>
                  </Link>
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
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
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
                      <p className="text-gray-600">{doctor.location}</p>
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
                <span className="font-semibold">{doctor.location || 'Location not specified'}</span>
              </div>
              <p className="text-gray-600">Contact the clinic for detailed address and directions.</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Patient Reviews ({reviews.length})</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.text}</p>
                    <p className="text-sm text-gray-500">- {review.patientName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet for this doctor.</p>
            )}
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Business Hours</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Saturday</span>
                  <span className="text-gray-600">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
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
