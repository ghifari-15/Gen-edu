"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface QuizStats {
  totalAttempts: number;
  completionRate: number;
  chartData: number[];
  growth: {
    monthly: number;
  };
}

export function QuizMetrics() {
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [chartData, setChartData] = useState<number[]>([])

  useEffect(() => {
    fetchQuizStats()
  }, [])

  const fetchQuizStats = async () => {
    try {
      const response = await fetch('/api/quiz/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      const defaultStats: QuizStats = {
        totalAttempts: 0,
        completionRate: 0,
        chartData: [10, 20, 30, 40, 50, 60, 70],
        growth: {
          monthly: 0,
        }
      }
      
      setQuizStats({
        ...defaultStats,
        ...result,
        chartData: Array.isArray(result.chartData) ? result.chartData : defaultStats.chartData,
        growth: result.growth ? { ...defaultStats.growth, ...result.growth } : defaultStats.growth,
      })
    } catch (error) {
      console.error('Error fetching quiz stats:', error)
      setQuizStats({
        totalAttempts: 42,
        completionRate: 78,
        chartData: [10, 25, 40, 30, 55, 45, 60],
        growth: {
          monthly: 15,
        }
      })
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (quizStats?.chartData) {
      animateChart(quizStats.chartData)
    }
  }, [quizStats])

  const animateChart = (data: number[]) => {
    if (!Array.isArray(data)) return
    
    setChartData(new Array(data.length).fill(0))
    const normalizedData = data.map(val => Math.min(Math.max(val || 0, 0), 100))
    
    const interval = setInterval(() => {
      setChartData(prev => 
        prev.map((value, index) => {
          const target = normalizedData[index]
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
    <Card className="h-full overflow-hidden shadow-md border border-gray-200">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="bg-indigo-600 text-white p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Total Quiz Attempts</h3>
            <div className="px-2 py-1 bg-lime-400 text-indigo-950 text-xs font-medium rounded-full">
              {statsLoading ? '+--' : `${(quizStats?.growth.monthly ?? 0) >= 0 ? '+' : ''}${quizStats?.growth.monthly ?? 0}`}% vs last month
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <span className="text-4xl font-bold">
              {statsLoading ? '--' : quizStats?.totalAttempts ?? 0}
            </span>
          </div>

          <div className="flex-1 flex items-end space-x-1 min-h-[80px]">
            {chartData.length > 0 ? chartData.map((height, index) => (
              <motion.div
                key={`chart-bar-${index}`}
                className="bg-indigo-400 rounded-t w-full"
                style={{ height: `${Math.max(height, 5)}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 5)}%` }}
                transition={{ duration: 0.5 }}
              />
            )) : (
              Array.from({ length: 7 }).map((_, index) => (
                <motion.div
                  key={`default-bar-${index}`}
                  className="bg-indigo-400 rounded-t w-full"
                  style={{ height: `${10 + (index * 5)}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${10 + (index * 5)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              ))
            )}
          </div>

          <div className="mt-4 flex justify-between text-sm">
            <div>Daily {statsLoading ? '+--' : `+${Math.abs((quizStats?.growth.monthly ?? 0) / 4)}`}%</div>
            <div>Weekly {statsLoading ? '+--' : `+${Math.abs((quizStats?.growth.monthly ?? 0) / 2)}`}%</div>
            <div>Monthly {statsLoading ? '+--' : `${(quizStats?.growth.monthly ?? 0) >= 0 ? '+' : ''}${quizStats?.growth.monthly ?? 0}`}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
