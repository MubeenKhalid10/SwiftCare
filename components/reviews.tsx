"use client"

import { useEffect, useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { getReviews, getPatients } from "@/lib/api"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/avatar-utils"
import type { Review } from "@/lib/types"

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPatients, setTotalPatients] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsData, patientsData] = await Promise.all([
          getReviews(),
          getPatients()
        ])
        // Get top 3 reviews by rating
        const topReviews = reviewsData
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)
        setReviews(topReviews)
        setTotalPatients(patientsData.length)
      } catch (err) {
        console.error("Failed to load reviews:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Trust & Safety
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-4">
          {totalPatients > 0 ? `${totalPatients.toLocaleString()}+` : '11k'} Users <span className="text-blue-600">Trust SwiftCare</span> Worldwide
        </h2>

        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Join thousands of satisfied patients who have found their trusted healthcare providers
        </p>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.patientName} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                      {getInitials(review.patientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{review.patientName}</p>
                    <p className="text-xs text-gray-500">Verified Patient • {review.date}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Review for <span className="font-medium text-blue-600">{review.doctorName}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No reviews available yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
