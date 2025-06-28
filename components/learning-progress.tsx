"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, TrendingUp, BookOpen, Clock, Target } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LearningStats {
  totalLearningHours: number
  notebooksCreated: number
  streakDays: number
  activeDays: number
  completionRate: number
  weeklyProgress: number
  quizzesCompleted: number
  totalActivities: number
  growth: {
    daily: number
    weekly: number
    monthly: number
  }
}

export function LearningProgress() {
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedHours, setAnimatedHours] = useState(0)

  useEffect(() => {
    fetchLearningStats()
  }, [])

  const fetchLearningStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const learningStats: LearningStats = {
            totalLearningHours: data.stats.totalLearningHours || 0,
            notebooksCreated: data.stats.notebooksCreated || 0,
            streakDays: data.stats.streakDays || 0,
            activeDays: data.stats.activeDays || 0,
            completionRate: Math.min(100, Math.round((data.stats.activeDays / 30) * 100)) || 0,
            weeklyProgress: Math.min(100, Math.round((data.stats.streakDays / 7) * 100)) || 0,
            quizzesCompleted: data.stats.quizzesCompleted || 0,
            totalActivities: data.stats.totalActivities || 0,
            growth: {
              daily: Math.round(((data.stats.activeDays || 0) / 30) * 100) || 0,
              weekly: Math.round(((data.stats.streakDays || 0) / 7) * 100) || 0,
              monthly: Math.min(100, Math.round(((data.stats.totalLearningHours || 0) / 20) * 100)) || 0
            }
          }
          setStats(learningStats)
        }
      } else {
        // Fallback data
        setStats({
          totalLearningHours: 0,
          notebooksCreated: 0,
          streakDays: 0,
          activeDays: 0,
          completionRate: 0,
          weeklyProgress: 0,
          quizzesCompleted: 0,
          totalActivities: 0,
          growth: {
            daily: 0,
            weekly: 0,
            monthly: 0
          }
        })
      }
    } catch (error) {
      console.error('Error fetching learning stats:', error)
      setStats({
        totalLearningHours: 0,
        notebooksCreated: 0,
        streakDays: 0,
        activeDays: 0,
        completionRate: 0,
        weeklyProgress: 0,
        quizzesCompleted: 0,
        totalActivities: 0,
        growth: {
          daily: 0,
          weekly: 0,
          monthly: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // Animate the learning hours counter
  useEffect(() => {
    if (stats?.totalLearningHours) {
      const interval = setInterval(() => {
        setAnimatedHours(prev => {
          const target = stats.totalLearningHours
          if (prev < target) {
            return Math.min(prev + 0.1, target)
          }
          clearInterval(interval)
          return target
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [stats])

  if (loading) {
    return (
      <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-white/20 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-white/20 rounded"></div>
            <div className="h-12 bg-white/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-teal-600 h-full text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Learning Progress</h3>
          </div>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 -mt-2 -mr-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Learning Hours Display */}
        <div className="mt-6">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">
              {animatedHours.toFixed(1)}h
            </span>
            <span className="text-white/80 text-sm">this month</span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="px-2 py-1 bg-lime-400 text-emerald-900 text-xs font-medium rounded-full">
              +{stats?.growth.weekly || 0}%
            </div>
            <span className="ml-2 text-white/80 text-sm">vs last week</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <BookOpen className="h-4 w-4" />
              <div className="text-xl font-bold">{stats?.notebooksCreated || 0}</div>
            </div>
            <div className="text-white/80 text-sm">Notebooks</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="h-4 w-4" />
              <div className="text-xl font-bold">{stats?.streakDays || 0}</div>
            </div>
            <div className="text-white/80 text-sm">Day Streak</div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="h-4 w-4" />
              <div className="text-xl font-bold">{stats?.quizzesCompleted || 0}</div>
            </div>
            <div className="text-white/80 text-sm">Quizzes</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">Monthly Goal</span>
            <span className="text-sm font-medium">{stats?.completionRate || 0}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div 
              className="bg-white rounded-full h-2 transition-all duration-1000"
              initial={{ width: 0 }}
              animate={{ width: `${stats?.completionRate || 0}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span className="text-white/80">Total Activities: {stats?.totalActivities || 0}</span>
            </div>
            <span className="text-white/60">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
