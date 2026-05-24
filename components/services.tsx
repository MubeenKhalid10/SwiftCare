"use client"

import { useState } from "react"
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
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className="border-section-top border-section-bottom py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-center mb-4">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            Why Choose Us
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-16">
          Compelling <span className="text-primary">Reasons</span> to Choose
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon
            const isActive = active === idx

            return (
              <div
                key={idx}
                onMouseEnter={() => setActive(idx)}
                onMouseLeave={() => setActive(null)}
                className={`p-8 border rounded-xl cursor-pointer transition-all duration-300
                  ${isActive 
                    ? "bg-primary text-white shadow-2xl scale-105 border-primary" 
                    : "bg-white border-gray-100 hover:shadow-lg hover:-translate-y-2"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition
                  ${isActive ? "bg-white/20" : "bg-primary/10"}`}
                >
                  <Icon
                    className={`w-6 h-6 transition
                    ${isActive ? "text-white" : "text-primary"}`}
                  />
                </div>

                <h3 className="text-xl font-bold mb-4">{service.title}</h3>

                <p
                  className={`leading-relaxed transition
                  ${isActive ? "text-primary/20" : "text-foreground/60"}`}
                >
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}