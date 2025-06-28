"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"

interface QuizAnalyticsProps {
  timeRange: string;
}

interface QuizData {
  id: string;
  name: string;
  score: number;
  questions: number;
  difficulty: string;
  date: string;
  timestamp: string;
}

interface ScoreDistribution {
  range: string;
  count: number;
  color: string;
}

interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
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

export function QuizAnalytics({ timeRange }: QuizAnalyticsProps) {
  const isMobile = useIsMobile()
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [recentQuizzes, setRecentQuizzes] = useState<QuizData[]>([])
  const [loading, setLoading] = useState(true)
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([
    { range: "90-100%", count: 0, color: "bg-green-500" },
    { range: "80-89%", count: 0, color: "bg-lime-500" },
    { range: "70-79%", count: 0, color: "bg-yellow-500" },
    { range: "60-69%", count: 0, color: "bg-orange-500" },
    { range: "0-59%", count: 0, color: "bg-red-500" },
  ])
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch quiz stats
        const [statsResponse, recentResponse] = await Promise.all([
          fetch('/api/quiz/stats'),
          fetch('/api/quiz/recent')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setStats(statsData.stats)
          }
        }        if (recentResponse.ok) {
          const recentData = await recentResponse.json()
          if (recentData.success) {
            // Deduplicate quizzes based on id and timestamp to prevent duplicate keys
            const uniqueQuizzes = recentData.results.reduce((acc: QuizData[], quiz: QuizData) => {
              const existingIndex = acc.findIndex(q => q.id === quiz.id && q.timestamp === quiz.timestamp)
              if (existingIndex === -1) {
                acc.push(quiz)
              } else {
                // If duplicate found, keep the one with more recent timestamp or higher score
                if (!quiz.timestamp || quiz.timestamp > acc[existingIndex].timestamp || quiz.score > acc[existingIndex].score) {
                  acc[existingIndex] = quiz
                }
              }
              return acc
            }, [])
              setRecentQuizzes(uniqueQuizzes)
            
            // Calculate score distribution from unique recent results
            const distribution = [
              { range: "90-100%", count: 0, color: "bg-green-500" },
              { range: "80-89%", count: 0, color: "bg-lime-500" },
              { range: "70-79%", count: 0, color: "bg-yellow-500" },
              { range: "60-69%", count: 0, color: "bg-orange-500" },
              { range: "0-59%", count: 0, color: "bg-red-500" },
            ]
            
            uniqueQuizzes.forEach((quiz: QuizData) => {
              if (quiz.score >= 90) distribution[0].count++
              else if (quiz.score >= 80) distribution[1].count++
              else if (quiz.score >= 70) distribution[2].count++
              else if (quiz.score >= 60) distribution[3].count++
              else distribution[4].count++
            })
            
            setScoreDistribution(distribution)
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  const averageScore = stats?.averageScore || (recentQuizzes.length > 0 
    ? recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / recentQuizzes.length 
    : 0)
  const totalQuestions = recentQuizzes.reduce((sum, quiz) => sum + quiz.questions, 0)
  const totalAttempts = stats?.totalAttempts || recentQuizzes.length
  const highestScore = recentQuizzes.length > 0 ? Math.max(...recentQuizzes.map(q => q.score)) : 0
  const maxDistributionCount = Math.max(...scoreDistribution.map(d => d.count)) || 4

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">            <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Summary</h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Average Score</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {loading ? '--' : `${averageScore.toFixed(1)}%`}
                </div>
              </div>              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Quizzes Taken</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {loading ? '--' : (stats?.totalAttempts || recentQuizzes.length)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Questions Answered</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {loading ? '--' : totalQuestions}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Highest Score</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {loading ? '--' : `${highestScore}%`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>        <Card className="border-gray-200 col-span-1 md:col-span-2 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h3>
            <div className="h-64 relative bg-gray-50 rounded-lg p-4">              {/* Y-axis labels */}
              <div className="absolute left-2 top-4 bottom-12 w-8 flex flex-col justify-between text-xs text-gray-500">
                <div>{maxDistributionCount}</div>
                <div>{Math.round(maxDistributionCount * 0.75)}</div>
                <div>{Math.round(maxDistributionCount / 2)}</div>
                <div>{Math.round(maxDistributionCount * 0.25)}</div>
                <div>0</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-12 right-4 top-4 bottom-12 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div key={line} className="border-t border-gray-200 w-full" />
                ))}
              </div>
              
              {/* Chart container */}
              <div className="absolute left-12 right-4 top-4 bottom-12">
                <svg className="w-full h-full overflow-visible">
                  <defs>
                    {/* Gradient for area fill */}
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                    {/* Area under the line */}
                  <path
                    d={`M ${scoreDistribution.map((item, i) => {
                      const x = (i / (scoreDistribution.length - 1)) * 100;
                      const y = 100 - ((item.count / (maxDistributionCount || 1)) * 100);
                      return `${x}% ${y}%`;
                    }).join(' L ')} L 100% 100% L 0% 100% Z`}
                    fill="url(#scoreGradient)"
                    className="transition-all duration-1000"
                  />
                  
                  {/* Connecting line */}
                  <path
                    d={`M ${scoreDistribution.map((item, i) => {
                      const x = (i / (scoreDistribution.length - 1)) * 100;
                      const y = 100 - ((item.count / (maxDistributionCount || 1)) * 100);
                      return `${x}% ${y}%`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000"
                    style={{
                      strokeDasharray: "1000",
                      strokeDashoffset: "1000",
                      animation: "dash 2s ease-in-out forwards"
                    }}
                  />
                  
                  {/* Data points */}
                  {scoreDistribution.map((item, index) => {
                    const x = (index / (scoreDistribution.length - 1)) * 100;
                    const y = 100 - ((item.count / (maxDistributionCount || 1)) * 100);
                    return (
                      <g key={index}>
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="6"
                          fill="#4f46e5"
                          stroke="white"
                          strokeWidth="3"
                          className="cursor-pointer transition-all duration-300 hover:r-8"
                        />
                        
                        {/* Tooltip on hover */}
                        <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                          <rect
                            x={`${x}%`}
                            y={`${y}%`}
                            width="80"
                            height="24"
                            rx="4"
                            transform="translate(-40, -30)"
                            fill="#1f2937"
                          />
                          <text
                            x={`${x}%`}
                            y={`${y}%`}
                            textAnchor="middle"
                            transform="translate(0, -14)"
                            fontSize="12"
                            fill="white"
                            fontWeight="500"
                          >
                            {item.count} quizzes
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-2 left-12 right-4 flex justify-between">
                {scoreDistribution.map((item, index) => (
                  <div key={index} className="text-xs font-medium text-gray-700 text-center">
                    {item.range}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Quiz Results</h3>        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading quiz results...</div>
          ) : recentQuizzes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No quiz results yet</div>
          ) : (            recentQuizzes.map((quiz, index) => (
              <motion.div
                key={`${quiz.id}-${index}-${quiz.timestamp || Date.now()}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-gray-200 bg-white">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-indigo-600">{quiz.name}</div>
                        <div className="text-sm text-gray-500">
                          {quiz.date} • {quiz.questions} questions • {quiz.difficulty}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-indigo-600">{quiz.score}%</div>
                        <div className="w-24 md:w-32">
                          <Progress
                            value={quiz.score}
                            className={`h-2`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
