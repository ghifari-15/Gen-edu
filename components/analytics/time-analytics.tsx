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
        </Card>        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Study Hours</h3>
            <div className="h-64 relative bg-gray-50 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-2 top-4 bottom-12 w-10 flex flex-col justify-between text-xs text-gray-500">
                <div>{maxHours}h</div>
                <div>{Math.round(maxHours * 0.75)}h</div>
                <div>{Math.round(maxHours / 2)}h</div>
                <div>{Math.round(maxHours * 0.25)}h</div>
                <div>0h</div>
              </div>

              {/* Grid lines */}
              <div className="absolute left-14 right-4 top-4 bottom-12 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div key={line} className="border-t border-gray-200 w-full" />
                ))}
              </div>

              {/* Chart container */}
              <div className="absolute left-14 right-4 top-4 bottom-12">
                <svg className="w-full h-full overflow-visible">
                  <defs>
                    {/* Gradient for area fill */}
                    <linearGradient id="weeklyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under the line */}
                  <path
                    d={`M ${weeklyHours.map((hours, i) => {
                      const x = (i / (weeklyHours.length - 1)) * 100;
                      const y = 100 - ((hours / maxHours) * 100);
                      return `${x}% ${y}%`;
                    }).join(' L ')} L 100% 100% L 0% 100% Z`}
                    fill="url(#weeklyGradient)"
                    className="transition-all duration-1000"
                  />
                  
                  {/* Connecting line */}
                  <path
                    d={`M ${weeklyHours.map((hours, i) => {
                      const x = (i / (weeklyHours.length - 1)) * 100;
                      const y = 100 - ((hours / maxHours) * 100);
                      return `${x}% ${y}%`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000"
                    style={{
                      strokeDasharray: "1000",
                      strokeDashoffset: "1000",
                      animation: "dash 2s ease-in-out forwards"
                    }}
                  />
                  
                  {/* Data points */}
                  {weeklyHours.map((hours, index) => {
                    const x = (index / (weeklyHours.length - 1)) * 100;
                    const y = 100 - ((hours / maxHours) * 100);
                    return (
                      <g key={index}>
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="6"
                          fill="#4f46e5"
                          stroke="white"
                          strokeWidth="3"
                          className="cursor-pointer transition-all duration-300 hover:r-8"
                        />
                        
                        {/* Tooltip on hover */}
                        <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                          <rect
                            x={`${x}%`}
                            y={`${y}%`}
                            width="50"
                            height="24"
                            rx="4"
                            transform="translate(-25, -30)"
                            fill="#1f2937"
                          />
                          <text
                            x={`${x}%`}
                            y={`${y}%`}
                            textAnchor="middle"
                            transform="translate(0, -14)"
                            fontSize="12"
                            fill="white"
                            fontWeight="500"
                          >
                            {hours}h
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-2 left-14 right-4 flex justify-between">
                {weeks.map((week, index) => (
                  <div key={index} className="text-xs font-medium text-gray-700 text-center">
                    {week}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
