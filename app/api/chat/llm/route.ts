import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/auth/verify-token'
import { ChatOpenAI } from '@langchain/openai'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyUserToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, context = "You are a helpful AI assistant." } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'Message is required and must be a string' 
      }, { status: 400 })
    }

    try {
      // Use Claude 3.7 Sonnet via DeepInfra (same as RAG service)
      const llm = new ChatOpenAI({
        model: "anthropic/claude-3-7-sonnet-latest",
        apiKey: process.env.DEEPINFRA_API_KEY,
        temperature: 0.7,
        configuration: {
          baseURL: "https://api.deepinfra.com/v1/openai"
        }
      })

      const response = await llm.invoke([
        {
          role: 'system',
          content: context
        },
        {
          role: 'user',
          content: message
        }
      ])

      const aiResponse = response?.content?.toString()?.trim() || 'I apologize, but I was unable to generate a response. Please try again.'

      return NextResponse.json({
        success: true,
        response: aiResponse,
        source: 'direct_llm'
      })

    } catch (apiError) {
      console.error('LLM API error:', apiError)
      
      // Fallback to a generic helpful response
      const fallbackResponse = `I understand you're asking about "${message}". While I'm experiencing some technical difficulties accessing my AI capabilities right now, I'd be happy to help you think through this topic. 

Here are some ways I could assist:
• Help you break down the topic into key concepts
• Suggest research directions or questions to explore
• Provide general guidance on note-taking strategies
• Help organize your thoughts on this subject

Could you provide a bit more context about what specifically you'd like to explore or learn about this topic?`

      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        source: 'fallback'
      })
    }

  } catch (error) {
    console.error('LLM endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process request'
    }, { status: 500 })
  }
}
