"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Clock, Book, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

export function CollegeCourses() {
  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      department: "Computer Science",
      progress: 75,
      credits: 3,
      nextClass: "Tomorrow, 10:00 AM",
      color: "bg-lime-400",
    },
    {
      id: 2,
      title: "Calculus II",
      department: "Mathematics",
      progress: 60,
      credits: 4,
      nextClass: "Today, 2:30 PM",
      color: "bg-indigo-950",
    },
    {
      id: 3,
      title: "Introduction to Psychology",
      department: "Psychology",
      progress: 45,
      credits: 3,
      nextClass: "Wednesday, 1:15 PM",
      color: "bg-gray-100",
    },
    {
      id: 4,
      title: "World History: Modern Era",
      department: "History",
      progress: 30,
      credits: 3,
      nextClass: "Friday, 11:00 AM",
      color: "bg-gray-100",
    },
  ]

  return (
    <Card className="shadow-md border border-gray-200">
      <CardContent className="p-4 md:p-6 bg-white">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <Button variant="ghost" size="icon" className="text-gray-500 -mt-2 -mr-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Notebooks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <Book className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Machine Learning Fundamentals</h4>
              </div>
              <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Notebook</div>
            </div>

            <p className="text-sm text-gray-500 mb-4">Last edited 2 hours ago</p>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>3 sources • Apr 4, 2025</span>
            </div>
          </motion.div>

          {/* Recent Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-lime-400 mr-2" />
                <h4 className="font-semibold text-gray-900">Machine Learning Fundamentals</h4>
              </div>
              <div className="px-2 py-1 bg-indigo-950 text-white text-xs rounded-full">Quiz</div>
            </div>

            <p className="text-sm text-gray-500 mb-4">Score: 92% • 15 questions</p>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Completed Apr 5, 2025</span>
            </div>
          </motion.div>

          {/* Recent Notebook */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <Book className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Web Development Notes</h4>
              </div>
              <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Notebook</div>
            </div>

            <p className="text-sm text-gray-500 mb-4">Last edited yesterday</p>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>2 sources • Apr 2, 2025</span>
            </div>
          </motion.div>

          {/* Recent Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-lime-400 mr-2" />
                <h4 className="font-semibold text-gray-900">Data Structures & Algorithms</h4>
              </div>
              <div className="px-2 py-1 bg-indigo-950 text-white text-xs rounded-full">Quiz</div>
            </div>

            <p className="text-sm text-gray-500 mb-4">Score: 85% • 20 questions</p>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Completed Apr 2, 2025</span>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
