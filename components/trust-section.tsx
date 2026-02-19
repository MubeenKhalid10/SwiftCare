"use client"

import { Users, FileText, Clock, Shield } from "lucide-react"

const features = [
  { icon: Users, title: "Expert Doctors", description: "Certified medical professionals" },
  { icon: FileText, title: "Clear Profile", description: "Transparent qualifications" },
  { icon: Clock, title: "Scheduled", description: "Appointment management" },
  { icon: Shield, title: "Secure Data", description: "HIPAA compliant" },
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute top-20 right-10 w-40 h-40 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left content */}
          <div>
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              We are committed to understanding your unique needs and delivering care
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Our platform ensures you receive the best healthcare experience with professionals who truly care about
              your well-being.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition">
              Our Mission
            </button>
          </div>

          {/* Right side - Image placeholder */}
          <div className="relative h-96">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-gray-700 rounded-xl"></div>
              <div className="bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-blue-600 transition"
              >
                <Icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
