"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

export function StudentVolume() {
  return (
    <Card className="shadow-md border border-gray-200 h-full bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">Learning Progress</h3>
          <Button variant="ghost" size="icon" className="text-gray-500 -mt-2 -mr-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative w-36 md:w-48 h-36 md:h-48">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-gray-100"></div>

            {/* Progress circle with gradient */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 * (1 - 0.7) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-center"
              >
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-700">
                  70%
                </span>
                <div className="text-sm text-gray-500 mt-1">Completion</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-center text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <div className="flex items-center justify-center gap-2">
            <span>Your learning progress has increased</span>
            <motion.span
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full inline-block"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              whileHover={{ scale: 1.1 }}
            >
              +15%
            </motion.span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Daily</div>
              <div className="text-indigo-600 font-medium">+2.4%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Weekly</div>
              <div className="text-indigo-600 font-medium">+8.7%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Monthly</div>
              <div className="text-indigo-600 font-medium">+15%</div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
