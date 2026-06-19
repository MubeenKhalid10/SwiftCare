'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { LogoLoader } from '@/components/ui/logo-loader'
import { isGoogleIdTokenSession, parseGoogleRedirectHash } from '@/lib/google-auth'
import { useAuth } from '@/lib/auth-context'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { googleAuth, completeGoogleRedirect } = useAuth()
  const [message] = useState('Completing Google sign-in...')

  useEffect(() => {
    const googleError = searchParams.get('googleError')
    if (googleError) {
      toast.error(decodeURIComponent(googleError.replace(/\+/g, ' ')))
      router.replace('/auth/login')
      return
    }

    const session = parseGoogleRedirectHash(window.location.hash)
    if (!session) {
      toast.error('Google sign-in did not return a valid session')
      router.replace('/auth/login')
      return
    }

    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    void (async () => {
      const result = isGoogleIdTokenSession(session)
        ? await googleAuth(session.idToken, session.roleHint)
        : await completeGoogleRedirect(session)

      if (!result.success) {
        toast.error(result.error || 'Google sign-in failed')
        router.replace('/auth/login')
        return
      }

      toast.success('Successfully signed in with Google!')

      const nextPath = searchParams.get('next')
      const safeNext =
        nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
          ? nextPath
          : null

      if (safeNext) {
        router.replace(safeNext)
        return
      }

      const role = isGoogleIdTokenSession(session)
        ? session.roleHint
        : session.role

      if (role === 'doctor') {
        router.replace('/doctor/dashboard')
      } else if (role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/patient/appointments')
      }
    })()
  }, [completeGoogleRedirect, googleAuth, router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LogoLoader size={32} className="mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <LogoLoader size={32} />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}
