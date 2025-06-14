"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Plus, List, BarChart, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalQuestions: number;
  estimatedTime?: number;
  totalAttempts: number;
  averageScore: number;
  createdAt: string;
}

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

export function QuizDashboard() {
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [chartData, setChartData] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchRecentQuizzes()
    fetchQuizStats()
  }, [])

  const fetchRecentQuizzes = async () => {
    try {
      setError(null)
      const response = await fetch('/api/quiz/recent')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Recent quizzes response:', result) // Debug log
      
      // Handle different response structures
      let data = result
      if (result.data) {
        data = result.data
      } else if (result.quizzes) {
        data = result.quizzes
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Expected array but got:', typeof data, data)
        setRecentQuizzes([])
        return
      }
      
      // Process and ensure unique IDs
      const processedQuizzes = data.map((quiz: any, index: number) => ({
        ...quiz,
        id: quiz.id || quiz._id || `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`,
        title: quiz.title || `Quiz ${index + 1}`,
        description: quiz.description || 'No description available',
        difficulty: quiz.difficulty || 'Medium',
        totalQuestions: quiz.totalQuestions || quiz.questions?.length || 0,
        totalAttempts: quiz.totalAttempts || 0,
        averageScore: quiz.averageScore || 0,
        createdAt: quiz.createdAt || new Date().toISOString()
      }))
      
      // Remove duplicates based on ID
      const uniqueQuizzes = processedQuizzes.reduce((acc: Quiz[], current: Quiz) => {
        const existingQuiz = acc.find(quiz => quiz.id === current.id)
        if (!existingQuiz) {
          acc.push(current)
        }
        return acc
      }, [])
      
      setRecentQuizzes(uniqueQuizzes)
    } catch (error) {
      console.error('Error fetching recent quizzes:', error)
      setError('Failed to load recent quizzes')
      setRecentQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizStats = async () => {
    try {
      const response = await fetch('/api/quiz/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Quiz stats response:', result) // Debug log
      
      // Set default stats if data is missing
      const defaultStats: QuizStats = {
        totalQuizzes: 0,
        totalAttempts: 0,
        completionRate: 0,
        chartData: [10, 20, 30, 40, 50, 60, 70],
        growth: {
          daily: 0,
          weekly: 0,
          monthly: 0,
        },
        timeStats: {
          dailyAttempts: 0,
          weeklyAttempts: 0,
          monthlyAttempts: 0,
        }
      }
      
      // Merge with fetched data
      setQuizStats({
        ...defaultStats,
        ...result,
        chartData: Array.isArray(result.chartData) ? result.chartData : defaultStats.chartData,
        growth: result.growth ? { ...defaultStats.growth, ...result.growth } : defaultStats.growth,
        timeStats: result.timeStats ? { ...defaultStats.timeStats, ...result.timeStats } : defaultStats.timeStats
      })
    } catch (error) {
      console.error('Error fetching quiz stats:', error)
      // Set default stats on error
      setQuizStats({
        totalQuizzes: 0,
        totalAttempts: 0,
        completionRate: 0,
        chartData: [10, 20, 30, 40, 50, 60, 70],
        growth: {
          daily: 0,
          weekly: 0,
          monthly: 0,
        },
        timeStats: {
          dailyAttempts: 0,
          weeklyAttempts: 0,
          monthlyAttempts: 0,
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (error && !loading) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => {
              setError(null)
              setLoading(true)
              fetchRecentQuizzes()
              fetchQuizStats()
            }} className="bg-red-600 hover:bg-red-700">
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">AI Quiz Generator</h1>
          <p className="text-gray-600">Transform your study materials into engaging quizzes</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/quiz/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 h-auto flex items-center w-full md:w-auto justify-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="overflow-hidden shadow-md border border-gray-200">
            <CardContent className="p-0">
              <div className="bg-indigo-600 text-white p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">Total Quiz Attempts</h3>
                  <div className="px-2 py-1 bg-lime-400 text-indigo-950 text-xs font-medium rounded-full">
                    {statsLoading ? '+--' : `${(quizStats?.growth.monthly ?? 0) >= 0 ? '+' : ''}${quizStats?.growth.monthly ?? 0}`}% vs last month
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-4xl font-bold">
                    {statsLoading ? '--' : quizStats?.totalAttempts ?? 0}
                  </span>
                </div>

                <div className="mt-4 flex items-end space-x-1 h-20">
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
                    // Default bars when no data
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
                  <div>Daily {statsLoading ? '+--' : `${(quizStats?.growth.daily ?? 0) >= 0 ? '+' : ''}${quizStats?.growth.daily ?? 0}`}%</div>
                  <div>Weekly {statsLoading ? '+--' : `${(quizStats?.growth.weekly ?? 0) >= 0 ? '+' : ''}${quizStats?.growth.weekly ?? 0}`}%</div>
                  <div>Monthly {statsLoading ? '+--' : `${(quizStats?.growth.monthly ?? 0) >= 0 ? '+' : ''}${quizStats?.growth.monthly ?? 0}`}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden shadow-md border border-gray-200 h-full">
            <CardContent className="p-6 bg-white">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Learning Progress</h3>
                <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {statsLoading ? '+--' : `${quizStats?.completionRate ?? 0}`}% Average Score
                </div>
              </div>

              <motion.div
                className="mt-6 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative w-36 md:w-48 h-36 md:h-48">
                  <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - (quizStats?.completionRate ?? 0) / 100) }}
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
                      <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-700">
                        {statsLoading ? '--' : `${Math.round(quizStats?.completionRate ?? 0)}`}%
                      </span>
                      <div className="text-sm text-gray-500 mt-1">Average Score</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Quizzes</h2>
          <Link href="/quiz/all" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div key={`loading-skeleton-${index}`} variants={item}>
                <Card className="h-full bg-white border-gray-200 shadow-sm animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-6"></div>
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : recentQuizzes.length > 0 ? (
            recentQuizzes.map((quiz: Quiz, index: number) => (
              <motion.div 
                key={`recent-quiz-${quiz.id}-${index}`} 
                variants={item} 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-2">{quiz.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <List className="h-4 w-4 mr-1" />
                        <span>{quiz.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <BarChart className="h-4 w-4 mr-1" />
                        <span className="capitalize">{quiz.difficulty}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Link href={`/quiz/${quiz.id}`}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Take Quiz</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div variants={item} className="col-span-full">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <List className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No quizzes yet</h3>
                    <p className="text-gray-600 mb-6">Create your first quiz to get started!</p>
                    <Link href="/quiz/create">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Quiz
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
