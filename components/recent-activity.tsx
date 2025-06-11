"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileText, Edit, CheckCircle, LogIn, User, NotebookPen, ArrowRight, Brain, Trophy } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import Link from "next/link"

interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  timeAgo: string
  metadata?: any
}

export function RecentActivity() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setActivities((data.activities || []).slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRecentActivities()
    } else {
      setLoading(false)
    }
  }, [user])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'notebook_created':
        return FileText
      case 'notebook_updated':
        return Edit
      case 'quiz_completed':
        return CheckCircle
      case 'quiz_created':
        return Brain
      case 'login':
        return LogIn
      case 'profile_updated':
        return User
      case 'learning_session':
        return Clock
      default:
        return NotebookPen
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'notebook_created':
        return "bg-indigo-100 text-indigo-600"
      case 'notebook_updated':
        return "bg-blue-100 text-blue-600"
      case 'quiz_completed':
        return "bg-green-100 text-green-600"
      case 'quiz_created':
        return "bg-purple-100 text-purple-600"
      case 'login':
        return "bg-gray-100 text-gray-600"
      case 'profile_updated':
        return "bg-purple-100 text-purple-600"
      case 'learning_session':
        return "bg-orange-100 text-orange-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  if (!user) {
    return (
      <Card className="h-full shadow-sm border-0 bg-white/80 backdrop-blur-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              Please log in to see your activity
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="h-full shadow-sm border-0 bg-white/80 backdrop-blur-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full shadow-sm border-0 bg-white/80 backdrop-blur-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activity
          </div>
          {activities.length > 0 && (
            <Link 
              href="/profile" 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-2">No recent activity</p>
            <p className="text-gray-400 text-xs">
              Start creating notebooks to see your activity here
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const color = getActivityColor(activity.type)
            
            return (
              <div
                key={activity.id}
                className="flex items-start group hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className={`p-1.5 rounded-full ${color} mr-3 flex-shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {activity.title}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-400">{activity.timeAgo}</div>
                    {activity.metadata?.sessionDuration && (
                      <div className="text-xs text-gray-500">
                        {activity.metadata.sessionDuration}m
                      </div>
                    )}
                    {activity.metadata?.wordsWritten && (
                      <div className="text-xs text-gray-500">
                        {activity.metadata.wordsWritten} words
                      </div>
                    )}
                    {activity.metadata?.score && (
                      <div className="text-xs text-gray-500">
                        {activity.metadata.score}% score
                      </div>
                    )}
                    {activity.metadata?.questionsCount && (
                      <div className="text-xs text-gray-500">
                        {activity.metadata.questionsCount} questions
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
