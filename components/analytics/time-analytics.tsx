"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"

interface TimeAnalyticsProps {
  timeRange: string;
}

interface SubjectData {
  name: string;
  hours: number;
  color: string;
}

interface TimeDataProps {
  totalHours: number;
  weeklyAverage: number;
  longestSession: number;
  sessionsCompleted: number;
}

export function TimeAnalytics({ timeRange }: TimeAnalyticsProps) {
  const isMobile = useIsMobile()

  const timeData: TimeDataProps = {
    totalHours: 128,
    weeklyAverage: 12.5,
    longestSession: 2.5,
    sessionsCompleted: 42,
  }

  const timeBySubject: SubjectData[] = [
    { name: "Machine Learning", hours: 45, color: "bg-indigo-600" },
    { name: "Data Science", hours: 32, color: "bg-lime-500" },
    { name: "Web Development", hours: 28, color: "bg-amber-500" },
    { name: "AI Ethics", hours: 15, color: "bg-purple-500" },
    { name: "Computer Vision", hours: 8, color: "bg-blue-500" },
  ]

  const totalSubjectHours = timeBySubject.reduce((sum, subject) => sum + subject.hours, 0)

  const weeklyHours: number[] = [8, 10, 15, 12, 18, 20, 14]
  const weeks: string[] = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]
  
  // Calculate max hours for proper scaling
  const maxHours = Math.max(...weeklyHours)

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
            <div className="h-64 relative bg-gray-50 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-2 top-0 bottom-8 w-10 flex flex-col justify-between text-xs text-gray-500">
                <div>{maxHours}h</div>
                <div>{Math.round(maxHours * 0.75)}h</div>
                <div>{Math.round(maxHours / 2)}h</div>
                <div>{Math.round(maxHours * 0.25)}h</div>
                <div>0h</div>
              </div>

              {/* Grid lines */}
              <div className="absolute left-12 right-4 top-0 bottom-8 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div key={line} className="border-t border-gray-200 w-full" />
                ))}
              </div>

              {/* Line chart container */}
              <div className="ml-12 mr-4 h-full flex flex-col pt-0 pb-8 relative">
                {/* Line points and path */}
                <svg className="w-full h-full absolute top-0 left-0 overflow-visible">
                  {/* Line path with animation */}
                  <path
                    d={weeklyHours.map((hours, i) => {
                      const x = (i / (weeklyHours.length - 1)) * 100;
                      const y = 100 - ((hours / maxHours) * 100);
                      return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    className="transition-all duration-1000"
                    style={{ animation: "dash 2s ease-in-out forwards" }}
                  />
                  
                  {/* Area under the line with gradient */}
                  <linearGradient id="weeklyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                  
                  <path
                    d={`${weeklyHours.map((hours, i) => {
                      const x = (i / (weeklyHours.length - 1)) * 100;
                      const y = 100 - ((hours / maxHours) * 100);
                      return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                    }).join(' ')} L 100% 100% L 0% 100% Z`}
                    fill="url(#weeklyGradient)"
                    className="transition-all duration-500"
                  />
                  
                  {/* Data points */}
                  {weeklyHours.map((hours, index) => {
                    const x = (index / (weeklyHours.length - 1)) * 100;
                    const y = 100 - ((hours / maxHours) * 100);
                    return (
                      <g key={index} className="transition-all duration-500">
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#4f46e5"
                          stroke="white"
                          strokeWidth="2"
                          className="group relative hover:r-6 transition-all cursor-pointer"
                        />
                        
                        {/* Tooltips */}
                        <g className="opacity-0 hover:opacity-100 transition-opacity">
                          <rect
                            x={`${x}%`}
                            y={`${y - 8}%`}
                            width="40"
                            height="20"
                            rx="4"
                            transform="translate(-20, -20)"
                            fill="#1f2937"
                          />
                          <text
                            x={`${x}%`}
                            y={`${y - 8}%`}
                            textAnchor="middle"
                            transform="translate(0, -12)"
                            fontSize="10"
                            fill="white"
                          >
                            {hours}h
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0">
                  {weeks.map((week, index) => (
                    <div key={index} className="text-xs font-medium text-gray-700">{week}</div>
                  ))}
                </div>
              </div>
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
