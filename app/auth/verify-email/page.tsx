'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyOtp } = useAuth()

  const email = searchParams.get('email') || ''
  const role = (searchParams.get('role') || 'patient') as 'patient' | 'doctor'

  // Start a 60-second cooldown on mount
  useEffect(() => {
    setResendCooldown(60)
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only keep last digit
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyOtp(email, role, otpString)

      if (!result.success) {
        toast.error(result.error || 'Verification failed')
        setIsLoading(false)
        return
      }

      toast.success('Email verified successfully!')

      if (role === 'patient') {
        router.push('/patient/appointments')
      } else {
        router.push('/doctor/dashboard')
      }
    } catch {
      toast.error('Verification failed')
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    try {
      const { resendSignupOtp } = await import('@/lib/auth.service')
      await resendSignupOtp('', email, '', role)
      toast.success('A new verification code has been sent')
      setResendCooldown(60)
    } catch {
      toast.error('Failed to resend code')
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Missing email parameter.</p>
          <Button onClick={() => router.push('/auth/register')}>Go to Register</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 items-center justify-center p-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Almost There!</h2>
          <p className="text-blue-100 text-lg">Verify your email to complete registration</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">
              We&apos;ve sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-semibold mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:opacity-50"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={isLoading || otp.join('').length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn&apos;t receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>

          <p className="text-center text-gray-500 mt-8 text-xs">
            The code expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
