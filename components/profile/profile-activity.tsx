"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Clock, CheckCircle, Edit, FileText, BrainCircuit } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function ProfileActivity() {
  const isMobile = useIsMobile()

  const activities = [
    {
      type: "quiz",
      title: "Completed Quiz: Machine Learning Fundamentals",
      description: "Scored 92% on a 15-question quiz",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      time: "2 hours ago",
    },
    {
      type: "notebook",
      title: "Updated Notebook: Data Structures & Algorithms",
      description: "Added new notes on graph algorithms",
      icon: Edit,
      color: "bg-blue-100 text-blue-600",
      time: "Yesterday",
    },
    {
      type: "achievement",
      title: "Earned Achievement: Quick Learner",
      description: "Completed 5 quizzes with 90%+ accuracy",
      icon: Award,
      color: "bg-amber-100 text-amber-600",
      time: "2 days ago",
    },
    {
      type: "study",
      title: "Study Session: Neural Networks",
      description: "Studied for 45 minutes",
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
      time: "3 days ago",
    },
    {
      type: "notebook",
      title: "Created Notebook: AI Ethics and Considerations",
      description: "Started a new notebook on AI ethics",
      icon: FileText,
      color: "bg-indigo-100 text-indigo-600",
      time: "5 days ago",
    },
    {
      type: "quiz",
      title: "Generated Quiz: Web Development",
      description: "Created a 20-question quiz on React and Next.js",
      icon: BrainCircuit,
      color: "bg-lime-100 text-lime-600",
      time: "1 week ago",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${activity.color} mr-3`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-500">{activity.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View More Activity</button>
      </div>
    </div>
  )
}
