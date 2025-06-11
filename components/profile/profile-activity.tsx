"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Clock, CheckCircle, Edit, FileText, BrainCircuit, User, NotebookPen, LogIn } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth/AuthContext"

interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  timeAgo: string
  metadata?: any
}

export function ProfileActivity() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchActivities()
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-500">Start creating notebooks or taking quizzes to see your activity here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const color = getActivityColor(activity.type)
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${color} mr-3 flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{activity.title}</div>
                        {activity.description && (
                          <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-400">{activity.timeAgo}</div>
                          {activity.metadata?.sessionDuration && (
                            <div className="text-xs text-gray-500">
                              {activity.metadata.sessionDuration} min
                            </div>
                          )}
                          {activity.metadata?.wordsWritten && (
                            <div className="text-xs text-gray-500">
                              {activity.metadata.wordsWritten} words
                            </div>
                          )}
                          {activity.metadata?.cellsAdded && (
                            <div className="text-xs text-gray-500">
                              {activity.metadata.cellsAdded} cells
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {activities.length > 0 && (
        <div className="flex justify-center">
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View More Activity
          </button>
        </div>
      )}
    </div>
  )
}
