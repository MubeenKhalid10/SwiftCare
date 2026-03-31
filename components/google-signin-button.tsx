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
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  roleHint: 'patient' | 'doctor'
  onSuccess?: () => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleSignInButton({ roleHint, onSuccess, text = 'signin_with' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { googleAuth } = useAuth()
  const router = useRouter()

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      console.log('[v0] Google sign-in initiated')
      
      const result = await googleAuth(response.credential, roleHint)

      if (!result.success) {
        toast.error(result.error || 'Google sign-in failed')
        return
      }

      toast.success('Successfully signed in with Google!')
      
      // Get user role and redirect
      const stored = JSON.parse(localStorage.getItem('swiftcare_auth') || '{}')
      const role = stored.user?.role

      if (onSuccess) {
        onSuccess()
      } else {
        // Default redirect based on role
        if (role === 'doctor') {
          router.push('/doctor/dashboard')
        } else if (role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/patient/appointments')
        }
      }
    } catch (error) {
      console.error('[v0] Google sign-in error:', error)
      toast.error('Google sign-in failed')
    }
  }, [googleAuth, roleHint, onSuccess, router])

  useEffect(() => {
    // Load Google Identity Services script only once
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.google && buttonRef.current) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            callback: handleCredentialResponse,
          })

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            text: text,
            shape: 'rectangular',
            width: buttonRef.current.offsetWidth,
          })
        }
      }
    } else {
      // Script already loaded, just initialize
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: text,
          shape: 'rectangular',
          width: buttonRef.current.offsetWidth,
        })
      }
    }

    return () => {
      // Don't remove the script, just clean up the button
      if (buttonRef.current) {
        buttonRef.current.innerHTML = ''
      }
    }
  }, [text, handleCredentialResponse, roleHint])

  return <div ref={buttonRef} className="w-full" />
}
