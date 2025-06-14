"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Award } from "lucide-react"

interface KnowledgeStats {
  totalEntries: number;
  weeklyGrowth: number;
  activeUsers: number;
  completionRate: number;
}

export function KnowledgeBasePanel() {
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/knowledge-base/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Default fallback data
        setStats({
          totalEntries: 127,
          weeklyGrowth: 12.5,
          activeUsers: 48,
          completionRate: 85
        })
      }
    } catch (error) {
      console.error('Error fetching knowledge base stats:', error)
      setStats({
        totalEntries: 127,
        weeklyGrowth: 12.5,
        activeUsers: 48,
        completionRate: 85
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (stats) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev < stats.completionRate) {
            return Math.min(prev + 2, stats.completionRate)
          }
          return stats.completionRate
        })
      }, 50)

      return () => clearInterval(timer)
    }
  }, [stats])

  return (
    <Card className="h-full overflow-hidden shadow-md border border-gray-200">
      <CardContent className="p-6 bg-white h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">Knowledge Base</h3>
          <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {loading ? '+--' : `+${stats?.weeklyGrowth ?? 0}%`} this week
          </div>
        </div>

        <div className="flex items-center mb-6">
          <span className="text-4xl font-bold text-gray-900">
            {loading ? '--' : stats?.totalEntries ?? 0}
          </span>
          <span className="text-lg text-gray-500 ml-2">entries</span>
        </div>

        {/* Progress Circle */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90 w-full h-full">
              <defs>
                <linearGradient id="knowledgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#knowledgeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 * (1 - progress / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-center"
              >
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
                  {loading ? '--' : `${Math.round(progress)}`}%
                </span>
                <div className="text-xs text-gray-500 mt-1">Usage Rate</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {loading ? '--' : stats?.activeUsers ?? 0}
            </div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {loading ? '--' : `${stats?.completionRate ?? 0}%`}
            </div>
            <div className="text-xs text-gray-500">Complete Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
