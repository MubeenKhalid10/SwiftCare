'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

export default function DoctorReviews() {
  const reviews = [
    {
      id: 1,
      patient: 'Adrian',
      date: '15 Mar 2024',
      rating: 4,
      text: 'Dr. Edaiin Hendry has been my family\'s trusted doctor for years. Their genuine care and thorough approach to our health concerns make every visit reassuring. Dr. Edaiin Hendry\'s ability to listen and explain complex health issues in understandable terms is exceptional. We are grateful to have such a dedicated physician by our side'
    },
    {
      id: 2,
      patient: 'Kelly',
      date: '11 Mar 2024',
      rating: 4,
      text: 'I recently completed a series of dental treatments with Dr.Edaiin Hendry, and I couldn\'t be more pleased with the results. From my very first appointment, Dr. Edaiin Hendry and their team made me feel completely at ease, addressing all of my concerns with patience and understanding. Their state-of-the-art office and the staff\'s attention to comfort and cleanliness were beyond impressive.'
    },
    {
      id: 3,
      patient: 'Dr Edaiin Hendry',
      date: '2 days ago',
      isReply: true,
      text: 'Thank you so much for taking the time to share your experience at our dental clinic. We are deeply touched by your kind words and thrilled to hear about the positive impact of your treatment. Our team strives to provide a comfortable, welcoming environment for all our patients, and it\'s heartening to know we achieved this for you.'
    },
    {
      id: 4,
      patient: 'Samuel',
      date: '08 Mar 2024',
      rating: 4,
      text: 'From my first consultation through to the completion of my treatment, Dr. Edaiin Hendry, my dentist, has been nothing short of extraordinary. Dental visits have always been a source of anxiety for me, but Dr. Hendry\'s office provided an atmosphere of calm and reassurance that I had not experienced elsewhere. Highly Recommended!'
    }
  ];

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

              <Card>
                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold">Overall Rating</h2>
                      <div className="text-3xl font-bold">4.0</div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span key={i} className="text-2xl text-yellow-400">★</span>
                        ))}
                        <span className="text-2xl text-gray-300">★</span>
                      </div>
                      <span className="text-sm text-gray-500">14 Jan 26 - 14 Jan 26</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className={`p-4 rounded-lg ${review.isReply ? 'bg-gray-50 ml-8' : 'bg-white border'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center">
                            <span>🧑</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{review.patient}</p>
                              <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                            {review.rating && (
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4].map((i) => (
                                  <span key={i} className="text-yellow-400">★</span>
                                ))}
                                <span className="text-gray-300">★</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          ← Reply
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
                    <Button variant="outline" size="sm">&lt;</Button>
                    <Button variant="outline" size="sm">1</Button>
                    <Button size="sm" className="bg-blue-600">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">4</Button>
                    <span className="text-sm text-gray-600">...</span>
                    <Button variant="outline" size="sm">&gt;</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
