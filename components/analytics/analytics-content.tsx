"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuizAnalytics } from "@/components/analytics/quiz-analytics"
import { TimeAnalytics } from "@/components/analytics/time-analytics"
import { useIsMobile } from "@/hooks/use-mobile"
import { Calendar } from "lucide-react"

export function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState("quizzes")
  const [timeRange, setTimeRange] = useState("month")
  const isMobile = useIsMobile()

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your learning progress and performance</p>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs defaultValue="quizzes" onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className={isMobile ? "grid grid-cols-2 w-full" : ""}>
            <TabsTrigger value="quizzes" className={isMobile ? "w-full" : ""}>
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="time" className={isMobile ? "w-full" : ""}>
              Time Spent
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 flex-1 md:flex-none">
            <Calendar className="h-4 w-4 text-gray-500 ml-2" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="border-0 focus:ring-0 p-1 h-8">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          {activeTab === "quizzes" && <QuizAnalytics timeRange={timeRange} />}
          {activeTab === "time" && <TimeAnalytics timeRange={timeRange} />}
        </CardContent>
      </Card>
    </div>
  )
}
