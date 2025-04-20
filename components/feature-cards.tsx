"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BookOpen, BrainCircuit, Route, BarChart3 } from "lucide-react"

export function FeatureCards() {
  const features = [
    {
      title: "AI Agent Notebook",
      description: "Interactive learning with AI-powered notes",
      icon: BookOpen,
      color: "from-blue-500/20 to-blue-600/20",
    },
    {
      title: "Quiz Generator",
      description: "Create personalized quizzes from your content",
      icon: BrainCircuit,
      color: "from-purple-500/20 to-purple-600/20",
    },
    {
      title: "Learning Roadmap",
      description: "Customized learning paths based on your goals",
      icon: Route,
      color: "from-yellow-500/20 to-yellow-600/20",
    },
    {
      title: "Progress Tracking",
      description: "Visualize your learning journey and achievements",
      icon: BarChart3,
      color: "from-green-500/20 to-green-600/20",
    },
  ]

  return (
    <>
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * index }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card
            className={`bg-gray-900/90 backdrop-blur-sm border-gray-800 rounded-xl overflow-hidden h-full bg-gradient-to-br ${feature.color}`}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center mb-3">
                <feature.icon className="h-5 w-5 text-gray-300 mr-2" />
                <h3 className="text-gray-300 font-medium">{feature.title}</h3>
              </div>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  )
}
