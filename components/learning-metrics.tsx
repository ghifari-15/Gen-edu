"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"

export function LearningMetrics() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (count < 487) {
        setCount((prev) => Math.min(prev + Math.ceil(Math.random() * 50), 487))
      } else {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [count])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-indigo-950 text-white p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">Total Sessions</h3>
            <Button variant="ghost" size="icon" className="text-gray-300 -mt-2 -mr-2">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-4xl font-bold">${count},592</span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="px-2 py-1 bg-lime-400 text-indigo-950 text-xs font-medium rounded-full">+15%</div>
            <span className="ml-2 text-gray-300 text-sm">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
