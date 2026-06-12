"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function AppDownload() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">Download the SwiftCare App Today!</h2>
            <p className="text-primary/20 mb-8">
              Get instant access to book appointments, chat with doctors, and manage your health on the go
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                <span>App Store</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 bg-transparent">
                <span>Google Play</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="relative h-96">
            <img
                src="/assets/app.jpeg" // Replace with your image path
                alt="Mobile App Screenshot"
                className="w-full h-full object-contain rounded-3xl"
              />
          </div>
        </div>
      </div>
    </section>
  )
}
