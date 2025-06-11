"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, Maximize, Minimize, BrainCircuit, Brain, Sparkles, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/hooks/use-chat"
import { MarkdownRenderer } from "@/components/markdown-renderer"

// ThinkingBar component for showing reasoning process
function ThinkingBar({ thinking, isThinking }: { thinking?: string; isThinking?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!thinking && !isThinking) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 border border-purple-600 rounded-lg bg-purple-900/20"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-purple-300 hover:bg-purple-800/30 rounded-t-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4" />
          <span>Reasoning Process</span>
          {isThinking && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >            <div className="px-3 pb-3 text-sm text-purple-200 bg-purple-900/10 rounded-b-lg border-t border-purple-600">
              <div className="max-h-48 overflow-y-auto">
                <MarkdownRenderer 
                  content={thinking || "Thinking..."} 
                  className="text-xs leading-relaxed text-purple-200"
                  isDark={true}
                />
                {isThinking && (
                  <span className="inline-block w-2 h-3 bg-purple-400 ml-1 animate-pulse" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Define types for the component props
interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const { messages, isLoading, isStreaming, sendMessage, clearChat } = useChat()
  const [input, setInput] = useState<string>("")
  const [useReasoning, setUseReasoning] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (): void => {
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

  const handleSend = async (): Promise<void> => {
    if (input.trim() && !isLoading && !isStreaming) {
      const message = input.trim()
      setInput("")
      await sendMessage(message, useReasoning)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded)
  }
  return (
    <AnimatePresence>
      {isOpen && (        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${
            isExpanded ? "inset-4 md:inset-10" : "bottom-20 md:bottom-6 right-4 md:right-6 w-[90%] md:w-[400px]"
          } bg-black rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col`}
          style={{ 
            height: isExpanded ? "calc(100vh - 80px)" : "500px",
            maxHeight: isExpanded ? "calc(100vh - 80px)" : "500px"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded ${useReasoning ? 'bg-purple-900' : 'bg-indigo-900'}`}>
                {useReasoning ? (
                  <Brain className="h-5 w-5 text-purple-400" />
                ) : (
                  <BrainCircuit className="h-5 w-5 text-indigo-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">GenEdu Agent</h3>
                <p className="text-xs text-gray-400">
                  {useReasoning ? 'DeepSeek Reasoning' : 'Claude Sonnet'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseReasoning(!useReasoning)}
                className={`text-xs px-2 py-1 ${
                  useReasoning 
                    ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Brain className="h-3 w-3 mr-1" />
                {useReasoning ? 'R' : 'D'}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-8 w-8"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              
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
          </div>          {/* Messages - Fixed height with scroll */}
          <div className="flex-1 p-4 overflow-y-auto bg-black min-h-0" ref={chatContainerRef}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
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
                        <div className={`h-8 w-8 rounded flex items-center justify-center text-xs ${
                          message.model === 'deepseek-reasoning' 
                            ? 'bg-purple-900 text-purple-400' 
                            : 'bg-indigo-900 text-indigo-400'
                        }`}>
                          {message.model === 'deepseek-reasoning' ? (
                            <Brain className="h-4 w-4" />
                          ) : (
                            <BrainCircuit className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    )}                    <div className="flex flex-col">
                      {/* Thinking Bar - appears first for AI messages with reasoning */}
                      {message.sender === "ai" && message.model === 'deepseek-reasoning' && (message.thinking || message.isThinking) && (
                        <ThinkingBar 
                          thinking={message.thinking} 
                          isThinking={message.isThinking}
                        />
                      )}
                        {/* Main message content - appears below thinking bar */}
                      {message.text && (
                        <div
                          className={`p-3 rounded-2xl ${message.sender === "ai" && message.model === 'deepseek-reasoning' && (message.thinking || message.isThinking) ? 'mt-2' : ''} ${
                            message.sender === "user"
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-800 text-white border border-gray-700"
                          }`}
                        >
                          {message.sender === "user" ? (
                            <div className="whitespace-pre-wrap text-white">
                              {message.text}
                              {message.isStreaming && !message.isThinking && (
                                <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
                              )}
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-invert">
                              <MarkdownRenderer 
                                content={message.text} 
                                className="text-white"
                                isDark={true}
                              />
                              {message.isStreaming && !message.isThinking && (
                                <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`text-xs text-gray-400 mt-1 flex items-center ${
                          message.sender === "user" ? "justify-end mr-1" : "ml-1"
                        }`}
                      >
                        <span>{message.time}</span>
                        {message.sender === "ai" && message.model && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded text-gray-400 text-xs">
                            {message.model === 'deepseek-reasoning' ? 'R' : 'C'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>          {/* Input - Fixed at bottom */}
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-full pr-10"
                placeholder={`Message GenEdu Agent${useReasoning ? ' (Reasoning)' : ''}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isStreaming}
              />
              <Button
                className={`absolute right-1 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center ${
                  isLoading || isStreaming 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : useReasoning
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                onClick={handleSend}
                disabled={isLoading || isStreaming || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {isStreaming && (
              <div className="mt-2 text-xs text-gray-400 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400 mr-2"></div>
                {useReasoning ? 'Reasoning...' : 'Generating...'}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
