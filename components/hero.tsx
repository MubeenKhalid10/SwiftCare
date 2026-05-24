"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/doctors?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push("/doctors")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section className="border-section-top border-section-bottom relative overflow-hidden bg-gradient-to-br from-background via-icon-bg/30 to-background pt-24 pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(1,101,252,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(224,241,255,0.08),transparent_30%)]"></div>
      <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl"></div>
      <div className="absolute bottom-0 left-20 h-48 w-48 rounded-full bg-icon-bg/40 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-foreground">
            <div className="mb-6 inline-flex items-center rounded-full border border-border bg-icon-bg px-4 py-2 backdrop-blur-md transition-all hover:border-primary/40">
              <span className="text-sm font-medium tracking-wide text-primary">Your Healthcare</span>
            </div>

            <h1 className="text-balance mb-6 text-5xl font-bold leading-tight lg:text-6xl">
              Discover Health: Find Your Trusted <span className="text-gradient-primary">Doctors</span> Today
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-foreground/70">
              Connect with expert healthcare professionals and book appointments with ease
            </p>

            {/* Search bar */}
            <div className="mb-8 flex rounded-full border border-border bg-white/90 p-2 shadow-md shadow-primary/10 backdrop-blur-lg transition-all hover:shadow-lg hover:shadow-primary/15 hover:border-primary/40">
              <input
                type="text"
                placeholder="Search doctors,..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent px-6 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none font-medium"
              />
              <button 
                onClick={handleSearch}
                className="rounded-full bg-gradient-to-r from-primary to-primary-600 px-6 py-3 font-medium text-white shadow-md shadow-primary/25 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 active:scale-95">
                Search
              </button>
            </div>

            <div className="flex gap-4 items-center flex-wrap">
              <Link href="/booking">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-600 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button variant="outline" size="lg">
                  Browse Doctors
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Doctor image placeholder */}
          <div className="relative h-96 lg:h-full flex items-center justify-center">
            <div className="relative flex h-80 w-64 items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-white/60 p-4 shadow-lg shadow-primary/15 backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/25">
              <div className="text-center">
                <div className="relative mx-auto mb-4 flex h-40 w-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-icon-bg shadow-md shadow-primary/15">
                  <span className="relative z-10 text-sm font-semibold text-foreground">Doctor Image</span>
                  <img
                    src="https://plus.unsplash.com/premium_vector-1714618853170-099b7070c9c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D"
                    alt="Doctor"
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                  />
                </div>
                <p className="text-sm text-foreground/70 font-medium">Professional Healthcare Provider</p>
              </div>
            </div>

            {/* Badge */}
            <div className="absolute bottom-0 right-0 rounded-2xl border border-border bg-white/95 p-4 shadow-lg shadow-primary/15 backdrop-blur-lg transition-all hover:shadow-xl hover:shadow-primary/25">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse-gentle"></div>
                <span className="text-sm font-semibold text-foreground">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
