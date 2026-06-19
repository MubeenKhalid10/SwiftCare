"use client"

import { Users, FileText, Clock, Shield } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Users, title: "Expert Doctors", description: "Certified medical professionals" },
  { icon: FileText, title: "Clear Profile", description: "Transparent qualifications" },
  { icon: Clock, title: "Scheduled", description: "Appointment management" },
  { icon: Shield, title: "Secure Data", description: "HIPAA compliant" },
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-foreground text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md mb-6">
              <span className="text-sm font-medium tracking-wide text-white/90">Our Mission</span>
            </div>
            <div className="w-16 h-16 bg-primary/20 border border-primary/40 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary-300" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight text-white">
              We are committed to understanding your unique needs and delivering care
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Our platform ensures you receive the best healthcare experience with professionals who truly care about
              your well-being.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              Our Mission
            </Link>
          </div>

          {/* Right side - Images */}
          <div className="relative h-96">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src="https://plus.unsplash.com/premium_vector-1682300485707-f6493f29a095?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Doctor consultation"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src="https://plus.unsplash.com/premium_vector-1682311126611-83ad4baa54f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9jdG9yfGVufDB8fDB8fHww"
                  alt="Online appointment system"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-300" />
                </div>
                <h3 className="font-bold text-base mb-2 !text-white">{feature.title}</h3>
                <p className="!text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
