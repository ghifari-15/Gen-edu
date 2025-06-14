"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { QuizMetrics } from "@/components/quiz-metrics"
import { StudentVolume } from "@/components/student-volume"
import { CollegeCourses } from "@/components/college-courses"
import { ChatInterface } from "@/components/chat-interface"
import { RecentActivity } from "@/components/recent-activity"
import { Card } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { KnowledgeBasePanel } from "@/components/knowledge-base-panel"

export function DashboardContent() {
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    window.scrollTo(0, 0)
    setIsLoaded(true)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 w-full max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate={isLoaded ? "show" : "hidden"}
    >
      {/* Header Section */}
      <motion.div className="flex flex-col space-y-2" variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back!
            </h1>
            <p className="text-gray-600 mt-1">Here's your learning overview and recent activity</p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Active Learning
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Top Metrics Row */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuizMetrics />
            <KnowledgeBasePanel />
          </div>
        </motion.div>

        {/* Student Volume - Compact */}
        <motion.div variants={item} className="lg:col-span-2">
          <StudentVolume />
        </motion.div>

        {/* AI Chat Interface - Enhanced */}
        <motion.div variants={item} className="lg:col-span-4">
          <Card className="h-[500px] overflow-hidden shadow-lg border-0 bg-white rounded-2xl">
            <ChatInterface />
          </Card>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div variants={item} className="lg:col-span-4">
          <RecentActivity />
        </motion.div>
      </div>
    </motion.div>
  )
}
