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
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          Your Questions are <span className="text-blue-600">Answered</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
              >
                <span className="font-medium text-left text-gray-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === idx && <div className="px-6 pb-6 text-gray-600 border-t border-gray-100">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
