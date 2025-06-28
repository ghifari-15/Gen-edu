"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/admin/admin-dashboard"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      console.log('Checking admin auth...')
      const response = await fetch('/api/auth/admin/me', {
        method: 'GET',
        credentials: 'include'
      })

      console.log('Auth response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Auth response data:', data)
        if (data.success && data.user?.role === 'admin') {
          setIsAuthenticated(true)
        } else {
          console.log('Not authenticated, redirecting to login')
          router.push('/admin/login')
        }
      } else {
        console.log('Auth request failed, redirecting to login')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Admin auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminDashboard />
      </main>
    </div>
  )
}