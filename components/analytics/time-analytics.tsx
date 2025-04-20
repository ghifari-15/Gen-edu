"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"

export function TimeAnalytics({ timeRange }) {
  const isMobile = useIsMobile()

  const timeData = {
    totalHours: 128,
    weeklyAverage: 12.5,
    longestSession: 2.5,
    sessionsCompleted: 42,
  }

  const timeBySubject = [
    { name: "Machine Learning", hours: 45, color: "bg-indigo-600" },
    { name: "Data Science", hours: 32, color: "bg-lime-500" },
    { name: "Web Development", hours: 28, color: "bg-amber-500" },
    { name: "AI Ethics", hours: 15, color: "bg-purple-500" },
    { name: "Computer Vision", hours: 8, color: "bg-blue-500" },
  ]

  const totalSubjectHours = timeBySubject.reduce((sum, subject) => sum + subject.hours, 0)

  const weeklyHours = [8, 10, 15, 12, 18, 20, 14]
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Time Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Total Hours</div>
                <div className="text-3xl font-bold text-indigo-600">{timeData.totalHours}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Weekly Average</div>
                <div className="text-3xl font-bold text-indigo-600">{timeData.weeklyAverage}h</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Longest Session</div>
                <div className="text-3xl font-bold text-indigo-600">{timeData.longestSession}h</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Sessions</div>
                <div className="text-3xl font-bold text-indigo-600">{timeData.sessionsCompleted}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Study Hours</h3>
            <div className="h-64 flex items-end space-x-2">
              {weeklyHours.map((hours, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className="w-full bg-indigo-600 rounded-t"
                    style={{ height: `${hours * 3}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${hours * 3}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <div className="text-xs text-gray-500 mt-2">{weeks[index]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Time by Subject</h3>
        <div className="space-y-4">
          {timeBySubject.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm font-medium text-gray-500">
                      {subject.hours} hours ({Math.round((subject.hours / totalSubjectHours) * 100)}%)
                    </div>
                  </div>
                  <Progress value={(subject.hours / totalSubjectHours) * 100} className={`h-2 ${subject.color}`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="text-sm text-indigo-900">
          <span className="font-medium">Pro Tip:</span> Research shows that studying in 25-minute focused sessions with
          5-minute breaks (the Pomodoro Technique) can improve retention and reduce fatigue.
        </div>
      </div>
    </div>
  )
}
