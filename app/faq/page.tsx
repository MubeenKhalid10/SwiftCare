'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Plus } from 'lucide-react'

const FAQs = [
  {
    id: 1,
    question: 'How do I book an appointment?',
  },
  {
    id: 2,
    question: 'Can I book appointments for family members through my account?',
  },
  {
    id: 3,
    question: 'Can i make an Appointment Online with White Plains Hospital Kendl?',
  },
  {
    id: 4,
    question: 'Is my payment information secure?',
  },
  {
    id: 5,
    question: 'Is my personal information secure?',
  },
  {
    id: 6,
    question: 'Can I use Doccure on my mobile device?',
  },
  {
    id: 7,
    question: 'Can I cancel or reschedule my appointment?',
  },
  {
    id: 8,
    question: 'How can I change my password or update my account information?',
  },
  {
    id: 9,
    question: 'How do I find a specific doctor or specialist?',
  },
  {
    id: 10,
    question: 'What happens if my chosen doctor is unavailable for the selected time?',
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
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
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
                      Answer content would go here
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
