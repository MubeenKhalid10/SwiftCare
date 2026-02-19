"use client"

import { Button } from "@/components/ui/button"

export default function FooterCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-5xl font-bold mb-6">
          Working for Your <span className="text-blue-100">Better Health</span>
        </h2>
        <p className="text-xl text-blue-100 mb-8">Connect with trusted healthcare professionals today</p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
          Book an Appointment
        </Button>
      </div>
    </section>
  )
}
