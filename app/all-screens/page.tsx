'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function AllScreens() {
  const screens = [
    { category: 'Public Pages', links: [
      { name: 'Home', url: '/' },
      { name: 'About Us', url: '/about' },
      { name: 'FAQ', url: '/faq' },
      { name: 'Browse Doctors', url: '/doctors' },
      { name: 'Contact Us', url: '/contact-us' },
      { name: 'Privacy Policy', url: '/privacy-policy' },
      { name: 'Terms & Conditions', url: '/terms-and-conditions' },
      { name: 'Doctor Profile', url: '/doctor-profile' },
    ]},
    { category: 'Authentication', links: [
      { name: 'Patient Login', url: '/auth/login' },
      { name: 'Patient Register', url: '/auth/register' },
      { name: 'Doctor Signup Step 1', url: '/doctor/signup' },
      { name: 'Admin Login', url: '/admin/login' },
    ]},
    { category: 'Patient Dashboard', links: [
      { name: 'Patient Dashboard', url: '/patient-dashboard' },
      { name: 'My Appointments', url: '/patient/appointments' },
      { name: 'My Favourites', url: '/patient/favourites' },
      { name: 'Medical Records', url: '/patient/medical-records' },
      { name: 'Patient Settings', url: '/patient/settings' },
      { name: 'Checkout', url: '/patient/checkout' },
    ]},
    { category: 'Doctor Dashboard', links: [
      { name: 'Doctor Dashboard', url: '/doctor/dashboard' },
      { name: 'Doctor Appointments', url: '/doctor/appointments' },
      { name: 'Doctor Specialities', url: '/doctor/specialities' },
      { name: 'Available Timings', url: '/doctor/available-timings' },
      { name: 'My Patients', url: '/doctor/my-patients' },
      { name: 'Doctor Reviews', url: '/doctor/reviews' },
      { name: 'Doctor Accounts', url: '/doctor/accounts' },
      { name: 'Change Password', url: '/doctor/change-password' },
      { name: 'Profile Settings', url: '/doctor/profile-settings' },
    ]},
    { category: 'Admin Dashboard', links: [
      { name: 'Admin Dashboard', url: '/admin/dashboard' },
      { name: 'Admin Appointments', url: '/admin/appointments' },
      { name: 'Admin Doctors', url: '/admin/doctors' },
      { name: 'Admin Patients', url: '/admin/patients' },
      { name: 'Admin Transactions', url: '/admin/transactions' },
      { name: 'Admin Invoices', url: '/admin/invoices' },
      { name: 'Admin Specialities', url: '/admin/specialities' },
      { name: 'Admin Reviews', url: '/admin/reviews' },
      { name: 'Admin Profile', url: '/admin/profile' },
    ]},
    { category: 'Booking Flow', links: [
      { name: 'Booking (Multi-step form)', url: '/booking' },
    ]},
  ]

  return (
    <main className="w-full bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Screens Navigation</h1>
          <p className="text-lg text-gray-600">Click any link below to navigate to that screen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {screens.map((section) => (
            <div key={section.category} className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Navigation Guide</h2>
          <div className="space-y-4 text-gray-700">
            <p><strong>Public Pages:</strong> Accessible to all users without authentication</p>
            <p><strong>Authentication:</strong> Login/Register pages for different user roles</p>
            <p><strong>Patient Dashboard:</strong> Pages accessible to logged-in patients</p>
            <p><strong>Doctor Dashboard:</strong> Pages accessible to logged-in doctors</p>
            <p><strong>Admin Dashboard:</strong> Pages accessible to logged-in admins</p>
            <p><strong>Booking Flow:</strong> Multi-step appointment booking process</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
