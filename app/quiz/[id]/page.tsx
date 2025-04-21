"use client"

import { Navbar } from "@/components/navbar"
import { QuizTaker } from "@/components/quiz/quiz-taker"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { sampleQuizzes } from "@/data/sample-quizzes"

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizPage() {
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)

  useEffect(() => {
    // Reset scroll position to top when component mounts
    window.scrollTo(0, 0)

    // In a real app, you would fetch the quiz from an API
    const foundQuiz = sampleQuizzes.find((q) => q.id === quizId) || sampleQuizzes[0]
    setQuiz(foundQuiz as Quiz)
  }, [quizId])

  if (!quiz) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading quiz...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <QuizTaker quiz={quiz} />
      </div>
    </main>
  )
}
