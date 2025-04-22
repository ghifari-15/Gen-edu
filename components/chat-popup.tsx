"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, Maximize, Minimize, BrainCircuit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Define types for the component props
interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define the message type
interface Message {
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

export function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your Learning AI assistant. How can I help with your learning today?",
      sender: "ai",
      time: "11:32 AM",
    },
  ])
  const [input, setInput] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (): void => {
    // Use a more reliable approach to scroll to the bottom
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom()
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages, isOpen])

  const handleSend = (): void => {
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

  const getCurrentTime = (): string => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${
            isExpanded ? "inset-4 md:inset-10" : "bottom-20 md:bottom-6 right-4 md:right-6 w-[90%] md:w-[400px]"
          } bg-black rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col`}
          style={{ maxHeight: isExpanded ? "calc(100vh - 80px)" : "500px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-900 p-1.5 rounded">
                <BrainCircuit className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">GenEdu Agent</h3>
                <p className="text-xs text-gray-400">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-8 w-8"
                onClick={toggleExpand}
              >
                {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-black" ref={chatContainerRef}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`flex items-start max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {message.sender === "ai" && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="h-8 w-8 rounded bg-indigo-900 flex items-center justify-center text-indigo-400 text-xs">
                          <BrainCircuit className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    <div>
                      <div
                        className={`p-3 rounded-2xl ${
                          message.sender === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-800 text-white border border-gray-700"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-full pr-10"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                className="absolute right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center"
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
