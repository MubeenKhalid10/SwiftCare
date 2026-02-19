'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function LogoutPage() {
  const router = useRouter()
  const { logout, user, isAuthenticated } = useAuth()
  const [showConfirm, setShowConfirm] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      setShowConfirm(false)
      setTimeout(() => {
        router.push('/auth/login')
      }, 1000)
    } catch (err) {
      console.error('Logout error:', err)
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user?.role === 'patient') {
      router.push('/patient/dashboard')
    } else if (user?.role === 'doctor') {
      router.push('/doctor/dashboard')
    } else if (user?.role === 'admin') {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <AlertDialog open={showConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-4">
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Logged in as:</strong> {user?.email || 'User'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Role:</strong> {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
            </p>
          </div>

          <div className="flex gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleLogout} 
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Logging out...
                  </>
                ) : (
                  'Yes, Logout'
                )}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {!showConfirm && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Logged Out Successfully</h1>
          <p className="text-gray-600 mb-6">Redirecting to login page...</p>
        </div>
      )}
    </div>
  )
}
