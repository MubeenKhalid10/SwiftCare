"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "How do I book an appointment with a doctor?",
    a: "You can easily book appointments through our platform by searching for doctors and selecting your preferred time slot.",
  },
  {
    q: "Can I request a callback instead of visiting the hospital?",
    a: "Yes, we offer online consultations and callback appointments for your convenience.",
  },
  {
    q: "What should I do if I need to reschedule my appointment?",
    a: "You can reschedule your appointment through your account dashboard up to 24 hours before the scheduled time.",
  },
  {
    q: "Can I book appointments for family members on behalf?",
    a: "Yes, you can add family members to your account and manage their appointments.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="border-section-top border-section-bottom py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="section-intro">FAQ</div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Your Questions are <span className="text-gradient-primary">Answered</span>
        </h2>
        <p className="section-subheader mb-12">
          Everything you need to know about using SwiftCare.
        </p>

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
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-muted/40"
              >
                <span className={`font-semibold text-sm sm:text-base transition-colors ${openIndex === idx ? "text-primary" : "text-foreground"}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 ml-4 transition-all duration-300 ${
                    openIndex === idx ? "rotate-180 text-primary" : "text-muted-foreground"
                  }`}
                />
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
  )
}
