"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  completionRate: number;
  chartData: number[];
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  timeStats: {
    dailyAttempts: number;
    weeklyAttempts: number;
    monthlyAttempts: number;
  };
}

export function QuizMetrics() {
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedCount, setAnimatedCount] = useState(0)
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => {
    async function fetchQuizStats() {
      try {
        const response = await fetch('/api/quiz/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(data.stats)
            // Animate the count
            animateCounter(data.stats.totalAttempts)
            // Animate chart data
            animateChart(data.stats.chartData)
          }
        }
      } catch (error) {
        console.error('Error fetching quiz stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizStats()
  }, [])

  const animateCounter = (target: number) => {
    const duration = 2000 // 2 seconds
    const steps = 60 // 60 steps for smooth animation
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setAnimatedCount(target)
        clearInterval(timer)
      } else {
        setAnimatedCount(Math.floor(current))
      }
    }, duration / steps)
  }

  const animateChart = (targetData: number[]) => {
    if (targetData.length === 0) return
    
    const maxValue = Math.max(...targetData, 1)
    const normalizedData = targetData.map(value => (value / maxValue) * 100)
    
    const interval = setInterval(() => {
      setChartData((prev) =>
        prev.map((value, index) => {
          const target = normalizedData[index] || 0
          if (value < target) {
            return Math.min(value + Math.ceil(Math.random() * 10), target)
          }
          return target
        }),
      )
    }, 100)

    setTimeout(() => clearInterval(interval), 2000)
  }
  return (
    <Card className="overflow-hidden shadow-md border border-gray-200 h-full">
      <CardContent className="p-0">
        <div className="bg-indigo-950 text-white p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">Total Quizzes Taken</h3>
            <Button variant="ghost" size="icon" className="text-gray-300 -mt-2 -mr-2">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-4xl font-bold">
              {loading ? '--' : animatedCount}
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="px-2 py-1 bg-lime-400 text-indigo-950 text-xs font-medium rounded-full">
              {loading ? '+--' : `${(stats?.growth.monthly ?? 0) >= 0 ? '+' : ''}${stats?.growth.monthly ?? 0}`}%
            </div>
            <span className="ml-2 text-gray-300 text-sm">vs last month</span>
          </div>

          <div className="mt-4 flex items-end space-x-1 h-20">
            {chartData.map((height, index) => (
              <motion.div
                key={index}
                className="bg-lime-400 rounded-t w-full"
                style={{ height: `${height}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
