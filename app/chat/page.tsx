"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Minimize2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleMinimize = () => {
    router.push("/")
  }

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold text-gray-900">GenEdu Agent - Full Screen</h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="text-gray-600 hover:text-gray-800"
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          Minimize
        </Button>
      </div>      {/* Chat Interface - Full Screen */}
      <div className="flex-1 bg-white min-h-0">
        <ChatInterface isFullScreen={true} />
      </div>
    </div>
  )
}
