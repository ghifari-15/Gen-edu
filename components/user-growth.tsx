"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function UserGrowth() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (count < 192230) {
        setCount((prev) => Math.min(prev + Math.ceil(Math.random() * 10000), 192230))
      } else {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [count])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
          <Button variant="ghost" size="icon" className="text-gray-500 -mt-2 -mr-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 flex space-x-2">
          <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full text-xs px-4 py-1 h-auto">
            12h
          </Button>
          <Button
            variant="outline"
            className="bg-white text-gray-700 border-gray-200 rounded-full text-xs px-4 py-1 h-auto"
          >
            24h
          </Button>
          <Button
            variant="outline"
            className="bg-white text-gray-700 border-gray-200 rounded-full text-xs px-4 py-1 h-auto"
          >
            A Week
          </Button>
          <Button
            variant="outline"
            className="bg-white text-gray-700 border-gray-200 rounded-full text-xs px-4 py-1 h-auto"
          >
            A Month
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold text-gray-900">{count.toLocaleString()}</h2>
            <div className="ml-3 px-2 py-1 bg-lime-100 text-lime-700 text-xs font-medium rounded-full">+15%</div>
          </div>

          <div className="mt-6 h-10 bg-gray-100 rounded-md overflow-hidden">
            <motion.div
              className="h-full bg-lime-400"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
          </div>

          <div className="mt-4 flex justify-between">
            <span className="text-gray-700">Checking totally</span>
            <span className="text-gray-700">+120 today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
