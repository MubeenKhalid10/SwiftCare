"use client"

import { Zap, Users, LinkIcon } from "lucide-react"

const services = [
  {
    icon: Zap,
    title: "Affordable Care",
    description: "Get expert medical care at competitive prices with transparent billing",
  },
  {
    icon: Users,
    title: "Patient Centered",
    description: "Your health and comfort are our top priority in every interaction",
  },
  {
    icon: LinkIcon,
    title: "Connected Access",
    description: "Seamlessly connect with doctors through our integrated platform",
  },
]

export default function Services() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Why Choose Us
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-16">
          Compelling <span className="text-blue-600">Reasons</span> to Choose
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <div key={idx} className="p-8 border border-gray-100 rounded-xl hover:shadow-lg transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
