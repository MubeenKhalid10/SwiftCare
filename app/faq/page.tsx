'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChevronDown } from 'lucide-react'

const FAQs = [
  {
    id: 1,
    question: 'How do I book an appointment?',
    answer: 'Select a doctor, choose an available date, and the system shows patients before you with the next available time.'
  },
  {
    id: 2,
    question: 'How does the queue-based booking work?',
    answer: 'Appointments are first-come, first-serve. Your time slot is assigned based on the number of patients already booked.'
  },
  {
    id: 3,
    question: 'Can I track my queue position?',
    answer: 'Yes. Use Track Queue to see current serving, your position, and estimated wait time in real time.'
  },
  {
    id: 4,
    question: 'Can I book for a family member?',
    answer: 'Yes. While booking, choose who the appointment is for and enter their details.'
  },
  {
    id: 5,
    question: 'Is my personal information secure?',
    answer: 'We use secure data handling practices to protect your information.'
  },
  {
    id: 6,
    question: 'Do doctors manage the live queue?',
    answer: 'Yes. Doctors start shifts, check in patients, and advance the queue from their dashboard.'
  },
  {
    id: 7,
    question: 'What if a doctor has no active shift?',
    answer: 'If no active shift is running, queue tracking and live serving will start once the doctor begins the shift.'
  },
  {
    id: 8,
    question: 'How do I find a doctor or specialty?',
    answer: 'Use the Doctors page to browse, filter, and open a doctor profile before booking.'
  },
  {
    id: 9,
    question: 'Will I receive appointment notifications?',
    answer: 'Yes. You receive confirmations and status updates, and queue notifications as your turn approaches.'
  },
  {
    id: 10,
    question: 'Can I cancel an appointment?',
    answer: 'Yes. You can cancel from your appointments page before the appointment time.'
  },
]

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-icon-bg to-background py-16 px-4 border-b border-border/40">
          <div className="max-w-7xl mx-auto text-center">
            <div className="section-intro mx-auto mb-4">Support</div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to know about using SwiftCare.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FAQs.map((faq) => (
                <div
                  key={faq.id}
                  className={`border rounded-xl bg-card transition-all duration-200 ${
                    expandedId === faq.id
                      ? 'border-primary/40 shadow-sm shadow-primary/10'
                      : 'border-border/70 hover:border-primary/25 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors rounded-xl"
                  >
                    <span className={`font-semibold text-sm md:text-base transition-colors ${expandedId === faq.id ? 'text-primary' : 'text-foreground'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 ml-3 transition-all duration-300 ${
                        expandedId === faq.id ? 'rotate-180 text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-5 pb-5 border-t border-border/50 pt-4 text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
