"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"

// Add CSS for chart animations
const chartStyles = `
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
`;

interface QuizAnalyticsProps {
  timeRange: string;
}

interface QuizData {
  name: string;
  score: number;
  questions: number;
  date: string;
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
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchQuizStats() {
      try {
        const response = await fetch('/api/quiz/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(data.stats)
          }
        }
      } catch (error) {
        console.error('Error fetching quiz stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizStats()
  }, [timeRange])

  // Mock data for demonstration (replace with real data when available)
  const quizzes: QuizData[] = [
    { name: "Machine Learning Fundamentals", score: 92, questions: 15, date: "Apr 5, 2025" },
    { name: "Data Structures & Algorithms", score: 85, questions: 20, date: "Apr 2, 2025" },
    { name: "Web Development with React", score: 78, questions: 12, date: "Mar 28, 2025" },
    { name: "AI Ethics and Considerations", score: 95, questions: 10, date: "Mar 25, 2025" },
    { name: "Python Programming", score: 88, questions: 18, date: "Mar 20, 2025" },
  ]

  const averageScore = stats?.completionRate || quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions, 0)
  const totalAttempts = stats?.totalAttempts || quizzes.length
  const highestScore = Math.max(...quizzes.map(q => q.score))

  const scoreDistribution: ScoreDistribution[] = [
    { range: "90-100%", count: 2, color: "bg-green-500" },
    { range: "80-89%", count: 2, color: "bg-lime-500" },
    { range: "70-79%", count: 1, color: "bg-yellow-500" },
    { range: "60-69%", count: 0, color: "bg-orange-500" },
    { range: "0-59%", count: 0, color: "bg-red-500" },
  ]

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
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Quizzes Taken</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {loading ? '--' : (stats?.totalAttempts || quizzes.length)}
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
            <div className="h-64 relative bg-gray-50 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-2 top-4 bottom-12 w-8 flex flex-col justify-between text-xs text-gray-500">
                <div>4</div>
                <div>3</div>
                <div>2</div>
                <div>1</div>
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
                      const y = 100 - ((item.count / 4) * 100);
                      return `${x}% ${y}%`;
                    }).join(' L ')} L 100% 100% L 0% 100% Z`}
                    fill="url(#scoreGradient)"
                    className="transition-all duration-1000"
                  />
                  
                  {/* Connecting line */}
                  <path
                    d={`M ${scoreDistribution.map((item, i) => {
                      const x = (i / (scoreDistribution.length - 1)) * 100;
                      const y = 100 - ((item.count / 4) * 100);
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
                    const y = 100 - ((item.count / 4) * 100);
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Quiz Results</h3>
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.name}
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
                        {quiz.date} • {quiz.questions} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-indigo-600">{quiz.score}%</div>
                      <div className="w-24 md:w-32">
                        <Progress
                          value={quiz.score}
                          className={`h-2 ${
                            quiz.score >= 90
                              ? "bg-green-500"
                              : quiz.score >= 80
                                ? "bg-lime-500"
                                : quiz.score >= 70
                                  ? "bg-yellow-500"
                                  : quiz.score >= 60
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
