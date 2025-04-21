"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"

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

interface SelectedAnswersType {
  [questionId: string]: number;
}

export function QuizTaker({ quiz }: { quiz: QuizProps }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersType>({})
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const router = useRouter()

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (questionId: string, answerIndex: number): void => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    })
  }

  const handlePrevious = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = (): void => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Last question
      setIsCompleted(true)

      // Calculate score
      let correctAnswers = 0
      Object.keys(selectedAnswers).forEach((questionId) => {
        const question = quiz.questions.find((q) => q.id === questionId)
        if (question && selectedAnswers[questionId] === question.correctAnswer) {
          correctAnswers++
        }
      })

      const score = Math.round((correctAnswers / quiz.questions.length) * 100)

      // Redirect to results page
      router.push(`/quiz/${quiz.id}/results?score=${score}&time=${timeSpent}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white shadow-md border-gray-200">
        <CardContent className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.text}</h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                      selectedAnswers[currentQuestion.id] === index
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-900 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion.id] === undefined}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
