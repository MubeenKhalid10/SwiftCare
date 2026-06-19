'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { forgotPassword } from '@/lib/auth.service'
import { LogoLoader } from '@/components/ui/logo-loader'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)

    try {
      await forgotPassword(normalizedEmail, role)
      toast.success('If an account exists, a reset code was sent to your email')

      const params = new URLSearchParams({
        email: normalizedEmail,
        role,
      })
      router.push(`/auth/reset-password?${params.toString()}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset code'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary-600 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
            <KeyRound className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Forgot Password?</h2>
          <p className="text-white/80 text-lg">No worries, we&apos;ll help you reset it</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your email address and we&apos;ll send you a code to reset your password
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                role === 'patient'
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                role === 'doctor'
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LogoLoader size={16} className="h-4 w-4 mr-2" />
                  Sending code...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-8 text-sm">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-600 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
