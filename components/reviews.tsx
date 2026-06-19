"use client"

import { useEffect, useState } from "react"
import { Star, Loader2, Quote } from "lucide-react"
import { getReviews, getDoctors } from "@/lib/api"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/avatar-utils"
import { resolvePatientImage, onPatientImageError } from "@/lib/image-utils"
import type { Review } from "@/lib/types"

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsData, doctorsData] = await Promise.all([
          getReviews(),
          getDoctors(),
        ])

        const doctorMap = new Map(
          doctorsData.map((doctor: any) => [String(doctor.id || doctor._id), doctor])
        )

        const topReviews = reviewsData
          .map((review: any) => {
            const doctor = doctorMap.get(String(review.doctorId))
            return {
              ...review,
              patientName: "Anonymous Patient",
              doctorName: review.doctorName || doctor?.name || "Unknown Doctor",
              comment: review.comment || review.text || review.notes || "",
              createdAt: review.createdAt || review.date || new Date().toISOString(),
            }
          })
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)

        setReviews(topReviews)
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
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  return (
    <section className="border-section-top border-section-bottom py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="section-intro">Testimonials</div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          What patients say about our <span className="text-gradient-primary">doctors' treatment</span>
        </h2>

        <p className="section-subheader mb-16">
          Join thousands of satisfied patients who have found their trusted healthcare providers
        </p>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-card rounded-xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 relative"
              >
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-border'}`}
                    />
                  ))}
                </div>
                <p className="text-foreground/80 mb-5 italic leading-relaxed text-sm">
                  "{review.comment || 'No review text provided.'}"
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 border-2 border-icon-bg">
                    <AvatarImage
                      src={resolvePatientImage(review.avatar)}
                      alt={review.patientName}
                      onError={onPatientImageError}
                    />
                    <AvatarFallback className="bg-icon-bg text-primary text-xs font-semibold">
                      {getInitials(review.patientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{review.patientName}</p>
                    <p className="text-xs text-muted-foreground">Posted on {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Review for <span className="font-medium text-primary">Dr. {(review as any).doctorName}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reviews available yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
