"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()

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
      console.log('Attempting admin login...')
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      console.log('Login response status:', response.status)
      const data = await response.json()
      console.log('Login response data:', data)
      
      if (response.ok && data.success) {
        console.log('Login successful, redirecting to admin...')
        // Cookie sudah di-set oleh server (httpOnly)
        // Tidak perlu set manual di client-side
        router.push('/admin')
      } else {
        setError(data.message || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Admin login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Admin Portal</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to access the admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@genedu.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in to Admin"}
            </Button>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Demo Credentials</h3>
              <div className="space-y-1 text-xs text-blue-200">
                <p><strong>Email:</strong> admin@genedu.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
              <p className="text-xs text-blue-300 mt-2">
                Use these credentials to access the admin panel
              </p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
