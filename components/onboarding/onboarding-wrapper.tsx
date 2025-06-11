"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"

interface OnboardingWrapperProps {
  children: React.ReactNode
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)

  // Routes that don't require onboarding check
  const publicRoutes = ['/login', '/register', '/onboarding']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (isLoading || isPublicRoute || !user) {
      return
    }

    const checkOnboardingStatus = async () => {
      setCheckingOnboarding(true)
      
      try {
        // Check if onboarding is completed in localStorage first (quick check)
        const onboardingCompleted = localStorage.getItem('onboarding-completed')
        
        if (onboardingCompleted === 'true') {
          setCheckingOnboarding(false)
          return
        }        // Check user profile to see if they have completed onboarding
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          
          // Check the onboardingCompleted flag or fallback to profile completeness
          const hasCompletedOnboarding = user?.onboardingCompleted || 
                                       (user?.profile?.bio || 
                                        user?.profile?.institution || 
                                        (user?.profile?.subjects && user.profile.subjects.length > 0))
          
          if (hasCompletedOnboarding) {
            // Mark as completed in localStorage
            localStorage.setItem('onboarding-completed', 'true')
          } else {
            // Redirect to onboarding
            router.push('/onboarding')
            return
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [user, isLoading, pathname, router, isPublicRoute])

  // Show loading spinner while checking onboarding
  if (!isPublicRoute && user && checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your experience...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
