"use client"

import { useRouter } from "next/navigation"
import { Heart, Bone, Brain, Baby, Activity, Wind } from "lucide-react"

const categories = [
  { icon: Heart, label: "Cardiologist", color: "bg-primary/10" },
  { icon: Bone, label: "Orthopedics", color: "bg-primary/10" },
  { icon: Brain, label: "Neurologist", color: "bg-purple-100" },
  { icon: Baby, label: "Pediatrics", color: "bg-pink-100" },
  { icon: Activity, label: "Psychiatrics", color: "bg-orange-100" },
  { icon: Wind, label: "Endocrinologist", color: "bg-green-100" },
  { icon: Heart, label: "Dermatologist", color: "bg-red-100" },
]

export default function ServiceCategories() {
  const router = useRouter()

  const handleCategoryClick = (category: string) => {
    router.push(`/doctors?specialization=${encodeURIComponent(category)}`)
  }

  return (
    <section className="border-section-top border-section-bottom py-16 bg-gradient-to-b from-background to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            Our Services
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6">
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  onClick={() => handleCategoryClick(category.label)}
                  className={`${category.color} w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:shadow-lg transition`}
                >
                  <Icon className="w-10 h-10 text-gray-700" />
                </div>
                <p className="text-sm lg:text-base font-medium text-gray-700 text-center">
                  {category.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}