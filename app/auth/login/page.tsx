'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { GoogleSignInButton } from '@/components/google-signin-button'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setIsLoading(true)

    try {
      const result = await login({ email, password })

      if (!result.success) {
        toast.error(result.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      const stored = JSON.parse(localStorage.getItem('swiftcare_auth') || '{}')
      const role = stored.user?.role

      toast.success('Login successful!')

      // Redirect based on role
      if (role === 'doctor') {
        router.push('/doctor/dashboard')
      } else if (role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/patient/dashboard')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      console.error('[v0] Login error:', errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h2 className="text-4xl font-bold text-white mb-4">SwiftCare</h2>
          <p className="text-blue-100 text-lg">Your Health, Our Priority</p>
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop"
            alt="Healthcare"
            className="w-full h-auto object-contain mt-8 rounded-2xl shadow-2xl"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your SwiftCare account</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Backend Status:</span> Ensure the backend server at{' '}
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">https://swiftcare.up.railway.app</code> is running.
              If you see connection errors, the backend may be offline.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Remember Me</span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton roleHint="patient" text="signin_with" />

          {/* Sign Up */}
          <p className="text-center text-gray-600 mt-8">
            Don't have an account?{' '}
            <a href="/auth/register" className="text-blue-600 font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
