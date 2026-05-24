"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FooterCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-white to-background">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border-2 border-primary/25 bg-white/80 px-6 py-12 shadow-lg shadow-primary/15 backdrop-blur-lg sm:px-10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 hover:border-primary/40">
          <h2 className="text-balance mb-6 text-5xl font-bold text-foreground">
            Working for Your <span className="text-gradient-primary">Better Health</span>
          </h2>
          <p className="mb-8 text-xl text-foreground/70 font-medium">Connect with trusted healthcare professionals today</p>

          <Link href="/doctors">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-600 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40">
              Book an Appointment
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
