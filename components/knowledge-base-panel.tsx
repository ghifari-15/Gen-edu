"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpen, TrendingUp, Clock, Target } from "lucide-react"
import { motion } from "framer-motion"

interface KnowledgeStats {
  totalEntries: number;
  bySource: Record<string, number>;
  bySubject: Record<string, number>;
  recentCount: number;
  averageScore: number;
}

interface RecentQuiz {
  _id: string;
  title: string;
  metadata: {
    subject?: string;
    difficulty?: string;
    score?: number;
    questionsCount?: number;
    createdAt: string;
  };
}

export function KnowledgeBasePanel() {
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchKnowledgeStats()
    fetchRecentQuizzes()
  }, [])

  const fetchKnowledgeStats = async () => {
    try {
      const response = await fetch('/api/knowledge-base/summary')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching knowledge stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentQuizzes = async () => {
    try {
      const response = await fetch('/api/knowledge-base/recent?days=7&limit=3')
      if (response.ok) {
        const data = await response.json()
        setRecentQuizzes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching recent quizzes:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default' // green
    if (score >= 60) return 'secondary' // yellow
    return 'destructive' // red
  }
  if (isLoading) {
    return (
      <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Learning Analytics</h3>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalEntries === 0) {
    return (
      <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Learning Analytics</h3>
          </div>
          <div className="text-center py-4">
            <BookOpen className="h-10 w-10 mx-auto text-white/70 mb-3" />
            <p className="text-white/90 mb-1">No learning data yet</p>
            <p className="text-sm text-white/70">Complete a quiz to see your analytics</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Learning Analytics</h3>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-white/80 text-sm">Materials</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.averageScore?.toFixed(0) || 0}%</div>
            <p className="text-white/80 text-sm">Avg Score</p>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/90">Top Subjects</h4>
          {Object.entries(stats.bySubject || {}).slice(0, 3).map(([subject, count]) => (
            <div key={subject} className="flex justify-between items-center">
              <span className="text-white/80 text-sm capitalize">{subject}</span>
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                {count}
              </Badge>
            </div>
          ))}
        </div>

        {/* Subjects */}
        {Object.keys(stats.bySubject).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Target className="h-4 w-4" />
              Subjects
            </h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.bySubject).slice(0, 4).map(([subject, count]) => (
                <Badge key={subject} variant="outline" className="text-xs">
                  {subject} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Quizzes */}
        {recentQuizzes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Recent Quizzes
            </h4>
            <div className="space-y-2">
              {recentQuizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{quiz.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {quiz.metadata.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {quiz.metadata.subject}
                        </Badge>
                      )}
                      {quiz.metadata.difficulty && (
                        <span className="text-xs text-gray-500">
                          {quiz.metadata.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  {quiz.metadata.score !== undefined && (
                    <div className="ml-2">
                      <Badge variant={getScoreBadgeVariant(quiz.metadata.score)} className="text-xs">
                        {quiz.metadata.score}%
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI Context Status */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI Context Ready</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Active</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Chat assistant has access to your learning history
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
