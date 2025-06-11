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
      </div>
    </div>
  )
}
