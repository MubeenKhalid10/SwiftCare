'use client'

import Header from '@/components/header'

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      'These Terms & Conditions govern your use of the SwiftCare platform for booking healthcare appointments and related services. By using SwiftCare, you agree to these terms.',
      'You must be at least 18 years old, or have parental or guardian consent. You are responsible for maintaining the confidentiality of your account and for providing accurate information at all times.',
    ],
  },
  {
    title: 'Bookings, Payments & Conduct',
    paragraphs: [
      'Appointments are subject to provider availability and each provider\'s scheduling and cancellation policies. You are expected to attend scheduled appointments or cancel in accordance with those policies. Any fees, refunds, or no-show charges are disclosed at booking and processed through our payment partners.',
      'You agree to use SwiftCare lawfully and respectfully. You must not submit false information, misuse the platform, or attempt to access another user\'s account.',
    ],
  },
  {
    title: 'Medical Disclaimer & Liability',
    paragraphs: [
      'SwiftCare provides appointment scheduling technology only. We do not practice medicine and are not responsible for the care delivered by independent healthcare providers. SwiftCare does not guarantee outcomes or the suitability of any provider.',
      'To the fullest extent permitted by law, SwiftCare is not liable for indirect, incidental, or consequential damages arising from your use of the service. All platform content, branding, and materials remain the property of SwiftCare or its licensors.',
    ],
  },
  {
    title: 'Changes & Contact',
    paragraphs: [
      'We may update these Terms from time to time. Changes will be posted on this page and, where required, communicated to users. Continued use of SwiftCare after updates constitutes acceptance of the revised terms.',
      'For questions about these Terms, contact us at swiftcareofficial@gmail.com.',
    ],
  },
]

export default function TermsAndConditionsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-icon-bg to-background py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground text-sm">Terms & Conditions</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground">Terms & Conditions</h1>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-10">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-foreground/80 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
