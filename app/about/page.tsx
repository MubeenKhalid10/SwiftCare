"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Reviews from "@/components/reviews"
import { ContactForm } from "@/components/contact-form"
import { ChevronDown, Users, Clock, Microscope, HandshakeIcon } from "lucide-react"

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const whyChooseUs = [
    {
      icon: Users,
      title: "Verified Doctors",
      description: "Choose from verified profiles with clear specialties, fees, and availability.",
    },
    {
      icon: Clock,
      title: "Smart Queue Booking",
      description: "See patients before you and get the next available time automatically.",
    },
    {
      icon: Microscope,
      title: "Live Queue Tracking",
      description: "Track your queue position in real time and get notified as your turn approaches.",
    },
    {
      icon: HandshakeIcon,
      title: "Secure & Simple",
      description: "Secure data handling with a simple, fast booking flow.",
    },
  ]

  const faqs = [
    { q: "How do I book an appointment?", a: "Pick a doctor, choose a date, and we show patients before you with the next available time." },
    { q: "How does queue booking work?", a: "Appointments are first-come, first-serve. Your time is assigned based on queue order." },
    { q: "Can I track my queue position?", a: "Yes. Use the Track Queue feature to see current serving and estimated wait time." },
    { q: "Is my data secure?", a: "We follow secure data practices to keep your personal information safe." },
  ]

  return (
    <main className="w-full bg-background text-foreground">
      <Header />

      <section className="py-20 bg-gradient-to-b from-icon-bg to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-intro mx-auto mb-4">About Us</div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              About <span className="text-gradient-primary">SwiftCare</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop"
                alt="Doctor with patient"
                className="rounded-xl h-40 w-full object-cover border border-border/40 shadow-sm"
              />
              <div className="flex flex-col gap-4">
                <div className="bg-primary text-primary-foreground p-6 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                  <div className="text-center">
                    <p className="text-sm text-primary-foreground/80">Over 25+ Years</p>
                    <p className="text-xl font-bold">Experience</p>
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop"
                  alt="Doctor smiling"
                  className="rounded-xl h-32 w-full object-cover border border-border/40 shadow-sm"
                />
              </div>
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop"
                alt="Doctor examination"
                className="rounded-xl h-40 w-full object-cover border border-border/40 shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1200&auto=format&fit=crop"
                alt="Doctor with patient"
                className="rounded-xl h-40 w-full object-cover border border-border/40 shadow-sm"
              />
            </div>
            <div className="space-y-5">
              <div className="section-intro">Our Mission</div>
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                We Ensure Best Medical Treatment For Your Health
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to simplify finding and booking appointments with highly qualified medical professionals.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We connect you with the right medical expert when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <div className="section-intro">Why Us</div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why <span className="text-gradient-primary">Choose Us</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="text-center p-6 border-2 border-primary/20 rounded-xl bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-icon-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Reviews />

      <section className="py-16 bg-background border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <div className="section-intro">FAQ</div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  openIndex === idx
                    ? "border-primary/40 shadow-sm shadow-primary/10"
                    : "border-border/70 hover:border-primary/25"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors"
                >
                  <span className={`font-semibold text-base transition-colors ${openIndex === idx ? "text-primary" : "text-foreground"}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 ml-4 transition-all duration-300 ${openIndex === idx ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                </button>
                {openIndex === idx && (
                  <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="section-intro mx-auto mb-4">Get In Touch</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Contact <span className="text-gradient-primary">Us</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Have a question or need help? Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  )
}
