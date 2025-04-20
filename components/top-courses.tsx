"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopCourses() {
  const courses = [
    {
      id: 1,
      title: "Introduction to AI and Machine Learning",
      orders: "520 students in 30 days",
      image: "/placeholder.svg?height=40&width=40",
      location: "San Francisco",
      color: "bg-lime-400",
    },
    {
      id: 2,
      title: "Advanced Data Structures and Algorithms",
      orders: "452 students in 30 days",
      image: "/placeholder.svg?height=40&width=40",
      location: "Los Angeles",
      color: "bg-indigo-950",
    },
    {
      id: 3,
      title: "Web Development with React and Next.js",
      orders: "320 students in 30 days",
      image: "/placeholder.svg?height=40&width=40",
      location: "San Diego",
      color: "bg-gray-100",
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">Most Popular Courses by Region</h3>
          <Button variant="ghost" size="icon" className="text-gray-500 -mt-2 -mr-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-gray-400">Map visualization</div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: course.id * 0.1 }}
                className={`flex items-center p-4 rounded-full ${
                  course.id === 1 ? "bg-lime-400" : course.id === 2 ? "bg-indigo-950 text-white" : "bg-gray-100"
                }`}
              >
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={course.image} />
                  <AvatarFallback>{course.id}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className={`font-medium ${course.id === 2 ? "text-white" : "text-gray-900"}`}>{course.title}</h4>
                  <p className={`text-sm ${course.id === 2 ? "text-gray-300" : "text-gray-500"}`}>{course.orders}</p>
                </div>
                <div className="ml-4 flex items-center">
                  <div
                    className={`rounded-full px-3 py-1 text-sm ${
                      course.id === 2 ? "bg-indigo-900 text-white" : "bg-white"
                    }`}
                  >
                    #{course.id}
                  </div>
                  <div
                    className={`ml-2 px-3 py-1 rounded-full text-sm ${
                      course.id === 2 ? "bg-indigo-900 text-white" : "bg-white"
                    }`}
                  >
                    {course.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
