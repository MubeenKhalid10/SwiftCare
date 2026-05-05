'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { PatientSidebar } from '@/components/patient/patient-sidebar'
import { useAuth } from '@/lib/auth-context'

export default function PrivacyPolicyPage() {
  const { user } = useAuth()
  const sections = [
    {
      title: 'Introduction',
      content:
        'Welcome to SwiftCare. SwiftCare is a healthcare appointment platform that connects patients with licensed healthcare professionals and clinics. This Privacy Policy explains how we collect, use, disclose, and protect your personal data when you use our services.',
      subsections: [
        'You must be at least 18 years old to use this website or have parental/guardian consent.',
        'Ensure that all information provided is accurate and up-to-date.',
        'You are responsible for maintaining the confidentiality of your account and credentials.',
      ],
    },
    {
      title: 'Booking Appointments',
      content: '',
      subsections: [
        'Appointments are booked in real-time through SwiftCare and are subject to provider availability.',
        'Users are responsible for attending scheduled appointments or canceling in accordance with the provider’s cancellation policy.',
        'Cancellation or rescheduling rules and any applicable fees are disclosed at booking.',
      ],
    },
    {
      title: 'Medical Disclaimer',
      content: '',
      subsections: [
        'SwiftCare provides a platform to facilitate appointments and related communications; SwiftCare is not a healthcare provider and does not provide medical advice.',
        'Healthcare providers listed on SwiftCare are independent practitioners; you should verify provider credentials and seek a second opinion for medical concerns.',
      ],
    },
    {
      title: 'Payment & Fees',
      content: '',
      subsections: [
        'Payments for services may be processed through third-party payment providers; fees, taxes, and refund policies are disclosed at checkout.',
        'Providers may enforce cancellation or no-show fees; such fees are shown during booking.',
      ],
    },
    {
      title: 'Changes to Privacy Policy',
      content:
        'SwiftCare may update this Privacy Policy from time to time. We will notify users of material changes via the website or email where required by law.',
    },
    {
      title: 'Information We Collect',
      content: '',
      subsections: [
        'Personal information you provide (name, email, phone, date of birth, profile photo).',
        'Health-related information you enter when booking (symptoms, medical history) where required by providers.',
        'Transaction and payment data necessary to process payments.',
        'Usage and device data to improve the service (logs, cookies, IP address).',
      ],
    },
    {
      title: 'How We Use Your Information',
      content: '',
      subsections: [
        'To provide and improve SwiftCare services and to facilitate bookings and communications with providers.',
        'To process payments and send transactional notifications.',
        'To comply with legal obligations and to protect the safety and security of users.',
      ],
    },
    {
      title: 'Sharing & Disclosure',
      content: '',
      subsections: [
        'We share information with healthcare providers you book with so they can deliver care.',
        'We may share data with trusted service providers (payment processors, analytics) under contract.',
        'We do not sell personal data for advertising purposes.',
      ],
    },
    {
      title: 'Your Rights & Choices',
      content: '',
      subsections: [
        'You can access, correct, or delete your personal data where permitted by law.',
        'You may opt out of non-essential communications and marketing.',
        'Contact SwiftCare at privacy@swiftcare.com for data requests or questions.',
      ],
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600 text-sm">Privacy Policy</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-1 ${user?.role === 'patient' ? 'lg:grid-cols-4' : ''} gap-8`}>
              {user?.role === 'patient' && (
                <div className="lg:col-span-1 border rounded-xl overflow-hidden shadow-sm mb-auto">
                  <PatientSidebar />
                </div>
              )}

              <div className={`space-y-12 ${user?.role === 'patient' ? 'lg:col-span-3' : 'max-w-4xl mx-auto'}`}>
                {sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    {section.content && (
                      <p className="text-gray-700 mb-4">{section.content}</p>
                    )}
                    {section.subsections && (
                      <ul className="space-y-3">
                        {section.subsections.map((subsection, subIndex) => (
                          <li key={subIndex} className="flex items-start gap-3">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{subsection}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
