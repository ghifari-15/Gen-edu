"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Shield, Database, Mail, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemSettings {
  siteName: string
  adminEmail: string
  maxUsersPerRole: {
    student: number
    teacher: number
  }
  emailNotifications: boolean
  autoBackup: boolean
  maintenanceMode: boolean
  allowRegistration: boolean
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "GenEdu Platform",
    adminEmail: "admin@genedu.com",
    maxUsersPerRole: {
      student: 1000,
      teacher: 100
    },
    emailNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
    allowRegistration: true
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/admin/me-mock', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user?.role === 'admin') {
          setIsAuthenticated(true)
          loadSettings()
        } else {
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Admin auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Settings saved successfully"
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
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
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Settings className="h-8 w-8" />
                <span>System Settings</span>
              </h1>
              <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
            </div>
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    placeholder="Enter site name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    placeholder="Enter admin email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>User Limits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Maximum Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={settings.maxUsersPerRole.student}
                    onChange={(e) => setSettings({
                      ...settings, 
                      maxUsersPerRole: {
                        ...settings.maxUsersPerRole,
                        student: parseInt(e.target.value) || 0
                      }
                    })}
                    placeholder="Enter maximum students"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTeachers">Maximum Teachers</Label>
                  <Input
                    id="maxTeachers"
                    type="number"
                    value={settings.maxUsersPerRole.teacher}
                    onChange={(e) => setSettings({
                      ...settings, 
                      maxUsersPerRole: {
                        ...settings.maxUsersPerRole,
                        teacher: parseInt(e.target.value) || 0
                      }
                    })}
                    placeholder="Enter maximum teachers"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>System Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send email notifications for important events</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                  <p className="text-sm text-gray-600">Automatically backup system data daily</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration">Allow Registration</Label>
                  <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put the system in maintenance mode</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-800">Reset All Settings</h3>
                  <p className="text-sm text-red-600">This will reset all settings to default values</p>
                </div>
                <Button variant="destructive" size="sm">
                  Reset Settings
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-800">Clear All Data</h3>
                  <p className="text-sm text-red-600">This will permanently delete all user data and knowledge base</p>
                </div>
                <Button variant="destructive" size="sm">
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
