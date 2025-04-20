"use client"

import { Navbar } from "@/components/navbar"
import { QuizResults } from "@/components/quiz/quiz-results"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { sampleQuizzes } from "@/data/sample-quizzes"

export default function QuizResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params.id as string
  const score = searchParams.get("score") || "0"
  const timeSpent = searchParams.get("time") || "0"
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
          <div className="animate-pulse">Loading results...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <QuizResults quiz={quiz} score={score} timeSpent={timeSpent} />
      </div>
    </main>
  )
}
