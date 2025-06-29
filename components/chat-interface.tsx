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
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GenEdu Assistant</h1>
                <p className="text-sm text-emerald-600 font-medium">Online • Ready to help</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => setUseReasoning(!useReasoning)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    useReasoning 
                      ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Brain className="h-4 w-4 mr-2 inline" />
                  Reasoning
                </button>

                <button
                  onClick={() => setUseContext(!useContext)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    useContext 
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Database className="h-4 w-4 mr-2 inline" />
                  Context
                </button>
              </div>

              <button
                onClick={clearChat}
                className="p-2.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                title="Clear conversation"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
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
        className="flex-1 overflow-y-auto bg-gray-50"
        ref={chatContainerRef}
        style={{ 
          height: isFullScreen 
            ? 'calc(100vh - 200px)' 
            : 'calc(100% - 120px)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="text-center max-w-lg mx-auto px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Hi there! 👋</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-10">
                I'm your GenEdu learning companion. Whether you need help understanding concepts, want to create practice quizzes, or just have questions about your studies — I'm here to help!
              </p>
              
              {isFullScreen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">💡</span>
                    </div>
                    <div className="font-semibold text-gray-900 mb-3">Learn & Understand</div>
                    <div className="space-y-2 text-gray-600 text-left">
                      <div>• Explain complex topics</div>
                      <div>• Break down concepts</div>
                      <div>• Answer your questions</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">🧠</span>
                    </div>
                    <div className="font-semibold text-gray-900 mb-3">Smart Analysis</div>
                    <div className="space-y-2 text-gray-600 text-left">
                      <div>• Deep reasoning mode</div>
                      <div>• Context-aware responses</div>
                      <div>• Personalized help</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">📝</span>
                    </div>
                    <div className="font-semibold text-gray-900 mb-3">Practice & Test</div>
                    <div className="space-y-2 text-gray-600 text-left">
                      <div>• Generate quizzes</div>
                      <div>• Create study materials</div>
                      <div>• Track progress</div>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className={`flex items-start max-w-[85%] sm:max-w-[75%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0 mr-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md ${
                        message.model === 'deepseek-reasoning' 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                          : 'bg-gradient-to-br from-emerald-400 to-blue-500'
                      }`}>
                        {message.model === 'deepseek-reasoning' ? (
                          <Brain className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col max-w-full">
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
                        className={`relative px-5 py-4 rounded-3xl shadow-sm ${message.sender === "ai" && message.model === 'deepseek-reasoning' && (message.thinking || message.isThinking) ? 'mt-2' : ''} ${
                          message.sender === "user" 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-900 border border-gray-100 shadow-md"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                            {message.text}
                            {message.isStreaming && !message.isThinking && (
                              <span className="inline-block w-0.5 h-4 bg-white/70 ml-1 animate-pulse" />
                            )}
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer 
                              content={message.text} 
                              className="text-gray-900 leading-relaxed text-[15px]"
                            />
                            {message.isStreaming && !message.isThinking && (
                              <span className="inline-block w-0.5 h-4 bg-gray-400 ml-1 animate-pulse" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs text-gray-500 mt-2 flex items-center ${
                      message.sender === "user" ? "justify-end mr-1" : "ml-1"
                    }`}>
                      <span>{message.time}</span>
                      {message.sender === "ai" && message.model && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs font-medium">
                          {message.model === 'deepseek-reasoning' ? '🧠 Reasoning' : '✨ Standard'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm shadow-md">
                        U
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        </div>
      </div>

      {/* Input Section */}
      <div className="border-t bg-white px-4 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="pr-14 py-4 border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-2xl text-base resize-none min-h-[56px] bg-gray-50 focus:bg-white transition-all duration-200 placeholder:text-gray-500"
                disabled={isLoading || isStreaming}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {input.trim() ? (
                  <button
                    onClick={onSend}
                    disabled={isLoading || isStreaming}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                      isLoading || isStreaming 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : useReasoning
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                          : useContext
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
                            : 'bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white shadow-lg'
                    }`}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <ArrowUp className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile mode buttons */}
          <div className="flex sm:hidden items-center justify-center space-x-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setUseReasoning(!useReasoning)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                useReasoning 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain className="h-4 w-4 mr-2 inline" />
              Reasoning
            </button>
            <button
              onClick={() => setUseContext(!useContext)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                useContext 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Database className="h-4 w-4 mr-2 inline" />
              Context
            </button>
          </div>
          
          {isStreaming && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <div className="flex items-center space-x-1 mr-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="font-medium">
                {useReasoning ? 'Thinking deeply about your question...' : useContext ? 'Analyzing with your context...' : 'Typing a response...'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
