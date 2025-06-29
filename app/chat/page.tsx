"use client"

import { Navbar } from "@/components/navbar"
import { ChatInterface } from "@/components/chat-interface"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <main className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <ChatInterface isFullScreen={true} />
        </div>
      </main>
    </ProtectedRoute>
  )
}
