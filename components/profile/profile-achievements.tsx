"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Star, Zap, BookOpen, Target, Trophy, Clock, Lightbulb } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function ProfileAchievements() {
  const isMobile = useIsMobile()

  const achievements = [
    {
      title: "Quick Learner",
      description: "Completed 5 quizzes with 90%+ accuracy",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600",
      date: "Apr 5, 2025",
      unlocked: true,
    },
    {
      title: "Knowledge Seeker",
      description: "Created 10 notebooks with detailed notes",
      icon: BookOpen,
      color: "bg-indigo-100 text-indigo-600",
      date: "Apr 3, 2025",
      unlocked: true,
    },
    {
      title: "Perfect Score",
      description: "Achieved 100% on a quiz with 20+ questions",
      icon: Target,
      color: "bg-green-100 text-green-600",
      date: "Mar 28, 2025",
      unlocked: true,
    },
    {
      title: "Dedicated Scholar",
      description: "Studied for 50 hours total on the platform",
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
      date: "Mar 25, 2025",
      unlocked: true,
    },
    {
      title: "AI Master",
      description: "Completed the entire AI fundamentals course",
      icon: Trophy,
      color: "bg-amber-100 text-amber-600",
      date: "Mar 20, 2025",
      unlocked: true,
    },
    {
      title: "Innovator",
      description: "Created a custom learning roadmap",
      icon: Lightbulb,
      color: "bg-blue-100 text-blue-600",
      date: "Mar 15, 2025",
      unlocked: true,
    },
    {
      title: "Expert Status",
      description: "Reach level 20 in your learning journey",
      icon: Star,
      color: "bg-gray-100 text-gray-600",
      unlocked: false,
    },
    {
      title: "Completionist",
      description: "Finish all courses in a learning path",
      icon: Award,
      color: "bg-gray-100 text-gray-600",
      unlocked: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Your Achievements</h3>
        <div className="text-sm text-gray-500">6 of 8 unlocked</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className={`border-gray-200 ${!achievement.unlocked ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${achievement.color} mr-3`}>
                    <achievement.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-gray-500">{achievement.description}</div>
                    {achievement.date && <div className="text-xs text-gray-400 mt-1">Unlocked: {achievement.date}</div>}
                    {!achievement.unlocked && <div className="text-xs text-gray-400 mt-1">Locked</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="flex items-start">
          <Trophy className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-indigo-900">Achievement Progress</h4>
            <p className="text-sm text-indigo-700 mt-1">
              You're making great progress! Complete 2 more achievements to reach the "Achievement Hunter" status.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
