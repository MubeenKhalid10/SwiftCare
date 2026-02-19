"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function AppDownload() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">Download the Doccure App Today!</h2>
            <p className="text-blue-100 mb-8">
              Get instant access to book appointments, chat with doctors, and manage your health on the go
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
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
            <div className="absolute inset-0 bg-white/20 rounded-3xl backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-64 bg-white/30 rounded-2xl mb-4 mx-auto"></div>
                <p>Mobile App Screenshot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
