"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Plus, List, BarChart, Clock, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalQuestions: number;
  estimatedTime?: number;
  totalAttempts: number;
  averageScore: number;
  createdAt: string;
}

export default function AllQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch('/api/quiz')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setQuizzes(data.quizzes)
          }
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizzes()
  }, [])

  // Filter quizzes based on search term and difficulty
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === "all" || quiz.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <motion.div
        className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">All Quizzes</h1>
              <p className="text-gray-600">Manage and take all your created quizzes</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/quiz/create">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 h-auto flex items-center w-full md:w-auto justify-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Quiz
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Quizzes Grid */}
          <motion.div variants={container} initial="hidden" animate="show">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div key={index} variants={item}>
                    <Card className="h-full bg-white border-gray-200 shadow-sm animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-6"></div>
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <motion.div 
                    key={quiz.id} 
                    variants={item} 
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-full bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                        <p className="text-gray-600 mb-6 line-clamp-2">{quiz.description}</p>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <List className="h-4 w-4 mr-1" />
                            <span>{quiz.totalQuestions} Questions</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <BarChart className="h-4 w-4 mr-1" />
                            <span className="capitalize">{quiz.difficulty}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {quiz.totalAttempts > 0 && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Attempts: {quiz.totalAttempts}</span>
                              <span className="text-gray-600">Avg Score: {quiz.averageScore}%</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link href={`/quiz/${quiz.id}`} className="flex-1">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                              Take Quiz
                            </Button>
                          </Link>
                          <Link href={`/quiz/generated/${quiz.id}`}>
                            <Button variant="outline" className="px-3">
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div variants={item}>
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <List className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {searchTerm || filterDifficulty !== "all" ? "No matching quizzes" : "No quizzes yet"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || filterDifficulty !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "Create your first quiz to get started!"
                        }
                      </p>
                      {!searchTerm && filterDifficulty === "all" && (
                        <Link href="/quiz/create">
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Quiz
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
