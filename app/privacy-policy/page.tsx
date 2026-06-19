'use client'

import Header from '@/components/header'

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      'SwiftCare connects patients with licensed healthcare professionals for appointment booking and related services. This Privacy Policy describes how we collect, use, and protect your personal information when you use our platform.',
      'You must be at least 18 years old to use SwiftCare, or have parental or guardian consent. You are responsible for keeping your account credentials secure and for providing accurate, up-to-date information.',
    ],
  },
  {
    title: 'Information We Collect & Use',
    paragraphs: [
      'We collect information you provide when creating an account or booking an appointment, such as your name, email, phone number, date of birth, profile photo, and any health-related details required by your provider. We also collect payment and usage data needed to operate and improve the service.',
      'We use this information to facilitate bookings, process payments, communicate with you and your providers, comply with legal obligations, and maintain the security of our platform.',
    ],
  },
  {
    title: 'Sharing & Your Rights',
    paragraphs: [
      'We share relevant information with the healthcare providers you book with and with trusted service providers such as payment processors, under appropriate agreements. We do not sell your personal data for advertising purposes.',
      'Depending on applicable law, you may request access to, correction of, or deletion of your personal data, and you may opt out of non-essential communications. Contact us at swiftcareofficial@gmail.com with any privacy-related questions.',
    ],
  },
  {
    title: 'Medical Disclaimer & Updates',
    paragraphs: [
      'SwiftCare is a booking platform, not a healthcare provider. We do not offer medical advice. Providers listed on SwiftCare are independent practitioners, and you should verify their credentials before receiving care.',
      'We may update this Privacy Policy from time to time. Material changes will be posted on this page or communicated by email where required by law.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-icon-bg to-background py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground text-sm">Privacy Policy</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground">Privacy Policy</h1>
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
