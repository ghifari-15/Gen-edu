"use client"

import { Navbar } from "@/components/navbar"
import { QuizCreator } from "@/components/quiz/quiz-creator"
import { motion } from "framer-motion"
import { useEffect } from "react"

export default function CreateQuizPage() {
  useEffect(() => {
    // Reset scroll position to top when component mounts
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
        <QuizCreator />
      </motion.div>
    </main>
  )
}
