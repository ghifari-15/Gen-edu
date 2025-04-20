"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"

export function QuizAnalytics({ timeRange }) {
  const isMobile = useIsMobile()

  const quizzes = [
    { name: "Machine Learning Fundamentals", score: 92, questions: 15, date: "Apr 5, 2025" },
    { name: "Data Structures & Algorithms", score: 85, questions: 20, date: "Apr 2, 2025" },
    { name: "Web Development with React", score: 78, questions: 12, date: "Mar 28, 2025" },
    { name: "AI Ethics and Considerations", score: 95, questions: 10, date: "Mar 25, 2025" },
    { name: "Python Programming", score: 88, questions: 18, date: "Mar 20, 2025" },
  ]

  const averageScore = quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions, 0)

  const scoreDistribution = [
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
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Summary</h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Average Score</div>
                <div className="text-3xl font-bold text-indigo-600">{averageScore.toFixed(1)}%</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Quizzes Taken</div>
                <div className="text-3xl font-bold text-indigo-600">{quizzes.length}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Questions Answered</div>
                <div className="text-3xl font-bold text-indigo-600">{totalQuestions}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Highest Score</div>
                <div className="text-3xl font-bold text-indigo-600">95%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 col-span-1 md:col-span-2 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h3>
            <div className="h-64 flex items-end space-x-4">
              {scoreDistribution.map((item, index) => (
                <div key={item.range} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className={`w-full ${item.color} rounded-t`}
                    style={{ height: `${item.count * 25}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${item.count * 25}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <div className="text-xs text-gray-500 mt-2 text-center">{item.range}</div>
                  <div className="text-sm font-medium">{item.count}</div>
                </div>
              ))}
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
                      <div className="font-medium">{quiz.name}</div>
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
