import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { NotificationRealtimeListener } from '@/components/notification-realtime-listener'
import './globals.css'

import { Chatbot } from '@/components/chatbot'

const _geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'SwiftCare - Online Doctor Appointments',
  description: 'Book appointments with top doctors online. SwiftCare provides healthcare services with verified professionals.',
  generator: 'v0.app',
  icons: {
    icon: '/assets/Logo.png',
    apple: '/assets/Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.variable} ${_geistMono.variable} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <AuthProvider>
          <NotificationRealtimeListener />
          {children}
          <Chatbot />
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
