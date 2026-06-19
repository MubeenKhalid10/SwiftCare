'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { GoogleSignInButton } from '@/components/google-signin-button'
import { LogoLoader } from '@/components/ui/logo-loader'

const REMEMBER_EMAIL_KEY = 'swiftcare_remember_email'

function getSafeRedirect(redirect: string | null): string | null {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return null
  return redirect
}

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { login } = useAuth()

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const navigateAfterLogin = (role?: string) => {
    const safeRedirect = getSafeRedirect(redirect)
    if (safeRedirect) {
      router.push(safeRedirect)
      return
    }

    if (role === 'doctor') {
      router.push('/doctor/dashboard')
    } else if (role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/patient/appointments')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim()

    if (!normalizedEmail || !password) {
      toast.error('Please enter email and password')
      return
    }

    setIsLoading(true)

    try {
      const result = await login({ email: normalizedEmail, password })

      if (!result.success) {
        toast.error(result.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, normalizedEmail)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }

      const stored = JSON.parse(localStorage.getItem('swiftcare_auth') || '{}')
      const role = stored.user?.role

      toast.success('Login successful!')
      navigateAfterLogin(role)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      console.error('[v0] Login error:', errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = () => {
    const stored = JSON.parse(localStorage.getItem('swiftcare_auth') || '{}')
    navigateAfterLogin(stored.user?.role)
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary-600 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="w-full max-w-md text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-3">SwiftCare</h2>
          <p className="text-white/80 text-lg mb-8">Smarter care. Shorter waits</p>
          <img
            src="https://plus.unsplash.com/premium_vector-1682306895029-1c07dc2c0dfc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Healthcare"
            className="w-full h-auto object-contain rounded-2xl shadow-2xl"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your SwiftCare account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
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

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
              disabled={isLoading}
            >
              {isLoading ? <LogoLoader size={20} className="h-5 w-5" /> : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton roleHint="patient" onSuccess={handleGoogleSuccess} />

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LogoLoader size={32} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
