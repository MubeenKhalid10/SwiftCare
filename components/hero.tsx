"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Users, Clock, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getPlatformStats, type PlatformStats } from "@/lib/api"
import { resolveDoctorImage, onDoctorImageError } from "@/lib/image-utils"
import type { Doctor } from "@/lib/types"

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${Math.floor(value / 1000).toLocaleString()}k+`
  }
  return value.toLocaleString()
}

function formatRating(value: number): string {
  if (value <= 0) return "—"
  return value.toFixed(1)
}

function renderStars(rating: number) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)))
  return [...Array(5)].map((_, index) => (
    <Star
      key={index}
      className={`w-3.5 h-3.5 ${index < filled ? "fill-yellow-400 text-yellow-400" : "fill-none text-border"}`}
    />
  ))
}

function getFeaturedDoctorHighlight(doctor: Doctor | null): { label: string; value: string } {
  if (!doctor) {
    return { label: "Platform Reviews", value: "—" }
  }

  const patients = (doctor as Doctor & { patients?: string | number }).patients
  if (patients) {
    return {
      label: "Patients Treated",
      value: typeof patients === "number" ? formatCount(patients) : String(patients),
    }
  }

  if (doctor.experience) {
    return {
      label: "Experience",
      value: String(doctor.experience).includes("+") ? String(doctor.experience) : `${doctor.experience}+ years`,
    }
  }

  if ((doctor.reviewCount || 0) > 0) {
    return {
      label: "Patient Reviews",
      value: `${doctor.reviewCount} review${doctor.reviewCount === 1 ? "" : "s"}`,
    }
  }

  return { label: "Consultation Fee", value: doctor.fee || "—" }
}

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const data = await getPlatformStats()
        if (!cancelled) setStats(data)
      } catch (err) {
        console.error("Failed to load homepage stats:", err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

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

  const featuredDoctor = stats?.featuredDoctor ?? null
  const featuredHighlight = getFeaturedDoctorHighlight(featuredDoctor)
  const featuredRating = featuredDoctor?.averageRating || featuredDoctor?.rating || 0
  const featuredReviewCount = featuredDoctor?.reviewCount || 0
  const featuredSpecialty =
    featuredDoctor?.specialty || featuredDoctor?.specialization || "General Physician"

  return (
    <section className="border-section-bottom relative overflow-hidden bg-gradient-to-br from-background via-icon-bg/20 to-background pt-20 pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(1,101,252,0.10),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(224,241,255,0.08),transparent_35%)]"></div>
      <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-20 h-56 w-56 rounded-full bg-icon-bg/50 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-foreground">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-icon-bg px-4 py-2 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse-gentle"></div>
              <span className="text-sm font-semibold tracking-wide text-primary">Your Healthcare</span>
            </div>

            <h1 className="text-balance mb-6 text-4xl font-bold leading-tight lg:text-6xl">
              Discover Health: Find Your Trusted <span className="text-gradient-primary">Doctors</span> Today
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-foreground/70 max-w-lg">
              Connect with expert healthcare professionals and book appointments with ease — live queue tracking included.
            </p>

            {/* Search bar */}
            <div className="mb-8 flex rounded-full border border-border/60 bg-card/90 p-2 shadow-md shadow-primary/8 backdrop-blur-lg transition-all hover:shadow-lg hover:shadow-primary/12 hover:border-primary/30 focus-within:border-primary/40 focus-within:shadow-lg">
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent px-5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none font-medium text-sm"
              />
              <button
                onClick={handleSearch}
                className="rounded-full bg-gradient-to-r from-primary to-primary-600 px-6 py-2.5 font-semibold !text-white shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 active:scale-95 text-sm"
              >
                Search
              </button>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <Link href="/booking">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-600 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 font-semibold">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button variant="outline" size="lg" className="border-border/70 hover:border-primary/40 hover:bg-icon-bg font-semibold">
                  Browse Doctors
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-6 flex-wrap">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {renderStars(stats?.platformRating || 0)}
                    </div>
                    <span className="font-medium">
                      {stats?.totalReviews
                        ? `${formatRating(stats.platformRating)}/5 Rating`
                        : "No ratings yet"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>
                      {stats?.totalPatients
                        ? `${formatCount(stats.totalPatients)} Patients`
                        : stats?.totalReviews
                          ? `${formatCount(stats.totalReviews)} Reviews`
                          : "Growing community"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      {stats?.totalDoctors
                        ? `${formatCount(stats.totalDoctors)} Verified Doctors`
                        : "Verified doctors joining soon"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="relative h-96 lg:h-[480px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex h-[360px] w-72 items-center justify-center rounded-3xl border border-border/50 bg-card/80 shadow-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : featuredDoctor ? (
              <>
                <Link
                  href={`/doctor-profile?id=${featuredDoctor.id}`}
                  className="relative flex h-[360px] w-72 items-start overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-xl shadow-primary/10 backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
                >
                  <img
                    src={resolveDoctorImage(featuredDoctor.image)}
                    alt={featuredDoctor.name}
                    className="w-full h-full object-cover"
                    onError={onDoctorImageError}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card/95 to-transparent p-4 pt-12">
                    <p className="text-sm font-semibold text-foreground">{featuredDoctor.name}</p>
                    <p className="text-xs text-primary font-medium">{featuredSpecialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {featuredReviewCount > 0
                          ? `${formatRating(featuredRating)} (${featuredReviewCount} review${featuredReviewCount === 1 ? "" : "s"})`
                          : "No reviews yet"}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="absolute top-6 right-0 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg shadow-primary/10 backdrop-blur-lg transition-all hover:shadow-xl hover:shadow-primary/15">
                  <div className="flex items-center space-x-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse-gentle"></div>
                    <span className="text-sm font-semibold text-foreground">Available Now</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.availableTodayCount
                      ? `${stats.availableTodayCount} doctor${stats.availableTodayCount === 1 ? "" : "s"} available today`
                      : stats?.totalDoctors
                        ? `${stats.totalDoctors} doctor${stats.totalDoctors === 1 ? "" : "s"} on platform`
                        : "Doctors joining soon"}
                  </p>
                </div>

                <div className="absolute bottom-4 left-0 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg shadow-primary/10 backdrop-blur-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-icon-bg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{featuredHighlight.label}</p>
                      <p className="text-sm font-bold text-foreground">{featuredHighlight.value}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[360px] w-72 items-center justify-center rounded-3xl border border-border/50 bg-card/80 p-6 text-center shadow-xl">
                <p className="text-sm text-muted-foreground">Doctor profiles will appear here once providers join the platform.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
