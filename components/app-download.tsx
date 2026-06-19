"use client"

import { Smartphone } from "lucide-react"

export default function AppDownload() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary-600 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md mb-6">
              <Smartphone className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium tracking-wide">Mobile App</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Download the SwiftCare App Today!</h2>
            <p className="text-white/80 mb-8 leading-relaxed text-lg">
              Get instant access to book appointments, chat with doctors, and manage your health on the go.
            </p>
          </div>

          <div className="relative h-96 flex items-center justify-center">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/assets/app.jpeg"
                alt="Mobile App Screenshot"
                className="w-full h-full object-contain rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
