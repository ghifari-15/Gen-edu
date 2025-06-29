import { NextRequest, NextResponse } from 'next/server'
import RAGService from '@/lib/services/rag-service'

export async function POST(request: NextRequest) {
  let ragService: RAGService | null = null
  
  try {
    const { query, question, limit = 5, stream = false, includeMemory = true } = await request.json()
    const userQuery = query || question

    if (!userQuery || typeof userQuery !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Query is required and must be a string'
      }, { status: 400 })
    }

    ragService = new RAGService()

    // Handle streaming requests
    if (stream) {
      const encoder = new TextEncoder()
      let fullAnswer = ''
      let sources: any[] = []
      let confidence = 0

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const data of ragService!.queryRAGStream(userQuery, limit, { includeMemory })) {
              if (data.sources && data.confidence !== undefined) {
                // Initial metadata
                sources = data.sources
                confidence = data.confidence
                
                const metadata = JSON.stringify({
                  type: 'metadata',
                  sources: data.sources,
                  confidence: data.confidence
                })
                controller.enqueue(encoder.encode(`data: ${metadata}\n\n`))
              }
              
              if (data.chunk) {
                fullAnswer += data.chunk
                const chunkData = JSON.stringify({
                  type: 'chunk',
                  content: data.chunk
                })
                controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`))
              }
              
              if (data.isComplete) {
                const completionData = JSON.stringify({
                  type: 'complete',
                  fullAnswer,
                  sources,
                  confidence,
                  success: true
                })
                controller.enqueue(encoder.encode(`data: ${completionData}\n\n`))
                controller.close()
                return
              }
            }
          } catch (error) {
            console.error('RAG streaming error:', error)
            const errorData = JSON.stringify({
              type: 'error',
              content: 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.',
              success: false
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
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
    }

    // Handle non-streaming requests (legacy)
    const result = await ragService.queryRAG(userQuery, limit, { includeMemory })

    return NextResponse.json({
      success: true,
      answer: result.answer,
      relevantKnowledge: result.sources,
      confidence: result.confidence,
      data: result
    })
  } catch (error) {
    console.error('RAG query error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process your question'
    }, { status: 500 })
  } finally {
    if (ragService) {
      await ragService.close()
    }
  }
}

export async function DELETE(request: NextRequest) {
  let ragService: RAGService | null = null
  
  try {
    ragService = new RAGService()
    ragService.clearMemory()
    
    return NextResponse.json({
      success: true,
      message: 'Conversation memory cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing memory:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to clear memory'
    }, { status: 500 })
  } finally {
    if (ragService) {
      await ragService.close()
    }
  }
}

export async function GET(request: NextRequest) {
  let ragService: RAGService | null = null
  
  try {
    ragService = new RAGService()
    const memory = ragService.getMemory()
    
    return NextResponse.json({
      success: true,
      memory: memory,
      count: memory.length
    })
  } catch (error) {
    console.error('Error getting memory:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to get memory'
    }, { status: 500 })
  } finally {
    if (ragService) {
      await ragService.close()
    }
  }
}
