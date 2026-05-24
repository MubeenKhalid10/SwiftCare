'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { PatientSidebar } from '@/components/patient/patient-sidebar'
import { useAuth } from '@/lib/auth-context'

export default function TermsAndConditionsPage() {
  const { user } = useAuth()
  const sections = [
    {
      title: 'Introduction',
      content:
        'Welcome to SwiftCare. These Terms & Conditions govern your use of the SwiftCare platform for booking healthcare appointments and related services. By using SwiftCare, you agree to these terms.',
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
        'Appointments are booked through SwiftCare and are subject to provider availability and the provider’s scheduling rules.',
        'Users must attend scheduled appointments or follow the provider’s cancellation policy.',
        'Cancellation or rescheduling fees, if any, are presented at the time of booking.',
      ],
    },
    {
      title: 'Medical Disclaimer',
      content: '',
      subsections: [
        'SwiftCare provides the platform for appointment scheduling; SwiftCare does not practice medicine and is not responsible for the professional services provided by healthcare providers.',
        'Healthcare providers are independent and responsible for the care they deliver. SwiftCare does not guarantee outcomes or the suitability of any provider.',
      ],
    },
    {
      title: 'Payment & Fees',
      content: '',
      subsections: [
        'Payments are processed via third-party payment providers. Charges, refunds, and any service fees are described at checkout.',
        'Providers or SwiftCare may charge cancellation or no-show fees as disclosed during booking.',
      ],
    },
    {
      title: 'Changes to Terms & Conditions',
      content:
        'SwiftCare may update these Terms & Conditions from time to time. We will post changes on the site and notify users where required by law.',
    },
    {
      title: 'User Conduct & Obligations',
      content: '',
      subsections: [
        'You must provide accurate information and act lawfully and respectfully toward providers and other users.',
        'You must not misuse the platform, submit fraudulent information, or attempt to access other users’ accounts.',
      ],
    },
    {
      title: 'Intellectual Property',
      content: '',
      subsections: [
        'All content on SwiftCare (branding, text, graphics) is owned by SwiftCare or its licensors. You may not reproduce content without permission.',
      ],
    },
    {
      title: 'Limitation of Liability',
      content: '',
      subsections: [
        'To the maximum extent permitted by law, SwiftCare is not liable for indirect, incidental, or consequential damages arising from use of the service.',
      ],
    },
    {
      title: 'Contact',
      content: '',
      subsections: [
        'For questions about these Terms, contact support@swiftcare.com.',
      ],
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-icon-bg to-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-gray-600 text-sm">Terms & Condition</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Terms & Condition</h1>
          </div>        </section>

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
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
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
