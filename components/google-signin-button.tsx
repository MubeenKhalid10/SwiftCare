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
  const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/^"|"$/g, '').trim()
  
  // Use the provided roleHint (patient or doctor)
  const effectiveRoleHint = roleHint

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      if (!response?.credential) {
        toast.error('Google sign-in did not return a credential token')
        return
      }

      console.log('[v0] Google sign-in initiated')
      console.log('[v0] Frontend Google Client ID:', googleClientId)
      console.log('[v0] Role hint:', effectiveRoleHint)
      
      const result = await googleAuth(response.credential, effectiveRoleHint)

      if (!result.success) {
        const errorMsg = result.error || 'Google sign-in failed'
        console.error('[v0] Google sign-in failed:', errorMsg)
        toast.error(errorMsg)
        return
      }

      toast.success('Successfully signed in with Google!')
      console.log('[v0] Google sign-in successful')
      
      // Get user role and redirect
      const stored = JSON.parse(localStorage.getItem('swiftcare_auth') || '{}')
      const role = stored.user?.role

      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect based on authenticated user's role
        if (role === 'doctor') {
          router.push('/doctor/dashboard')
        } else if (role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/patient/appointments')
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Google sign-in failed'
      console.error('[v0] Google sign-in error:', errorMsg)
      console.error('[v0] Full error:', error)
      toast.error(errorMsg)
    }
  }, [googleAuth, effectiveRoleHint, googleClientId, onSuccess, router])

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
          if (!googleClientId) {
            toast.error('Google client ID is missing in frontend environment')
            return
          }

          window.google.accounts.id.initialize({
            client_id: googleClientId,
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
        if (!googleClientId) {
          toast.error('Google client ID is missing in frontend environment')
          return
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
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
  }, [text, handleCredentialResponse, googleClientId])

  return <div ref={buttonRef} className="w-full" />
}
