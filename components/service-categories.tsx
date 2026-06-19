"use client"

import { useRouter } from "next/navigation"
import { Heart, Bone, Brain, Baby, Activity, Wind, Stethoscope } from "lucide-react"

const categories = [
  { icon: Heart, label: "Cardiologist" },
  { icon: Bone, label: "Orthopedics" },
  { icon: Brain, label: "Neurologist" },
  { icon: Baby, label: "Pediatrics" },
  { icon: Activity, label: "Psychiatrics" },
  { icon: Wind, label: "Endocrinologist" },
  { icon: Stethoscope, label: "Dermatologist" },
]

export default function ServiceCategories() {
  const router = useRouter()

  const handleCategoryClick = (category: string) => {
    router.push(`/doctors?specialization=${encodeURIComponent(category)}`)
  }

  return (
    <section className="border-section-top border-section-bottom py-16 bg-gradient-to-b from-background to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="section-intro">Our Services</div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Browse by <span className="text-gradient-primary">Specialty</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => handleCategoryClick(category.label)}>
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-icon-bg flex items-center justify-center mb-4 border-2 border-primary/15 transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-2">
                  <Icon className="w-9 h-9 text-primary transition-colors duration-300 group-hover:text-white" />
                </div>
                <p className="text-sm lg:text-base font-medium text-foreground text-center group-hover:text-primary transition-colors duration-200">
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
