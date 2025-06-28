"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Activity, TrendingUp } from "lucide-react"
import { AdminKnowledgeBaseStats } from "@/components/admin/admin-knowledge-base-stats"

interface DashboardStats {
  totalUsers: number
  totalKnowledgeBase: number
  activeUsers: number
  systemHealth: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalKnowledgeBase: 0,
    activeUsers: 0,
    systemHealth: 'Good'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats-mock', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Knowledge Base Items",
      value: stats.totalKnowledgeBase,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "System Health",
      value: stats.systemHealth,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the GenEdu admin portal. Manage users, knowledge base, and system settings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Knowledge Base Analytics */}
      <div className="mb-8">
        <AdminKnowledgeBaseStats />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent User Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">New user registrations</p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                </div>
                <span className="text-lg font-bold text-blue-600">+12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Active sessions</p>
                  <p className="text-sm text-gray-600">Currently online</p>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.activeUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Knowledge Base Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Total documents</p>
                  <p className="text-sm text-gray-600">Available in system</p>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats.totalKnowledgeBase}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">System status</p>
                  <p className="text-sm text-gray-600">Overall health</p>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.systemHealth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Add New User</p>
                <p className="text-sm text-gray-600">Create a new student or teacher account</p>
              </div>
            </button>
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Add Knowledge</p>
                <p className="text-sm text-gray-600">Add new content to the knowledge base</p>
              </div>
            </button>
            <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-gray-600">Check system usage and performance</p>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Knowledge base updated</p>
                <p className="text-xs text-gray-600">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System backup completed</p>
                <p className="text-xs text-gray-600">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Settings updated</p>
                <p className="text-xs text-gray-600">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="font-medium">API Services</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="font-medium">AI Services</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}