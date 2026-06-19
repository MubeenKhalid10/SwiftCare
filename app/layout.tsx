import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { NotificationRealtimeListener } from '@/components/notification-realtime-listener'
import './globals.css'

import { Chatbot } from '@/components/chatbot'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
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
