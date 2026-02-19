"use client"

import { Heart, Bone, Brain, Baby, Activity, Wind } from "lucide-react"

const categories = [
  { icon: Heart, label: "Cardiology", color: "bg-cyan-100" },
  { icon: Bone, label: "Orthopedics", color: "bg-blue-100" },
  { icon: Brain, label: "Neurology", color: "bg-purple-100" },
  { icon: Baby, label: "Pediatrics", color: "bg-pink-100" },
  { icon: Activity, label: "Psychiatry", color: "bg-orange-100" },
  { icon: Wind, label: "Endocrinology", color: "bg-green-100" },
  { icon: Heart, label: "Dermatology", color: "bg-red-100" },
]

export default function ServiceCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Our Services
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6">
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`${category.color} w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:shadow-lg transition`}
                >
                  <Icon className="w-10 h-10 text-gray-700" />
                </div>
                <p className="text-sm lg:text-base font-medium text-gray-700 text-center">{category.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
