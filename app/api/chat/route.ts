import { NextRequest, NextResponse } from 'next/server'
import { AuthUtils } from '@/lib/auth/utils'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
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

    // Validate API key
    if (!process.env.DEEPINFRA_API_KEY) {
      console.error('DEEPINFRA_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }    await dbConnect()

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
    }    // Add user message to thread
    chatThread.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        useReasoning
      }
    })

    // Prepare conversation history for LLM
    const conversationHistory: BaseMessage[] = chatThread.messages
      .filter((msg: { role: string }) => msg.role !== 'system') // Exclude system messages from history
      .map((msg: any) => 
        msg.role === 'user' 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      )    // Select LLM based on mode
    const selectedLLM = useReasoning ? reasoningLLM : defaultLLM

    // Get current date and time for real-time context
    const currentDate = new Date()
    const dateString = currentDate.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeString = currentDate.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    })

    // Create system message based on reasoning mode
    const systemPrompt = useReasoning 
      ? `You are GenEdu Agent, an advanced AI learning assistant with deep reasoning capabilities powered by cutting-edge AI technology. 

CURRENT DATE & TIME: ${dateString}, pukul ${timeString} WIB

CORE PERSONALITY:
- Friendly, supportive, and encouraging learning companion
- Respond naturally to greetings (e.g., "Halo! Ada yang bisa saya bantu dengan pembelajaran Anda hari ini?")
- Think step by step, analyze problems thoroughly, and provide detailed explanations
- Help students understand concepts at a fundamental level with clear reasoning
- Always maintain a positive, patient, and educational tone

CAPABILITIES:
- Deep reasoning and analytical thinking
- Comprehensive subject matter expertise
- Personalized learning guidance
- Problem-solving assistance
- Study strategy recommendations`

      : `You are GenEdu Agent, a helpful and friendly AI learning assistant designed to support students in their educational journey.

CURRENT DATE & TIME: ${dateString}, pukul ${timeString} WIB

CORE PERSONALITY:
- Warm, approachable, and encouraging learning companion
- Respond naturally to casual conversations and greetings (e.g., "Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu dengan belajar hari ini?")
- Provide clear, concise answers while being conversational and supportive
- Adapt your tone to match the user's communication style
- Always maintain enthusiasm for learning and education

CAPABILITIES:
- Expert knowledge across various academic subjects
- Personalized learning support and guidance
- Study tips and learning strategies
- Homework and assignment assistance
- Educational resource recommendations

user info:
User got final exam (UAS):
Basic Statistics
Kamis, 26 Juni 2025 (Projek)
Interaksi Manusia dan Komputer
Selasa, 1 Juli 2025, 10.30-12.30 (Presentasi)
Software Engineering
Wednesday, 2 July 2025, 1:00 - 3:30 (Presentation)
Introduction to AI
Rabu, 2 Juli 2025, 13.00-15.00 (Tertulis)
Pengujian dan Penjaminan Kualitas Perangkat Lunak
Wednesday, 2 July 2025 (Project)
Object-oriented Programming
Kamis, 3 Juli 2025 08.00-10.00 (Praktik)
Operating System
Jumat, 4 Juli 2025 08.00-10.00 (Presentasi)



`

    // Prepare messages array
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...conversationHistory
    ]

    // Stream the response with better error handling
    let stream
    try {
      stream = await selectedLLM.stream(messages)
    } catch (error) {
      console.error('LLM streaming error:', error)
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }    // Create readable stream for response
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
            timestamp: new Date(),
            metadata: {
              model: useReasoning ? 'deepseek-reasoning' : 'claude-sonnet',
              responseLength: aiResponse.length
            }
          })
          chatThread.updatedAt = new Date()
          
          // Try to save to database, but don't fail if it doesn't work
          try {
            await chatThread.save()
          } catch (saveError) {
            console.error('Error saving chat thread:', saveError)
            // Continue anyway - user still gets the response
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: {"done": true, "threadId": "${chatThread.threadId}"}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          // Send error message to client
          const errorData = JSON.stringify({ 
            content: "I apologize, but I encountered an error while processing your request. Please try again.",
            error: true,
            threadId: chatThread.threadId
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.enqueue(encoder.encode(`data: {"done": true, "error": true}\n\n`))
          controller.close()
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
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'AI service is currently unavailable. Please try again later.' },
          { status: 503 }
        )
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please contact support.' },
          { status: 500 }
        )
      }
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'AI service is busy. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
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
        .select('threadId model createdAt updatedAt messages')
        .lean()

      // Add summary info for each thread
      const threadsWithSummary = threads.map(thread => ({
        ...thread,
        messageCount: thread.messages?.length || 0,
        lastMessage: thread.messages?.length > 0 
          ? thread.messages[thread.messages.length - 1].content.substring(0, 100) + '...'
          : 'No messages'
      }))

      return NextResponse.json({ success: true, threads: threadsWithSummary })
    }

  } catch (error) {
    console.error('Get chat threads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat threads' },
      { status: 500 }
    )
  }
}
