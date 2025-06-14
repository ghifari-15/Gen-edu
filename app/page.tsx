"use client"

import { Navbar } from "@/components/navbar"
import { DashboardContent } from "@/components/dashboard-content"
import { config } from "dotenv"
import { LoginForm } from "../components/login/login-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

config()

// export function LoginPage() {
//   return (
//     <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         <LoginForm />
//       </div>
//     </div>
//   )
// }


export default function Home() {
  // This is a server component, so we can't use useEffect here
  // The scroll reset will be handled in the client components
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
