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

export function DashboardContent() {
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Reset scroll position to top when component mounts
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
      className="flex-1 p-4 md:p-8 space-y-6 w-full"
      variants={container}
      initial="hidden"
      animate={isLoaded ? "show" : "hidden"}
    >
      <motion.div className="flex flex-col space-y-1" variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Home</h1>
        <p className="text-gray-500">Your current learning summary and activity</p>
      </motion.div>      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quiz Metrics Card */}
        <motion.div variants={item} className="col-span-1">
          <QuizMetrics />
        </motion.div>

        {/* Recent Activity Card */}
       

        {/* AI Chat Interface - Desktop (only shown on home page) */}
        {!isMobile && (
          <motion.div variants={item} className="md:col-span-2 lg:row-span-2">
            <Card className="h-full overflow-hidden shadow-sm border-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex items-center">
                <div className="h-2 w-2 bg-lime-400 rounded-full mr-2"></div>
                <h3 className="text-base font-medium text-white">AI Assistant</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Student Volume Card */}
        <motion.div variants={item} className="col-span-1">
          <StudentVolume />
        </motion.div>

        {/* Mobile AI Chat Interface - Only shown on mobile */}
        {isMobile && (
          <motion.div variants={item} className="col-span-1">
            <Card className="h-80 overflow-hidden shadow-sm border-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-3 flex items-center">
                <div className="h-2 w-2 bg-lime-400 rounded-full mr-2"></div>
                <h3 className="text-sm font-medium text-white">AI Assistant</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </Card>
          </motion.div>
        )}

        {/* College Courses Card */}
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3">
          <RecentActivity />
        </motion.div>
      </div>

    </motion.div>
  )
}
