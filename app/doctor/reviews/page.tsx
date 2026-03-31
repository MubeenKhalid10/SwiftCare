'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import { useAuth } from '@/lib/auth-context';
import { getReviewsByDoctorId, getPatients } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import type { Review, Patient } from '@/lib/types';

interface ReviewWithPatient extends Review {
  patientName?: string;
  avatar?: string;
}

export default function DoctorReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const [reviewsData, patientsData] = await Promise.all([
          getReviewsByDoctorId(user.id),
          getPatients()
        ]);

        // Combine reviews with patient data
        const reviewsWithPatients = reviewsData.map(review => {
          const patient = patientsData.find(p => String(p.id) === String(review.patientId));
          return {
            ...review,
            patientName: patient?.name || 'Anonymous Patient',
            avatar: patient?.avatar || '/placeholder.svg'
          };
        });

        setReviews(reviewsWithPatients);
        setPatients(patientsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user?.id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DoctorSidebar />
          <div className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Doctor</span>
                  <span>&gt;</span>
                  <span>Reviews</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No reviews available yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Reviews from your patients will appear here.</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.avatar}
                          alt={review.patientName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{review.patientName}</h3>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating || 0)}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
