"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  id: string;
  title: string;
  questions: Question[];
}

interface QuizResultsProps {
  quiz: QuizProps;
  score: string;
  timeSpent: string;
  correctAnswers?: number;
  totalQuestions?: number;
  passed?: boolean;
}

export function QuizResults({ 
  quiz, 
  score, 
  timeSpent, 
  correctAnswers, 
  totalQuestions, 
  passed 
}: QuizResultsProps) {  const formatTime = (seconds: string): string => {
    const minutes = Math.floor(parseInt(seconds) / 60)
    const remainingSeconds = parseInt(seconds) % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Use passed props or calculate from existing data
  const actualCorrectAnswers = correctAnswers ?? Math.round((Number.parseInt(score) / 100) * quiz.questions.length)
  const actualTotalQuestions = totalQuestions ?? quiz.questions.length
  const actualPassed = passed ?? (Number.parseInt(score) >= 70)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white shadow-md border-gray-200">
        <CardContent className="p-6 md:p-8">
          <motion.h1
            className="text-2xl font-bold text-center text-gray-900 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Quiz Results
          </motion.h1>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-sm text-gray-500 mb-1">Score</div>
              <div className="text-3xl font-bold text-indigo-600">{score}%</div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-sm text-gray-500 mb-1">Time Spent</div>
              <div className="text-3xl font-bold text-indigo-600">{formatTime(timeSpent)}</div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >              <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
              <div className="text-3xl font-bold text-indigo-600">
                {actualCorrectAnswers}/{actualTotalQuestions}
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-sm text-gray-500 mb-1">Accuracy</div>
              <div className="text-3xl font-bold text-indigo-600">{score}%</div>
            </motion.div>          </div>

          {/* Pass/Fail Status */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
              actualPassed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {actualPassed ? (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Congratulations! You Passed!
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 mr-2" />
                  You Need More Practice
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            className="space-y-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-4 last:border-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{question.text}</h3>
                <div className="flex items-start gap-2">
                  <div className="text-gray-600 font-medium">Your answer:</div>
                  <div className="flex items-center">
                    <span className="text-green-600">{question.options[question.correctAnswer]}</span>
                    {question.correctAnswer === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/quiz">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 h-auto">Back to Home</Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
