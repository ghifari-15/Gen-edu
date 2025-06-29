"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

interface TimeAnalyticsProps {
  timeRange: string;
}

interface TimeDataProps {
  totalHours: number;
  weeklyAverage: number;
  longestSession: number;
  sessionsCompleted: number;
  weeklyHours: number[];
}

// Color mapping for subjects
const subjectColors = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
];

export function TimeAnalytics({ timeRange }: TimeAnalyticsProps) {
  const isMobile = useIsMobile()
  const [timeData, setTimeData] = useState<TimeDataProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchTimeData() {
      try {
        const response = await fetch('/api/analytics/time')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTimeData(data.timeData)
            
            // Transform weekly data for chart
            const weeklyData = data.timeData.weeklyHours.map((hours: number, index: number) => ({
              week: `Week ${index + 1}`,
              hours: hours,
              sessions: Math.floor(hours * 3.2) // Estimate sessions based on hours
            }))
            setWeeklyChartData(weeklyData)
          }
        }
      } catch (error) {
        console.error('Error fetching time analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeData()
  }, [timeRange])

  // Fallback data if no real data is available
  const fallbackData: TimeDataProps = {
    totalHours: 0,
    weeklyAverage: 0,
    longestSession: 0,
    sessionsCompleted: 0,
    weeklyHours: [0, 0, 0, 0, 0, 0, 0]
  }

  const currentData = timeData || fallbackData
  
  // Use real data for charts or empty arrays if no data
  const chartWeeklyData = weeklyChartData.length > 0 ? weeklyChartData : 
    currentData.weeklyHours.map((hours, index) => ({
      week: `Week ${index + 1}`,
      hours: hours,
      sessions: Math.floor(hours * 3.2)
    }))

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            Hours: <span className="font-bold">{payload[0].value}h</span>
          </p>
          {payload[0].payload.sessions && (
            <p className="text-emerald-600">
              Sessions: <span className="font-bold">{payload[0].payload.sessions}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-blue-700 mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-blue-900">
              {loading ? '--' : currentData.totalHours}h
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-emerald-700 mb-1">Weekly Average</div>
            <div className="text-2xl font-bold text-emerald-900">
              {loading ? '--' : `${currentData.weeklyAverage}h`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-purple-700 mb-1">Longest Session</div>
            <div className="text-2xl font-bold text-purple-900">
              {loading ? '--' : `${currentData.longestSession}h`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-amber-700 mb-1">Sessions</div>
            <div className="text-2xl font-bold text-amber-900">
              {loading ? '--' : currentData.sessionsCompleted}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Hours Chart - Full Width */}
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Study Hours</h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : chartWeeklyData.length === 0 || chartWeeklyData.every(d => d.hours === 0) ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📊</span>
                  </div>
                  <p className="text-gray-500">No study time data available yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start studying to see your progress here</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartWeeklyData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#colorHours)"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Study Efficiency Tips</h4>
            <p className="text-blue-800 leading-relaxed">
              Research shows that studying in 25-minute focused sessions with 5-minute breaks (the Pomodoro Technique) 
              can improve retention and reduce fatigue. Try to maintain consistent study schedules for better results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
