import { NextRequest, NextResponse } from 'next/server'
import { AuthUtils } from '@/lib/auth/utils'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import dbConnect from '@/lib/database/mongodb'
import ChatThread from '@/lib/models/ChatThread'

// Initialize LLM instances
const defaultLLM = new ChatOpenAI({
  model: "anthropic/claude-3-7-sonnet-latest",
  apiKey: process.env.DEEPINFRA_API_KEY,
  temperature: 0.7,
  streaming: true,
  configuration: {
    baseURL: "https://api.deepinfra.com/v1/openai"
  }
})

const reasoningLLM = new ChatOpenAI({
  model: "deepseek-ai/DeepSeek-R1-0528",
  apiKey: process.env.DEEPINFRA_API_KEY,
  temperature: 0.7,
  streaming: true,
  configuration: {
    baseURL: "https://api.deepinfra.com/v1/openai"
  }
})

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = AuthUtils.verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { message, threadId, useReasoning = false } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    await dbConnect()

    // Get or create chat thread
    let chatThread
    if (threadId) {
      chatThread = await ChatThread.findOne({ threadId, userId: payload.userId })
      if (!chatThread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }
    } else {
      // Create new thread
      const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      chatThread = new ChatThread({
        threadId: newThreadId,
        userId: payload.userId,
        messages: [],
        model: useReasoning ? 'deepseek-reasoning' : 'claude-sonnet',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Add user message to thread
    chatThread.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    })

    // Prepare conversation history for LLM
    const conversationHistory: BaseMessage[] = chatThread.messages.map((msg: any) => 
      msg.role === 'user' 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    )

    // Select LLM based on mode
    const selectedLLM = useReasoning ? reasoningLLM : defaultLLM

    // Create system message based on mode
    const systemPrompt = useReasoning 
      ? "You are GenEdu Agent, an advanced AI learning assistant with deep reasoning capabilities. Think step by step, analyze problems thoroughly, and provide detailed explanations. Help students understand concepts at a fundamental level."
      : "You are GenEdu Agent, a helpful AI learning assistant. Provide clear, concise answers and help students learn effectively. Focus on being educational and supportive."

    // Add system message to the beginning
    const messages = [
      new HumanMessage(systemPrompt),
      ...conversationHistory
    ]

    // Stream the response
    const stream = await selectedLLM.stream(messages)

    // Create readable stream for response
    const encoder = new TextEncoder()
    let aiResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.content
            if (content) {
              aiResponse += content
              const data = JSON.stringify({ 
                content,
                threadId: chatThread.threadId,
                model: useReasoning ? 'deepseek-reasoning' : 'claude-sonnet'
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Save AI response to thread
          chatThread.messages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          })
          chatThread.updatedAt = new Date()
          await chatThread.save()

          // Send completion signal
          controller.enqueue(encoder.encode(`data: {"done": true, "threadId": "${chatThread.threadId}"}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = AuthUtils.verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    await dbConnect()

    if (threadId) {
      // Get specific thread
      const chatThread = await ChatThread.findOne({ threadId, userId: payload.userId })
      if (!chatThread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, thread: chatThread })
    } else {
      // Get all threads for user
      const threads = await ChatThread.find({ userId: payload.userId })
        .sort({ updatedAt: -1 })
        .limit(20)
      return NextResponse.json({ success: true, threads })
    }

  } catch (error) {
    console.error('Get chat threads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat threads' },
      { status: 500 }
    )
  }
}
