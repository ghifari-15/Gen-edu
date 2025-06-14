"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

export function StudentVolume() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-teal-600 h-full text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Learning Progress</h3>
          </div>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 -mt-2 -mr-2">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-white/80 text-sm mt-1">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-white/80 text-sm mt-1">Subjects</div>
          </div>
        </div>

        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-white/20"></div>

            {/* Progress circle with gradient */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <motion.circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="219.8"
                initial={{ strokeDashoffset: 219.8 }}
                animate={{ strokeDashoffset: 219.8 * (1 - 0.85) }}
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
                <span className="text-2xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-700">
                  70%
                </span>
                <div className="text-xs text-gray-500">Completion</div>
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
