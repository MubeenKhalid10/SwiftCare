"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-blue-500 pt-20 pb-32 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-20 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white">
            <div className="inline-block bg-white/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-white">Your Healthcare</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
              Discover Health: Find Your Trusted <span className="text-yellow-300">Doctors</span> Today
            </h1>

            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Connect with expert healthcare professionals and book appointments with ease
            </p>

            {/* Search bar */}
            <div className="flex bg-white rounded-full p-2 mb-8 shadow-lg">
              <input
                type="text"
                placeholder="Search doctors, hospital..."
                className="flex-1 px-6 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition">
                Search
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <Link href="/booking">
                <Button size="lg" className="bg-blue-400 hover:bg-blue-500 text-white">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 bg-transparent">
                  Browse Doctors
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Doctor image placeholder */}
          <div className="relative h-96 lg:h-full flex items-center justify-center">
            <div className="relative w-64 h-80 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-40 bg-gradient-to-br from-blue-300 to-blue-200 rounded-xl mb-4 mx-auto flex items-center justify-center">
                  <span className="text-blue-900 font-semibold">Doctor Image</span>
                </div>
                <p className="text-white text-sm">Professional Healthcare Provider</p>
              </div>
            </div>

            {/* Badge */}
            <div className="absolute bottom-0 right-0 bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-gray-900">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
