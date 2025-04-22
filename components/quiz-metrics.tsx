"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function QuizMetrics() {
  const [count, setCount] = useState(0)
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0])
  const finalChartData = [20, 35, 45, 60, 40, 50, 65]

  useEffect(() => {
    const countInterval = setInterval(() => {
      if (count < 487) {
        setCount((prev) => Math.min(prev + Math.ceil(Math.random() * 50), 487))
      } else {
        clearInterval(countInterval)
      }
    }, 100)

    const chartInterval = setInterval(() => {
      setChartData((prev) =>
        prev.map((value, index) => {
          if (value < finalChartData[index]) {
            return Math.min(value + Math.ceil(Math.random() * 10), finalChartData[index])
          }
          return value
        }),
      )
    }, 100)

    return () => {
      clearInterval(countInterval)
      clearInterval(chartInterval)
    }
  }, [count])

  return (
    <Card className="overflow-hidden shadow-md border border-gray-200 h-full">
      <CardContent className="p-0">
        <div className="bg-indigo-950 text-white p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">Total Quizzes Taken</h3>
            <Button variant="ghost" size="icon" className="text-gray-300 -mt-2 -mr-2">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-4xl font-bold">{count}</span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="px-2 py-1 bg-lime-400 text-indigo-950 text-xs font-medium rounded-full">+15%</div>
            <span className="ml-2 text-gray-300 text-sm">vs last month</span>
          </div>

          <div className="mt-4 flex items-end space-x-1 h-20">
            {chartData.map((height, index) => (
              <motion.div
                key={index}
                className="bg-lime-400 rounded-t w-full"
                style={{ height: `${height}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
