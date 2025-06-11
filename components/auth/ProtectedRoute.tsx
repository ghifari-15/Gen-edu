"use client"

import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
  fallbackUrl?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'student',
  fallbackUrl = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push(fallbackUrl)
        return
      }

      // Check role permission
      const roleHierarchy = {
        'student': 1,
        'teacher': 2,
        'admin': 3
      }

      const userRoleLevel = roleHierarchy[user.role]
      const requiredRoleLevel = roleHierarchy[requiredRole]

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole, fallbackUrl])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null
  }

  // Check role permission
  const roleHierarchy = {
    'student': 1,
    'teacher': 2,
    'admin': 3
  }

  const userRoleLevel = roleHierarchy[user.role]
  const requiredRoleLevel = roleHierarchy[requiredRole]

  if (userRoleLevel < requiredRoleLevel) {
    return null
  }

  return <>{children}</>
}
