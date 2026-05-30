'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import { useAuth } from '@/lib/auth-context';
import { getReviewsByDoctorId, getPatients } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { LogoLoader } from '@/components/ui/logo-loader';
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
  
  const FALLBACK_AVATAR = 'data:image/jpeg;base64,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';
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
            avatar: patient?.avatar || FALLBACK_AVATAR
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
                    <LogoLoader size={32} className="h-8 w-8" />
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
                          onError={(e: any) => { e.currentTarget.src = FALLBACK_AVATAR }}
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
