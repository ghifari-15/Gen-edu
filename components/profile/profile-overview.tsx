"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Brain, Award, Clock, Calendar, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function ProfileOverview() {
  const isMobile = useIsMobile()

  const stats = [
    { label: "Quizzes Completed", value: 42, icon: BookOpen, color: "bg-indigo-100 text-indigo-600" },
    { label: "Learning Hours", value: 128, icon: Clock, color: "bg-lime-100 text-lime-600" },
    { label: "Achievements", value: 15, icon: Award, color: "bg-amber-100 text-amber-600" },
    { label: "Knowledge Score", value: 720, icon: Brain, color: "bg-purple-100 text-purple-600" },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-gray-200">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`p-2 rounded-full ${stat.color} mb-2`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">About Me</h3>
          <p className="text-gray-600">
            I'm an AI education enthusiast with a passion for machine learning and data science. Currently exploring the
            intersection of AI and education to create more personalized learning experiences.
          </p>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>Seoul, South Korea</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
              <span>AI Researcher at TechInnovate</span>
            </div>
            <div className="flex items-center text-gray-600">
              <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
              <span>MSc in Computer Science, Seoul National University</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>Joined April 2025</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Learning Progress</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Machine Learning</span>
                <span className="text-sm font-medium text-gray-700">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Data Science</span>
                <span className="text-sm font-medium text-gray-700">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Web Development</span>
                <span className="text-sm font-medium text-gray-700">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">AI Ethics</span>
                <span className="text-sm font-medium text-gray-700">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Courses</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Advanced Neural Networks</div>
                <div className="text-sm text-gray-500">4 of 8 modules completed</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Data Visualization Techniques</div>
                <div className="text-sm text-gray-500">2 of 6 modules completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
