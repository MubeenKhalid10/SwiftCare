"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * This route is no longer used. The full booking and payment flow
 * is handled by /booking (multi-step wizard with Stripe integration).
 * Redirect anyone who lands here to the doctors page to start a proper booking.
 */
export default function CheckoutRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/doctors")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Redirecting...</p>
      </div>
    </div>
  )
}
