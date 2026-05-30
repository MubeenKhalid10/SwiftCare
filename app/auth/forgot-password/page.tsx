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
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 items-center justify-center p-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Forgot Password?</h2>
          <p className="text-blue-100 text-lg">No worries, we&apos;ll help you reset it</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your email address and we&apos;ll send you a code to reset your password
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                role === 'patient'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                role === 'doctor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
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

          <p className="text-center text-gray-600 mt-8 text-sm">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
