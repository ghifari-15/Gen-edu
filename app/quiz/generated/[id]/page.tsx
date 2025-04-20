"use client"

import { Navbar } from "@/components/navbar"
import { GeneratedQuizPreview } from "@/components/quiz/generated-quiz-preview"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { sampleQuizzes } from "@/data/sample-quizzes"
import { motion } from "framer-motion"

export default function GeneratedQuizPage() {
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState(null)

  useEffect(() => {
    // Reset scroll position to top when component mounts
    window.scrollTo(0, 0)

    // In a real app, you would fetch the quiz from an API
    const foundQuiz = sampleQuizzes.find((q) => q.id === quizId) || sampleQuizzes[0]
    setQuiz(foundQuiz)
  }, [quizId])

  if (!quiz) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading quiz details...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <motion.div
        className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GeneratedQuizPreview quiz={quiz} />
      </motion.div>
    </main>
  )
}
