"use client"

import { Navbar } from "@/components/navbar"
import { QuizResults } from "@/components/quiz/quiz-results"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

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

interface QuizResultData {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
}

export default function QuizResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params.id as string
  
  // Get results from URL params
  const resultData: QuizResultData = {
    score: parseInt(searchParams.get("score") || "0"),
    correctAnswers: parseInt(searchParams.get("correct") || "0"),
    totalQuestions: parseInt(searchParams.get("total") || "0"),
    timeSpent: parseInt(searchParams.get("time") || "0"),
    passed: searchParams.get("passed") === "true"
  }

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset scroll position to top when component mounts
    window.scrollTo(0, 0)

    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/quiz/${quizId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Quiz not found')
          }
          throw new Error('Failed to fetch quiz')
        }
        
        const quizData = await response.json()
        setQuiz(quizData)
      } catch (err) {
        console.error('Error fetching quiz:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    }
  }, [quizId])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading results...</div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !quiz) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">❌</div>
            <div className="text-gray-600">{error || 'Quiz not found'}</div>
            <button 
              onClick={() => window.location.href = '/quiz/create'}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <QuizResults 
          quiz={quiz} 
          score={resultData.score.toString()} 
          timeSpent={resultData.timeSpent.toString()}
          correctAnswers={resultData.correctAnswers}
          totalQuestions={resultData.totalQuestions}
          passed={resultData.passed}
        />
      </div>
    </main>
  )
}
