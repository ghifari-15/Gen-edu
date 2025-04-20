"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI learning assistant. How can I help with your studies today?",
      sender: "ai",
      time: "11:32 AM",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    // Use a more reliable approach to scroll to the bottom
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user", time: getCurrentTime() }])
      setInput("")

      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I can help you with that! Would you like me to explain this concept, create a practice quiz, or suggest some additional resources?",
            sender: "ai",
            time: getCurrentTime(),
          },
        ])
      }, 1000)
    }
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={chatContainerRef}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex items-start max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                {message.sender === "ai" && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-xs">
                      AI
                    </div>
                  </div>
                )}
                <div>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.sender === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.text}
                  </div>
                  <div
                    className={`text-xs text-gray-400 mt-1 ${message.sender === "user" ? "text-right mr-1" : "ml-1"}`}
                  >
                    {message.time}
                  </div>
                </div>
                {message.sender === "user" && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center text-indigo-900 text-xs">
                      You
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-gray-100 bg-white mt-auto">
        <div className="relative flex items-center">
          <Input
            className="pr-10 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-full bg-gray-50"
            placeholder="Message AI assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            className="absolute right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center"
            onClick={handleSend}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
