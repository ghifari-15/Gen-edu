"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp, Brain, Sparkles, RotateCcw, ChevronDown, ChevronUp, Expand, Database, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/hooks/use-chat"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useRouter } from "next/navigation"

// Context summary interface
interface ContextSummary {
  totalEntries: number
  bySource: Record<string, number>
  bySubject: Record<string, number>
  averageScore: number
}

// Recent quiz interface
interface RecentQuiz {
  _id: string
  title: string
  metadata: {
    score?: number
    difficulty?: string
  }
}

// ThinkingBar component for showing reasoning process
function ThinkingBar({ thinking, isThinking }: { thinking?: string; isThinking?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

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
          >
            <div className="px-3 pb-3 text-sm text-purple-800 bg-purple-50 rounded-b-lg border-t border-purple-200">
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

export function ChatInterface({ isFullScreen = false }: { isFullScreen?: boolean }) {
  const [input, setInput] = useState("")
  const [useReasoning, setUseReasoning] = useState(false)
  const [useContext, setUseContext] = useState(false)
  const [showContextInfo, setShowContextInfo] = useState(false)
  const [contextSummary, setContextSummary] = useState<ContextSummary | null>(null)
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { messages, isLoading, isStreaming, sendMessage, clearChat } = useChat()

  // Fetch recent quizzes on component mount
  useEffect(() => {
    fetchRecentQuizzes()
  }, [])

  const fetchRecentQuizzes = async () => {
    try {
      const response = await fetch('/api/knowledge-base/recent?days=7&limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentQuizzes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching recent quizzes:', error)
    }
  }

  // Fetch context summary on component mount
  useEffect(() => {
    fetchContextSummary()
  }, [])

  const fetchContextSummary = async () => {
    try {
      const response = await fetch('/api/knowledge-base/summary')
      if (response.ok) {
        const data = await response.json()
        setContextSummary(data)
      }
    } catch (error) {
      console.error('Error fetching context summary:', error)
    }
  }

  const scrollToBottom = (): void => {
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSend = () => {
    if (input.trim()) {
      sendMessage(input)
      setInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - only show when not in fullscreen mode */}
      {!isFullScreen && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-white">
              <h3 className="font-semibold text-lg">AI Learning Assistant</h3>
              <p className="text-sm text-white/80">Available 24/7</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseReasoning(!useReasoning)}
              className={`text-xs ${
                useReasoning 
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={useReasoning ? 'Reasoning mode enabled' : 'Reasoning mode disabled'}
            >
              <Brain className="h-3 w-3 mr-1" />
              {useReasoning ? 'Reasoning' : 'Default'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseContext(!useContext)}
              className={`text-xs ${
                useContext 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={useContext ? 'Quiz context enabled' : 'Quiz context disabled'}
            >
              <Database className="h-3 w-3 mr-1" />
              {useContext ? 'Context' : 'No Context'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Clear conversation"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/chat')}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Expand to full screen"
            >
              <Expand className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Full screen header - only show in fullscreen mode */}
      {isFullScreen && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-white">
              <h1 className="font-bold text-xl sm:text-2xl">GenEdu AI Assistant</h1>
              <p className="text-sm text-white/80">Your intelligent learning companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseReasoning(!useReasoning)}
              className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                useReasoning 
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={useReasoning ? 'Reasoning mode enabled' : 'Reasoning mode disabled'}
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">{useReasoning ? 'Reasoning Mode' : 'Default Mode'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseContext(!useContext)}
              className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                useContext 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={useContext ? 'Quiz context enabled' : 'Quiz context disabled'}
            >
              <Database className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">{useContext ? 'Context Enabled' : 'No Context'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white/80 hover:text-white hover:bg-white/10 px-2 py-1 sm:px-3 sm:py-2"
              title="Clear conversation"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear Chat</span>
            </Button>
          </div>
        </div>
      )}

      {/* Context Info Panel */}
      <AnimatePresence>
        {showContextInfo && contextSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-blue-50 border-b border-blue-200"
          >
            <div className="text-sm text-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Learning Context Available</span>
                <span className="text-xs text-blue-600">Avg Score: {contextSummary.averageScore}%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Sources:</span>
                  <div className="mt-1">
                    {Object.entries(contextSummary.bySource).map(([source, count]) => (
                      <div key={source} className="flex justify-between">
                        <span className="capitalize">{source}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Subjects:</span>
                  <div className="mt-1">
                    {Object.entries(contextSummary.bySubject).slice(0, 3).map(([subject, count]) => (
                      <div key={subject} className="flex justify-between">
                        <span className="capitalize">{subject}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {recentQuizzes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="font-medium text-blue-800">Recent Quizzes:</span>
                  <div className="mt-2 space-y-1">
                    {recentQuizzes.slice(0, 3).map((quiz) => (
                      <div key={quiz._id} className="flex justify-between items-center text-xs">
                        <span className="truncate flex-1">{quiz.title}</span>
                        {quiz.metadata.score && (
                          <span className={`ml-2 font-medium ${
                            quiz.metadata.score >= 80 ? 'text-green-600' : 
                            quiz.metadata.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {quiz.metadata.score}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gray-50"
        ref={chatContainerRef}
        style={{ 
          height: isFullScreen 
            ? 'calc(100vh - 250px)' 
            : 'calc(100% - 120px)'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-16 h-16 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-4">
                <Sparkles className="h-8 w-8 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-2">Hello! I'm GenEdu Agent</h3>
              <p className="text-gray-600 text-base sm:text-sm leading-relaxed">
                Your AI learning assistant. I can help you with studying, explaining concepts, creating quizzes, and more. How can I assist you today?
              </p>
              
              {isFullScreen && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="font-medium text-gray-800 mb-2">Quick Actions</div>
                    <div className="space-y-1 text-gray-600">
                      <div>• Ask questions</div>
                      <div>• Explain concepts</div>
                      <div>• Create quizzes</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="font-medium text-gray-800 mb-2">AI Modes</div>
                    <div className="space-y-1 text-gray-600">
                      <div>• Reasoning mode</div>
                      <div>• Context mode</div>
                      <div>• Default mode</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`flex items-start max-w-[85%] sm:max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0 mr-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        message.model === 'deepseek-reasoning' 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-800' 
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600'
                      }`}>
                        {message.model === 'deepseek-reasoning' ? (
                          <Brain className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col">
                    {/* Thinking Bar */}
                    {message.sender === "ai" && message.model === 'deepseek-reasoning' && (message.thinking || message.isThinking) && (
                      <ThinkingBar 
                        thinking={message.thinking} 
                        isThinking={message.isThinking}
                      />
                    )}

                    {/* Main message content */}
                    {message.text && (
                      <div
                        className={`p-3 rounded-2xl ${message.sender === "ai" && message.model === 'deepseek-reasoning' && (message.thinking || message.isThinking) ? 'mt-2' : ''} ${
                          message.sender === "user" 
                            ? "bg-indigo-600 text-white" 
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <div className="whitespace-pre-wrap">
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
                    
                    <div className={`text-xs text-gray-400 mt-1 flex items-center ${
                      message.sender === "user" ? "justify-end mr-1" : "ml-1"
                    }`}>
                      <span>{message.time}</span>
                      {message.sender === "ai" && message.model && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 text-xs">
                          {message.model === 'deepseek-reasoning' ? 'Deepseek' : 'Claude'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 mr-2 mt-2">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium">
                        You
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input Section */}
      <div className="border-t border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message GenEdu Agent..."
            className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg text-base sm:text-sm"
            disabled={isLoading || isStreaming}
          />
          <Button
            className={`${
              isFullScreen ? 'h-11 w-11 sm:h-10 sm:w-10' : 'h-10 w-10 sm:h-9 sm:w-9'
            } ${
              isLoading || isStreaming 
                ? 'bg-gray-400 cursor-not-allowed' 
                : useReasoning
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : useContext
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
            } rounded-lg p-0`}
            onClick={onSend}
            disabled={isLoading || isStreaming || !input.trim()}
          >
            <ArrowUp className={`${isFullScreen ? 'h-5 w-5 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
          </Button>
        </div>
        
        {isStreaming && (
          <div className="mt-3 text-xs sm:text-sm text-gray-500 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></div>
            {useReasoning ? 'Reasoning through your question...' : useContext ? 'Analyzing with your learning context...' : 'Generating response...'}
          </div>
        )}
      </div>
    </div>
  )
}
