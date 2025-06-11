"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Brain, Award, Clock, Calendar, MapPin, Briefcase, GraduationCap, NotebookPen, Target } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth/AuthContext"

interface ProfileStats {
  notebooksCreated: number
  totalLearningHours: number
  streakDays: number
  activeDays: number
  totalActivities: number
  totalNotebooks: number
  joinedDate: string
  lastActive: string
  quizzesCompleted: number
  quizzesCreated: number
}

export function ProfileOverview() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const displayStats = [
    { 
      label: "Notebooks Created", 
      value: stats?.notebooksCreated || 0, 
      icon: NotebookPen, 
      color: "bg-indigo-100 text-indigo-600" 
    },
    { 
      label: "Learning Hours", 
      value: Math.round((stats?.totalLearningHours || 0) * 10) / 10, 
      icon: Clock, 
      color: "bg-lime-100 text-lime-600" 
    },
    { 
      label: "Day Streak", 
      value: stats?.streakDays || 0, 
      icon: Target, 
      color: "bg-orange-100 text-orange-600" 
    },
    { 
      label: "Active Days", 
      value: stats?.activeDays || 0, 
      icon: Calendar, 
      color: "bg-blue-100 text-blue-600" 
    },
  ]
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-gray-200">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`p-2 rounded-full ${stat.color} mb-2`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">About Me</h3>
          <p className="text-gray-600">
            {user?.profile?.bio || "No bio available yet. Complete your profile to add a personal description."}
          </p>

          <div className="space-y-3">
            {user?.profile?.institution && (
              <div className="flex items-center text-gray-600">
                <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                <span>{user.profile.institution}</span>
              </div>
            )}
            {user?.profile?.grade && (
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                <span>{user.profile.grade}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>Joined {stats?.joinedDate ? new Date(stats.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Learning Progress</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Learning Goal Progress</span>
                <span className="text-gray-900">{Math.min(stats?.totalLearningHours || 0, 50)}/50 hours</span>
              </div>
              <Progress value={Math.min(((stats?.totalLearningHours || 0) / 50) * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Notebooks Created</span>
                <span className="text-gray-900">{stats?.notebooksCreated || 0}</span>
              </div>
              <Progress value={Math.min(((stats?.notebooksCreated || 0) / 10) * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Active Learning Days</span>
                <span className="text-gray-900">{stats?.activeDays || 0} days</span>
              </div>
              <Progress value={Math.min(((stats?.activeDays || 0) / 30) * 100, 100)} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
