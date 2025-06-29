"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Send, 
  Trash2, 
  MessageSquare,
  Bot,
  User,
  Loader2,
  X
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface NotebookChatPanelProps {
  notebookId: string
  isOpen?: boolean
  onClose?: () => void
}

export function NotebookChatPanel({ notebookId, isOpen = true, onClose }: NotebookChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasUploadedFile, setHasUploadedFile] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (notebookId) {
      loadChatHistory()
    }
  }, [notebookId])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chat`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages || [])
        setThreadId(data.threadId)
        setHasUploadedFile(data.hasUploadedContent || false)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chat`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setHasUploadedFile(true)
        setThreadId(data.threadId)
        // Add a system message to show file was uploaded
        const systemMessage: Message = {
          role: 'assistant',
          content: `📄 File "${file.name}" has been uploaded and processed. You can now ask questions about its content!`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, systemMessage])
      } else {
        alert(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsStreaming(true)

    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                assistantMessage += data.content
                // Update the last message (assistant message)
                setMessages(prev => prev.map((msg, index) => 
                  index === prev.length - 1 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ))
              }
              if (data.done) {
                // Streaming complete
                break
              }
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (parseError) {
              console.error('Parse error:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      // Remove the empty assistant message and show error
      setMessages(prev => prev.slice(0, -1))
      alert('Failed to send message')
    } finally {
      setIsStreaming(false)
    }
  }

  const clearChat = async () => {
    if (!confirm('Are you sure you want to clear the chat history?')) return

    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chat`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setMessages([])
        setHasUploadedFile(false)
        setThreadId(null)
      }
    } catch (error) {
      console.error('Clear chat error:', error)
      alert('Failed to clear chat')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notebook Assistant
            </CardTitle>
            <CardDescription>
              Upload a PDF to chat about its content, or ask general questions
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* File Upload Section */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Processing...' : 'Upload PDF'}
          </Button>
          
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {hasUploadedFile && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              PDF content loaded. You can now ask questions about the document!
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Upload a PDF or start a conversation</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-lg whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isStreaming && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-3 rounded-lg bg-gray-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about your uploaded document or notebook..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isStreaming}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isStreaming}
            size="sm"
            className="self-end"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
