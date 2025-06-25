"use client"

import { Navbar } from "@/components/navbar"
import { DashboardContent } from "@/components/dashboard-content"
import { config } from "dotenv"
import { LoginForm } from "../components/login/login-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"

config()

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        setShowLogin(true)
      } else {
        setShowLogin(false)
      }
    }
  }, [isLoading, isAuthenticated, user])
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading GenEdu...</p>
        </div>
      </div>
    )
  }
  // Show login form if not authenticated
  if (showLogin || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          {/* Animated shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-2xl animate-ping"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
         

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    )
  }

  // Show dashboard if authenticated
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Navbar />
      <div className="flex-1 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <DashboardContent />
      </div>
    </main>
  )
}


// export default function Home() {
//   const router = useRouter()

//   useEffect(() => {
//     // Example: check localStorage for "isLoggedIn"
//     const isLoggedIn = localStorage.getItem("isLoggedIn")
//     if (!isLoggedIn) {
//       router.replace("/login")
//     }
//   }, [router])

//   return (
//     <main className="min-h-screen flex flex-col bg-gray-100">
//       <Navbar />
//       <DashboardContent />
//     </main>
//   )
// }
