'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getAccessToken } from '@/lib/auth.service'

type Role = 'patient' | 'doctor' | 'admin'

function getDashboardForRole(role?: string): string {
  switch (role) {
    case 'doctor':
      return '/doctor/dashboard'
    case 'admin':
      return '/admin/dashboard'
    case 'patient':
      return '/patient/appointments'
    default:
      return '/'
  }
}

export function useRequireAuth(options?: {
  role?: Role
  loginPath?: string
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const loginPath =
    options?.loginPath ?? (options?.role === 'admin' ? '/admin/login' : '/auth/login')

  useEffect(() => {
    if (isLoading) return

    const token = getAccessToken()
    if (!isAuthenticated || !token) {
      router.replace(loginPath)
      return
    }

    if (options?.role && user?.role !== options.role) {
      router.replace(getDashboardForRole(user?.role))
    }
  }, [isLoading, isAuthenticated, user?.role, options?.role, loginPath, router])

  const isAuthorized =
    !isLoading &&
    isAuthenticated &&
    !!getAccessToken() &&
    (!options?.role || user?.role === options.role)

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !isAuthorized,
    isAuthorized,
  }
}
