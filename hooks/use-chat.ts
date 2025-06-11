import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  text: string
  sender: 'ai' | 'user'
  time: string
  model?: 'claude-sonnet' | 'deepseek-reasoning'
  isStreaming?: boolean
}

export interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  threadId: string | null
  sendMessage: (message: string, useReasoning?: boolean) => Promise<void>
  clearChat: () => void
  loadThread: (threadId: string) => Promise<void>
}

export function useChat(): UseChatReturn {
  const getCurrentTime = (): string => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  const generateId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hello! I'm GenEdu Agent, your AI learning assistant. I can help you with studying, explaining concepts, creating quizzes, and more. How can I assist you today?",
      sender: 'ai',
      time: getCurrentTime(),
      model: 'claude-sonnet'
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string, useReasoning = false) => {
    if (!message.trim() || isLoading || isStreaming) return

    const userMessage: ChatMessage = {
      id: generateId(),
      text: message.trim(),
      sender: 'user',
      time: getCurrentTime()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsStreaming(true)

    // Create AI message placeholder
    const aiMessageId = generateId()
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      time: getCurrentTime(),
      model: useReasoning ? 'deepseek-reasoning' : 'claude-sonnet',
      isStreaming: true
    }

    setMessages(prev => [...prev, aiMessage])

    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          threadId,
          useReasoning
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.done) {
                setThreadId(data.threadId)
                setIsStreaming(false)
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, isStreaming: false }
                    : msg
                ))
                break
              }

              if (data.content) {
                accumulatedText += data.content
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, text: accumulatedText }
                    : msg
                ))
              }

              if (data.threadId && !threadId) {
                setThreadId(data.threadId)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      
      if (error.name === 'AbortError') {
        return // Request was cancelled
      }

      // Show error message
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              text: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false 
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [isLoading, isStreaming, threadId])

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      text: "Hello! I'm GenEdu Agent, your AI learning assistant. How can I assist you today?",
      sender: 'ai',
      time: getCurrentTime(),
      model: 'claude-sonnet'
    }])
    setThreadId(null)
    setIsLoading(false)
    setIsStreaming(false)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const loadThread = useCallback(async (threadId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/chat?threadId=${threadId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load thread')
      }

      const data = await response.json()
      if (data.success && data.thread) {
        const loadedMessages: ChatMessage[] = data.thread.messages.map((msg: any) => ({
          id: generateId(),
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai',
          time: new Date(msg.timestamp).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          model: data.thread.model
        }))
        
        setMessages(loadedMessages)
        setThreadId(threadId)
      }
    } catch (error) {
      console.error('Error loading thread:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    threadId,
    sendMessage,
    clearChat,
    loadThread
  }
}
