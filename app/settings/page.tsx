"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { SettingsContent } from "@/components/settings/settings-content"
import { motion } from "framer-motion"

export default function SettingsPage() {
  useEffect(() => {
    // Reset scroll position to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <motion.div
        className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-visible"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SettingsContent />
      </motion.div>
    </main>
  )
}
