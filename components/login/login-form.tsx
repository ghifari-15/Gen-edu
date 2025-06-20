"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth/AuthContext"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const router = useRouter()
  const { login } = useAuth()

  // Auto-fill test credentials for demo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') === 'true') {
      setFormData({
        email: "test@genedu.com",
        password: "password123"
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }
    
    setIsLoading(true)
    setError("")
      try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        // Login successful, use router to navigate
        router.push('/')
        router.refresh()
      } else {
        setError(result.message || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      {/* Card Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex items-center justify-center ">
              <img src="/genedu.png" alt="" className="h-20 w-25"/>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to continue to GenEdu
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              <span>{error}</span>
            </div>
          )}          
          {/* Test Credentials Info */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <div className="flex-1">
                <p className="font-medium text-blue-800 mb-2">Demo Account</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-mono text-blue-700">test@genedu.com</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                    <span className="text-gray-600">Password:</span>
                    <span className="font-mono text-blue-700">password123</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ email: "test@genedu.com", password: "password123" })}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Click to auto-fill
                </button> 
              </div>
            </div>
          </div>             */}
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-indigo-500' : 'text-gray-400'
                  }`} />
                </div>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="Enter your email address" 
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required 
                  className="h-12 pl-11 bg-white/50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-indigo-500' : 'text-gray-400'
                  }`} />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="h-12 pl-11 pr-12 bg-white/50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign in to GenEdu"
            )}
          </Button>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <a 
                href="/register" 
                className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              >
                Create one here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
