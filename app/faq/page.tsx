'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Plus } from 'lucide-react'

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
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-icon-bg to-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-gray-600 text-sm">FAQ</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">FAQ</h1>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {FAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-gray-900 text-sm md:text-base">
                      {faq.question}
                    </span>
                    <Plus
                      className={`w-6 h-6 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedId === faq.id ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-6 pb-6 border-t border-gray-200 text-gray-600 text-sm">
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
