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
    <section className="border-section-top border-section-bottom py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-center mb-4">
          <div className="section-intro">Why Choose Us</div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Compelling <span className="text-gradient-primary">Reasons</span> to Choose
        </h2>
        <p className="section-subheader mb-16">
          We put your health first with a platform built for ease, safety, and quality care.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon
            const isActive = active === idx

            return (
              <div
                key={idx}
                onMouseEnter={() => setActive(idx)}
                onMouseLeave={() => setActive(null)}
                className={`p-8 border-2 rounded-xl cursor-pointer transition-all duration-300
                  ${isActive
                    ? "bg-primary text-white shadow-2xl scale-105 border-primary"
                    : "bg-card border-border/60 hover:shadow-lg hover:border-primary/40 hover:-translate-y-2"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-all duration-300
                  ${isActive ? "bg-white/20" : "bg-icon-bg"}`}
                >
                  <Icon
                    className={`w-6 h-6 transition-colors duration-300
                    ${isActive ? "text-white" : "text-primary"}`}
                  />
                </div>

                <h3 className={`text-xl font-bold mb-4 ${isActive ? "text-white" : "text-foreground"}`}>
                  {service.title}
                </h3>

                <p className={`leading-relaxed transition-colors duration-300
                  ${isActive ? "text-white/80" : "text-muted-foreground"}`}
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
