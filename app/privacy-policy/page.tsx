'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Introduction',
      content:
        'Welcome to Doccure, a platform that allows you to book appointments with healthcare professionals. By using our services, you agree to these Terms & Conditions. Please read them carefully before proceeding.',
      subsections: [
        'You must be at least 18 years old to use this website or have parental/guardian consent.',
        'Ensure that all information provided is accurate and up-to-date.',
        'You are responsible for maintaining the confidentiality of your account and password.',
      ],
    },
    {
      title: 'Booking Appointments',
      content: '',
      subsections: [
        'Appointments are booked in real-time, subject to availability.',
        'Users are responsible for attending the scheduled appointments or canceling in a timely manner.',
        'Cancellations should be made before the appointment to avoid any penalties.',
      ],
    },
    {
      title: 'Medical Disclaimer',
      content: '',
      subsections: [
        'Doccure provides a platform for scheduling appointments and is not responsible for the medical services provided.',
        'Healthcare providers listed on the platform are independent practitioners, and [Website Name] does not guarantee the quality or accuracy of medical advice provided.',
      ],
    },
    {
      title: 'Payment & Fees',
      content: '',
      subsections: [
        'Payment for appointments may be made through [Payment Method] and is subject to [Insert Payment Terms].',
        'Any additional fees, such as cancellation or no-show fees, will be disclosed at the time of booking.',
      ],
    },
    {
      title: 'Changes to Privacy Policy',
      content:
        'Doccure may update these Privacy Policy periodically. Any changes will be communicated through the website or via email.',
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
          <div className="max-w-4xl mx-auto space-y-12">
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
        </section>
      </main>
      <Footer />
    </>
  )
}
