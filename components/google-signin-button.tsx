'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              width?: number
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  roleHint: 'patient' | 'doctor'
  onSuccess?: () => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  className?: string
}

const GSI_SCRIPT_ID = 'google-gsi-client'
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function getGoogleClientId(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/^"|"$/g, '').trim()
}

function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  const existing = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google sign-in')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GSI_SCRIPT_ID
    script.src = GSI_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google sign-in'))
    document.head.appendChild(script)
  })
}

export function GoogleSignInButton({
  roleHint,
  onSuccess,
  text = 'signin_with',
  className = '',
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { googleAuth } = useAuth()
  const router = useRouter()
  const googleClientId = getGoogleClientId()

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        if (!response?.credential) {
          toast.error('Google sign-in did not return a credential token')
          return
        }

        const result = await googleAuth(response.credential, roleHint)

        if (!result.success) {
          toast.error(result.error || 'Google sign-in failed')
          return
        }

        toast.success('Successfully signed in with Google!')

        if (onSuccess) {
          onSuccess()
          return
        }

        const stored = JSON.parse(localStorage.getItem('swiftcare_auth') || '{}')
        const role = stored.user?.role

        if (role === 'doctor') {
          router.push('/doctor/dashboard')
        } else if (role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/patient/appointments')
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Google sign-in failed'
        console.error('[google-signin]', errorMsg)
        toast.error(errorMsg)
      }
    },
    [googleAuth, roleHint, onSuccess, router]
  )

  useEffect(() => {
    const container = buttonRef.current
    if (!container) return

    let cancelled = false

    const renderButton = () => {
      if (cancelled || !container || !window.google?.accounts?.id) return

      container.innerHTML = ''

      if (!googleClientId) {
        container.innerHTML =
          '<p class="text-sm text-destructive">Google client ID is missing. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.</p>'
        return
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        width: Math.max(container.offsetWidth || 0, 280),
      })
    }

    loadGoogleScript()
      .then(renderButton)
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to load Google sign-in'
        console.error('[google-signin]', message)
        toast.error(message)
      })

    return () => {
      cancelled = true
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [text, handleCredentialResponse, googleClientId])

  return <div ref={buttonRef} className={`w-full min-h-11 ${className}`} />
}
