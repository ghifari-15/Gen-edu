"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Brain, MessageCircle, Search, Loader2 } from "lucide-react"

interface RAGResult {
  answer: string
  sources: {
    title: string
    content: string
    category: string
    similarity: number
  }[]
  confidence: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  ragResult?: RAGResult
  timestamp: Date
}

export default function RAGChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuestion, setInputQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmitQuestion = async () => {
    if (!inputQuestion.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputQuestion,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: inputQuestion
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.data.answer,
            ragResult: data.data,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        } else {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: "I'm sorry, I couldn't process your question. Please try again.",
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        }
      }
    } catch (error) {
      console.error('RAG query failed:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputQuestion("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitQuestion()
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            RAG Knowledge Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions about the knowledge base and get AI-powered answers with relevant sources.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about the knowledge base..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSubmitQuestion} 
              disabled={!inputQuestion.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Welcome to RAG Assistant</h3>
                <p className="text-muted-foreground">
                  Start by asking a question about the knowledge base. I'll search through the available content and provide you with relevant answers.
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={message.type === 'user' ? 'ml-8' : 'mr-8'}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="font-medium">
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.ragResult && message.ragResult.sources.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <Separator />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Sources:</span>
                        <Badge 
                          variant="secondary" 
                          className={`${getConfidenceColor(message.ragResult.confidence)} text-white`}
                        >
                          {message.ragResult.confidence.toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="grid gap-2 max-h-40 overflow-y-auto">
                        {message.ragResult.sources.map((source, index) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{source.title}</h4>
                              <Badge variant="outline">{source.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{source.content}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              Similarity: {(source.similarity * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
