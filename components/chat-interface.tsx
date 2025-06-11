"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp, Brain, Sparkles, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/hooks/use-chat"
import { MarkdownRenderer } from "@/components/markdown-renderer"

// ThinkingBar component for showing reasoning process
function ThinkingBar({ thinking, isThinking }: { thinking?: string; isThinking?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false) // Changed to false by default

  if (!thinking && !isThinking) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 border border-purple-200 rounded-lg bg-purple-50"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-purple-700 hover:bg-purple-100 rounded-t-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4" />
          <span>Reasoning Process</span>
          {isThinking && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          >            <div className="px-3 pb-3 text-sm text-purple-800 bg-purple-50 rounded-b-lg border-t border-purple-200">
              <div className="max-h-48 overflow-y-auto">
                <MarkdownRenderer 
                  content={thinking || "Thinking..."} 
                  className="text-xs leading-relaxed"
                />
                {isThinking && (
                  <span className="inline-block w-2 h-3 bg-purple-600 ml-1 animate-pulse" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ChatInterface() {
  const { messages, isLoading, isStreaming, sendMessage, clearChat } = useChat()
  const [input, setInput] = useState<string>("")
  const [useReasoning, setUseReasoning] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (): void => {
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header with mode indicator and controls */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${useReasoning ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                {useReasoning ? (
                  <Brain className={`h-5 w-5 ${useReasoning ? 'text-purple-600' : 'text-indigo-600'}`} />
                ) : (
                  <Sparkles className={`h-5 w-5 ${useReasoning ? 'text-purple-600' : 'text-indigo-600'}`} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">GenEdu Agent</h3>
                <p className="text-xs text-gray-500">
                  {useReasoning ? 'DeepSeek R1 0528' : 'Claude 3.7 Sonnet'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseReasoning(!useReasoning)}
              className={`${
                useReasoning 
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Brain className="h-4 w-4 mr-1" />
              {useReasoning ? 'Reasoning' : 'Default'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages - Fixed height with scroll */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0" ref={chatContainerRef}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex items-start max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                {message.sender === "ai" && (
                  <div className="flex-shrink-0 mr-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs ${
                      message.model === 'deepseek-reasoning' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-800' 
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-800'
                    }`}>
                      {message.model === 'deepseek-reasoning' ? (
                        <Brain className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                )}                <div className="flex flex-col">
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
                          : "bg-gray-100 text-gray-800"
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
                        <div className="prose prose-sm max-w-none">
                          <MarkdownRenderer 
                            content={message.text} 
                            className="text-gray-800"
                          />
                          {message.isStreaming && !message.isThinking && (
                            <span className="inline-block w-2 h-4 bg-gray-800 ml-1 animate-pulse" />
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
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 text-xs">
                        {message.model === 'deepseek-reasoning' ? 'Deepseek' : 'Claude'}
                      </span>
                    )}
                  </div>
                </div>
                {message.sender === "user" && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center text-indigo-900 text-xs font-medium">
                      You
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>      {/* Input - Fixed at bottom */}
      <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="relative flex items-center">
          <Input
            className="pr-10 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-full bg-gray-50"
            placeholder={`Message GenEdu Agent${useReasoning ? ' (Reasoning Mode)' : ''}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isStreaming}
          />
          <Button
            className={`absolute right-1 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center ${
              isLoading || isStreaming 
                ? 'bg-gray-400 cursor-not-allowed' 
                : useReasoning
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            onClick={handleSend}
            disabled={isLoading || isStreaming || !input.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        
        {isStreaming && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></div>
            {useReasoning ? 'Reasoning through your question...' : 'Generating response...'}
          </div>
        )}</div>
    </div>
  )
}
